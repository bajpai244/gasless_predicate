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

const txId= "0x82c7dd082caf53462132e8a558e162741b28dd7f3f766cc8627cb908f461992f";
const provider = await Provider.create(LOCAL_FUEL_NETWORK);

const tx = await provider.getTransaction(txId);
console.log(tx);
}

main();