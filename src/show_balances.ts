import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, Signer, uint64ToBytesBE, Wallet } from "fuels";
import {config} from "dotenv"
import {DbgExample} from "./predicates/scripts/index"
import {writeFileSync, readFileSync} from "node:fs"
import { calculatePayloadHash } from "./lib";
import { GaslessWallet } from "./predicates";

config();

const main = async () => {

// Create a provider.
const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
if (!LOCAL_FUEL_NETWORK) {
    console.error('LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.');
    process.exit(1);
}

const provider = await Provider.create(LOCAL_FUEL_NETWORK);

// Create our wallet (with a private key).
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error('PRIVATE_KEY is not defined in the environment variables.');
    process.exit(1);
}

const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

if (!process.env.RECIPIENT_ADDRESS) {
    console.error('RECIPIENT_ADDRESS is not defined in the environment variables.');
    process.exit(1);
}
const recipientAddress = Address.fromAddressOrString(process.env.RECIPIENT_ADDRESS);

console.log('wallet balances', await wallet.getBalances());
console.log('predicate balances', await provider.getBalances(recipientAddress));

}

main();