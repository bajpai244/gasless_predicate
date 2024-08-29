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

const provider = await Provider.create(LOCAL_FUEL_NETWORK);
 
// Create our wallet (with a private key).
const PRIVATE_KEY = process.env.PRIVATE_KEY;
if (!PRIVATE_KEY) {
    console.error('PRIVATE_KEY is not defined in the environment variables.');
    process.exit(1);
}

if (!process.env.RECIPIENT_ADDRESS) {
    console.error('RECIPIENT_ADDRESS is not defined in the environment variables.');
    process.exit(1);
}
const recipientAddress = Address.fromAddressOrString(process.env.RECIPIENT_ADDRESS);

const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

const coins  = (await wallet.getCoins()).coins;
console.log("coins are,", coins);

const script = new DbgExample(wallet);
const tx =  script.functions.main([0],[1]);

const request = await tx.getTransactionRequest();
request.addCoinInput(coins[0]);
request.addCoinOutput(recipientAddress, 10, coins[0].assetId);

tx.callParams({gasLimit: 100000});

writeFileSync("./tx.json",JSON.stringify(request.toTransaction()));

const call = await tx.call();


console.log('call sent', call);
const response = await call.waitForResult();

console.log('response, ', response);



// const block = await provider.getBlockWithTransactions("latest");
// console.log("block:", block?.transactions[0]);
}

main();