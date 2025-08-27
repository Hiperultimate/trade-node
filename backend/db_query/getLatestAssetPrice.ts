import timescaleClient from "../db_connection/timescale_db";
import type { IFetchAssetDetails } from "../types";

export async function getLatestAssetPrice (asset: string) {
    const data = await timescaleClient`SELECT * FROM quotes WHERE symbol=${asset} ORDER BY time DESC LIMIT 1;` as IFetchAssetDetails;
    return data[0]!;
}