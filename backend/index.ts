import express, {
  type NextFunction,
  type Request,
  type Response,
} from "express";
import cors from "cors";
import { userBalance, users } from "./store";
import jwt from "jsonwebtoken";
import { getLatestAssetPrice } from "./db_query/getLatestAssetPrice";
import { checkUserTokenLimit } from "./db_query/checkUserTokenLimit";
import { deductUserBalance } from "./db_query/deductUserBalance";
import { giveUserAsset } from "./db_query/giveUserAsset";

const app = express();
const port = 8080;
const privateKey = process.env.JWT_SECRET || "jwt_unique_pass";

app.use(cors());
app.use(express.json());

const auth = (req: Request, res: Response, next: NextFunction) => {
  console.log("Checking req : ", req.headers.auth_token);
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

  if (users[token_username] !== token_password) {
    res.status(404).send({ message: "Invalid auth token. Bad request." });
  }

  next();
};

app.post("/signup", (req, res) => {
  const username = req.body.username;
  const password = req.body.password;

  // Check from DB if username is already taken
  if (users[username]) {
    res.status(400).send({ message: "User already has an account" });
    return;
  }

  users[username] = password;
  userBalance[username] = {balance : {"USD" : {qty: 10000}}}
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

  if (users[username] !== password) {
    res.status(404).send({ message: "User password incorrect" });
    return;
  }

  const token = jwt.sign({ username, password }, privateKey);

  res.json({ auth_token: token });
});

// API endpoint to buy an order
app.post("/order/open", auth,  async (req,res) => {
    // Ignoring stopLoss and takeProfit for now
    let { type, qty, asset, stopLoss, takeProfit, username } = req.body;
    qty = Number(qty);

    if(type === "buy"){
        // get asset details like asset price
        const assetDetails = await getLatestAssetPrice('BTC');
        const totalPrice = assetDetails.ask_price * qty;

        // check how much usd does user holds
        const isBalanceEnough = await checkUserTokenLimit(username, "USD", totalPrice);
        if(!isBalanceEnough) res.status(404).send({message: "Insufficient funds..."});


        // When doing something like this, its better to run a transaction through your DB so it reverts everything in case it fails.
        // For now this will do
        const isBalanceDeducted = await deductUserBalance(username, 'USD', totalPrice);
        const isAssetTransferred = await giveUserAsset(username,asset,qty);

        if(!(isBalanceDeducted && isAssetTransferred)){
            res.status(404).send({message : "Something went wrong..."});
        }

        console.log("Checking balance : ", userBalance[username]);

        res.status(200).send({message : "Balance transferred successfully"});
    }
})

app.get("/check", auth, (req, res) => {
  res.status(200).send({ message: "Checking auth middleware.." });
});

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});
