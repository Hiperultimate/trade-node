import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { holdingPositions, users } from "./store";
import jwt from "jsonwebtoken";
import { getLatestAssetPrice } from "./db_query/getLatestAssetPrice";
import { checkUserTokenLimit } from "./db_query/checkUserTokenLimit";
import { deductUserBalance } from "./db_query/deductUserBalance";
import { getUserBalance } from "./db_query/getUserBalance";
import { getUserOrders } from "./db_query/getUserOrders";
import { getCandleData } from "./db_query/getCandleData";
import type { CandleQuery, ICandleDuration } from "./types";
import { initiateTradeManager } from "./auto_sell/run";
import createPosition from "./db_query/createPosition";
import { removeAssetAndTransferBalance } from "./db_query/removeAssetAndTransferBalance";

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

  if(username.trim().length === 0 || password.trim().length === 0){
    res.status(404).send({message : "Invalid username or password"})
    return;
  }

  if (!users[username]) {
    res.status(404).send({
      message: "User does not have an account, please signup",
    });
    return;
  }

  const userBalance = users[username]?.balance;

  if (users[username].password !== password) {
    res.status(401).send({ message: "User password incorrect"});
    return;
  }

  const token = jwt.sign({ username, password }, privateKey);

  res.status(200).send({ auth_token: token, balance: userBalance });
});

// API endpoint to buy an order
app.post("/order/open", auth, async (req, res) => {
  // Ignoring stopLoss and takeProfit for now
  let { type, qty, asset, stopLoss, takeProfit, username, leverage } = req.body;
  qty = Number(qty);
  stopLoss = Number(stopLoss);
  takeProfit = Number(takeProfit);
  leverage = Number(leverage);

  if (leverage < 0 || leverage > 100) {
    res.status(404).send({ message: "Invalid leverage selected. Please choose between or at 1-100" });
    return;
  }

  // get asset details like asset price
  const assetDetails = await getLatestAssetPrice(asset);
  const totalPrice = assetDetails.ask_price * qty;

  // check how much usd does user holds
  const isBalanceEnough = await checkUserTokenLimit(
    username,
    "USD",
    totalPrice
  );
  if (!isBalanceEnough){
    res.status(404).send({ message: "Insufficient funds..." });
    return;
  }

  const isBalanceDeducted = await deductUserBalance(
    username,
    "USD",
    totalPrice
  );

  // When doing something like this, its better to run a transaction through your DB so it reverts everything in case it fails.
  // For now this will do

  // Transfers asset to user
  const assetId = createPosition(
    username,
    asset,
    type === "buy" ? assetDetails.ask_price : assetDetails.bid_price,
    totalPrice,
    qty,
    stopLoss,
    takeProfit,
    leverage,
    type
  );


  if (!(isBalanceDeducted || assetId === undefined)) {
    res.status(404).send({ message: "Something went wrong..." });
    return
  }

  if (type === "buy") {
    res.status(200).send({ message: "Asset bought successfully", id: assetId });
    return;
  } else {
    res.status(200).send({ message: "Asset shorted successfully", id: assetId });
    return;
  }
});

app.post("/order/close", auth, async (req, res) => {
  // Ignoring stopLoss and takeProfit for now
  let { order_id, username } = req.body;

  if(!order_id || !username){
    res.status(400).send({message : "Invalid body format"});
    return;
  }
  const orderDetails = holdingPositions[username]?.find((item) => item.order_id === order_id);

  if (!orderDetails) {
    res.status(404).send({ message: "Order not found..." });
    return;
  }

  const { asset , type } = orderDetails;

  // get asset details like asset price
  const {ask_price, bid_price} = await getLatestAssetPrice(asset);

  // When doing something like this, its better to run a transaction through your DB so it reverts everything in case it fails.
  // For now this will do
  let exitPrice :number ;
  if(type === "buy"){
    exitPrice = bid_price;
  }else{
    exitPrice = ask_price;
  }
  const isAssetRemovedAndBalanceTransferred = await removeAssetAndTransferBalance(username, order_id, exitPrice);

  if (!isAssetRemovedAndBalanceTransferred) {
    res.status(404).send({ message: "Something went wrong..." });
  }

  res
    .status(200)
    .send({ message: "Asset sold successfully", asset: {ask_price , bid_price} });
});

interface UserOrder {
  username: string;
}

app.get("/order", async (req: Request<{}, {}, {}, UserOrder>, res) => {
  // Need to encrypt and decrypt user auth token so that we can get unique user field and check if the current user is asking for their data and no one else
  const username = req.query.username;
  const userBalance = await getUserBalance(username);
  const userOrder = await getUserOrders(username);

  res.status(200).send({ balance : userBalance, userOrders : userOrder });
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
