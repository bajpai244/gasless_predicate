import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, uint64ToBytesBE, Wallet } from "fuels";
import {config} from "dotenv"
import {DbgExample} from "./predicates/scripts/index"
import {writeFileSync, readFileSync} from "node:fs"

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
script.setConfigurableConstants({
    PUBLIC_KEY: wallet.publicKey
});
const tx =  script.functions.main([0],[1]);

const request = await tx.getTransactionRequest();
request.addCoinInput(coins[0]);
request.addCoinOutput(recipientAddress, 10, coins[0].assetId);

tx.callParams({gasLimit: 100000});

writeFileSync("./tx.json",JSON.stringify(request.toTransaction()));

const call = await tx.call();

console.log('call sent ...');
const response = await call.waitForResult();

console.log('tx_id: ', response.transactionId);
console.log('return value: ', response.value);

const transaction = await provider.getTransaction(response.transactionId);

/// we try to get to the same transaction hash below

const inputCoin = coins[0];
const inputCoinId = inputCoin.id.slice(0, inputCoin.id.length - 4);
console.log("inputCoinId: ", inputCoinId);
/// The bytes will be big endian
const b256Coder = new B256Coder();
const u64Coder= new BigNumberCoder('u64');

const inputCoinBytes = b256Coder.encode(inputCoinId);

const scriptHash = readFileSync('./gasless_predicate/out/debug/dbg_example-bin-hash', 'utf8').trim();
const scriptHashBytes = b256Coder.encode(scriptHash);

console.log("inputBytes", inputCoinBytes);
console.log("scriptHashBytes", scriptHashBytes);

if(!transaction?.outputs) {
    console.error('Error: No transaction output found.');
    process.exit(1);
}
const outputCoin = transaction?.outputs[1];
if(outputCoin.type !== 0) {
    console.error("Error: Unexpected output coin type. Expected type 0 (Coin), but got type", outputCoin.type);
    process.exit(1);
}
console.log('outputs', outputCoin);

const toBytes = b256Coder.encode(outputCoin.to);
const amountBytes = u64Coder.encode(outputCoin.amount);
const assetIdBytes = b256Coder.encode(outputCoin.assetId);

const outputBytes = new Uint8Array([...toBytes, ...amountBytes, ...assetIdBytes]);

// Append all bytes to payload
const payload = new Uint8Array([
  ...inputCoinBytes,
  ...scriptHashBytes,
  ...outputBytes
]);

console.log("Final payload:", payload);
console.log("transaction logs", response.logs);

const hash = sha256(payload);
console.log("hash", hash);

const signature = await wallet.signMessage(hash);
console.log('digital signature', signature);

console.log('public key', wallet.publicKey);
}

main();