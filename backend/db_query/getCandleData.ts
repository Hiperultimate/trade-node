import { sql } from "bun";
import timescaleClient from "../db_connection/timescale_db";
import {
  CandleDuration,
  type CandleTable,
  type ICandleDuration,
} from "../types";

export async function getCandleData(
  asset: string,
  duration: ICandleDuration,
  startTime: Date,
  endTime: Date
) {
  const recordLimit = 50;
  let tableName: CandleTable;

  switch (duration) {
    case CandleDuration.OneMinute:
      tableName = "candlestick_1m";
      break;
    case CandleDuration.FiveMinutes:
      tableName = "candlestick_5m";
      break;
    case CandleDuration.FifteenMinutes:
      tableName = "candlestick_15m";
      break;
    case CandleDuration.ThirtyMinutes:
      tableName = "candlestick_30m";
      break;
    default:
      throw new Error("Unsupported duration");
  }

  const rows = await timescaleClient`
    SELECT *
    FROM ${sql(tableName)}
    WHERE symbol = ${asset}
      AND bucket >= ${startTime}
      AND bucket <= ${endTime}
    ORDER BY bucket ASC
    LIMIT ${recordLimit}
  `;
  return rows;
}
