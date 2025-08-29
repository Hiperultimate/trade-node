import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { buy_orders, tradeManager, users } from "./store";
import jwt from "jsonwebtoken";
import { getLatestAssetPrice } from "./db_query/getLatestAssetPrice";
import { checkUserTokenLimit } from "./db_query/checkUserTokenLimit";
import { deductUserBalance } from "./db_query/deductUserBalance";
import { giveUserAsset } from "./db_query/giveUserAsset";
import { getUserBalance } from "./db_query/getUserBalance";
import { getUserOrders } from "./db_query/getUserOrders";
import { removeAssetFromUser } from "./db_query/removeAssetFromUser";
import { transferRequiredBalanceAmt } from "./db_query/transferRequiredBalanceAmt";
import { getCandleData } from "./db_query/getCandleData";
import type { CandleQuery, ICandleDuration } from "./types";
import { initiateTradeManager } from "./auto_sell/run";

const app = express();
const port = 8080;
const privateKey = process.env.JWT_SECRET || "jwt_unique_pass";

app.use(cors());
app.use(express.json());

const auth = (req: Request, res: Response, next: NextFunction) => {
  const auth_token = req.headers.auth_token as string | undefined;
  if (!auth_token) {
    return res.status(401).send({ message: "Missing auth token" });
  }

  let token: any;
  try {
    token = jwt.verify(auth_token, privateKey);
  } catch (err) {
    console.error("JWT verify error:", err);
    return res.status(403).json({ message: "Invalid or expired auth token" });
  }
  const token_username = token.username;
  const token_password = token.password;

  if (users[token_username]?.password !== token_password) {
    res.status(404).send({ message: "Invalid auth token. Bad request." });
  }

  next();
};

app.post("/signup", (req, res) => {
  const username = req.body.username as string;
  const password = req.body.password as string;

  // Check from DB if username is already taken
  if (users[username]) {
    res.status(400).send({ message: "User already has an account" });
    return;
  }

  users[username] = {
    password: password,
    balance: { USD: { qty: 10000 } },
    user_orders: [],
  };
  res.status(200).send({ message: "User account created successfully!" });
});

app.post("/signin", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (!users[username]) {
    res.send({
      message: "User does not have an account, please signup",
      status: 404,
    });
    return;
  }

  if (users[username].password !== password) {
    res.status(404).send({ message: "User password incorrect" });
    return;
  }

  const token = jwt.sign({ username, password }, privateKey);

  res.json({ auth_token: token });
});

// API endpoint to buy an order
app.post("/order/open", auth, async (req, res) => {
  // Ignoring stopLoss and takeProfit for now
  let { type, qty, asset, stopLoss, takeProfit, username } = req.body;
  qty = Number(qty);

  if (type === "buy") {
    // get asset details like asset price
    const assetDetails = await getLatestAssetPrice("BTC");
    const totalPrice = assetDetails.ask_price * qty;

    // check how much usd does user holds
    const isBalanceEnough = await checkUserTokenLimit(
      username,
      "USD",
      totalPrice
    );
    if (!isBalanceEnough)
      res.status(404).send({ message: "Insufficient funds..." });

    // When doing something like this, its better to run a transaction through your DB so it reverts everything in case it fails.
    // For now this will do
    const isBalanceDeducted = await deductUserBalance(
      username,
      "USD",
      totalPrice
    );
    const assetId = await giveUserAsset(
      username,
      asset,
      assetDetails.ask_price,
      1,
      qty
    );

    if (stopLoss && takeProfit) {
      tradeManager[asset]?.addOrder(assetId!, stopLoss, takeProfit);
    }

    if (!(isBalanceDeducted || assetId === undefined)) {
      res.status(404).send({ message: "Something went wrong..." });
    }

    res.status(200).send({ message: "Asset bought successfully", id: assetId });
  }
});

app.post("/order/close", auth, async (req, res) => {
  // Ignoring stopLoss and takeProfit for now
  let { order_id } = req.body;
  const orderDetails = buy_orders[order_id];

  if (!orderDetails) {
    res.status(404).send({ message: "Order not found..." });
    return;
  }

  const { type, qty, username } = orderDetails;

  if (type === "buy") {
    // get asset details like asset price
    const assetDetails = await getLatestAssetPrice("BTC");
    const totalPrice = assetDetails.ask_price * qty;

    // When doing something like this, its better to run a transaction through your DB so it reverts everything in case it fails.
    // For now this will do

    const isAssetRemoved = await removeAssetFromUser(username, order_id);
    const isBalanceTransfered = await transferRequiredBalanceAmt(
      username,
      totalPrice
    );

    if (!(isAssetRemoved && isBalanceTransfered)) {
      res.status(404).send({ message: "Something went wrong..." });
    }

    res
      .status(200)
      .send({ message: "Asset sold successfully", asset: assetDetails });
  }
});

interface UserOrder {
  username: string;
}

app.get("/order", async (req: Request<{}, {}, {}, UserOrder>, res) => {
  // Need to encrypt and decrypt user auth token so that we can get unique user field and check if the current user is asking for their data and no one else
  const username = req.query.username;
  const userBalance = await getUserBalance(username);
  const userOrder = await getUserOrders(username);

  res.status(200).send({ ...userBalance, ...userOrder });
});

app.get("/candles", async (req: Request<{}, any, any, CandleQuery>, res) => {
  let {
    asset,
    duration: durationRaw,
    startTime: startTimeRaw,
    endTime: endTimeRaw,
  } = req.query;
  const VALID_DURATIONS: ICandleDuration[] = ["1m", "5m", "15m", "30m"];
  // Validate duration
  if (!VALID_DURATIONS.includes(durationRaw as ICandleDuration)) {
    return res
      .status(400)
      .json({ error: "Invalid duration. Use 1m|5m|15m|30m" });
  }
  const duration = durationRaw as ICandleDuration;

  const start = new Date(startTimeRaw);
  const end = new Date(endTimeRaw);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return res.status(400).json({ error: "Invalid startTime or endTime" });
  }
  if (start > end) {
    return res.status(400).json({ error: "startTime must be <= endTime" });
  }

  try {
    const rows = await getCandleData(asset, duration, start, end);
    return res.json(rows);
  } catch (err) {
    console.error("getCandleData error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
  initiateTradeManager(); // Once DB is out we can transfer this logic to another server for better scaling
});
