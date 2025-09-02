import redisClient from "../db_connection/redis_db";
import type { IFetchAssetDetails } from "../types";

type IAssetFetch = {
    ask : string,
    bid : string
};

export async function getLatestAssetPrice (asset: string) : Promise<IFetchAssetDetails>{
    const assetPrice = await redisClient.hgetall(`asset:${asset}`) as unknown as IAssetFetch;
    const payload = {ask_price : Number(assetPrice.ask) , bid_price : Number(assetPrice.bid)};
    return payload;
}