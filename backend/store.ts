import { TradeManager } from "./auto_sell/trade_manager";
import type { IUserOrders, Users } from "./types";

export const users : Users = {};
export const buy_orders : IUserOrders = {}; // Consits of all users buy orders
export const tradeManager : Record<string, TradeManager>  = {};