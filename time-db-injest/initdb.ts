import { readFileSync } from "fs";
import { SQL } from "bun";

// Read SQL file into a string
const initSql = readFileSync("./init_timescale.sql", "utf-8");


async function main(){
    if(!process.env.TIMESCALE_DB) throw new Error("Cannot find Redis DB");
    const client = new SQL(process.env.TIMESCALE_DB);

    await client.connect();

    await client.unsafe(initSql);
    
    // Execute the SQL commands
    
    console.log("Database initialized with SQL script.");

    await client.end();

}

main();
