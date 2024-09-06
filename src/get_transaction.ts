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

const txId= "2806719fee2ae040dc6d6cc6b5c39b4f9e4e491875152a2b441c9d586f4936fb";
const provider = await Provider.create(LOCAL_FUEL_NETWORK);

const tx = await provider.getTransaction(txId);

console.log(tx)
}

main();