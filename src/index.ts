import { Address, bn, Provider, ScriptTransactionRequest, Wallet } from "fuels";
import {config} from "dotenv"

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

const coins = await wallet.getCoins();
console.log(coins);

const coinToUse= coins.coins[0];

const request = new ScriptTransactionRequest({
    gasLimit: 100000000000000
});


request.addCoinInput(coinToUse);
request.addCoinOutput(recipientAddress, bn(10), coinToUse.assetId);

// const result = await (await wallet.sendTransaction(request)).wait();
// console.log(result.transaction.txPointer);
// console.log(result.transaction.outputs);

const block = await provider.getBlockWithTransactions("latest");
const tx = await provider.getTransaction(block?.transactionIds[0]);
// console.log("block:", block?.transactions[0]);
console.log("tx:", tx);
}

main();