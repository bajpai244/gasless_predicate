import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, uint64ToBytesBE, Wallet } from "fuels";
import {config} from "dotenv"
import {DbgExample} from "./predicates/scripts/index"
import {writeFileSync, readFileSync} from "node:fs"
import { calculatePayloadHash } from "./lib";

config();

const main = async () => {

// Create a provider.
const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
if (!LOCAL_FUEL_NETWORK) {
    console.error('LOCAL_FUEL_NETWORK_URL is not defined in the environment variables.');
    process.exit(1);
}

const scriptByteCodeHash = readFileSync('./gasless_predicate/out/debug/dbg_example-bin-hash', 'utf8').trim();

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

const coins  = (await wallet.getCoins()).coins;
console.log("coins are,", coins);

const script = new DbgExample(wallet);
script.setConfigurableConstants({
    PUBLIC_KEY: wallet.publicKey
});

const tx =  script.functions.main([0],[1]);
tx.callParams({gasLimit: 100000});

const request = await tx.getTransactionRequest();
request.addCoinInput(coins[0]);
request.addCoinOutput(recipientAddress, 10, coins[0].assetId);

writeFileSync("./tx.json",JSON.stringify(request.toTransaction()));

const payloadHash = calculatePayloadHash({
    request,
    inputIndexes: [0],
    scriptByteCodeHash,
    outputIndexes: [1],
})

console.log("payloadHash", payloadHash);

const call = await tx.call();

console.log('call sent ...');
const response = await call.waitForResult();

console.log('tx_id: ', response.transactionId);
console.log('return value: ', response.value);
console.log("transaction logs", response.logs);

const signature = await wallet.signMessage(payloadHash);
console.log('digital signature', signature);


}

main();