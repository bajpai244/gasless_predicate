import { Address, bn, Provider, Script, ScriptTransactionRequest, Wallet } from "fuels";
import {config} from "dotenv"
import {DbgExample} from "./predicates/scripts/index"
import {writeFileSync} from "node:fs"

config();

const main = async () => {

// Create a provider.
const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
if (!LOCAL_FUEL_NETWORK) {
    console.error('LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.');
    process.exit(1);
}

const txId= "0x7e90d6bb3f5cb8f26f90d0ca47fc69d3626508e232d977d6b4f25bae0d594cc2";
const provider = await Provider.create(LOCAL_FUEL_NETWORK);

const tx = await provider.getTransaction(txId);

console.log(tx)
}

main();