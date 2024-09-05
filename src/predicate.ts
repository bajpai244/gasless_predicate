import { Address, bn, Provider, ScriptTransactionRequest, sha256, Signer, Wallet } from "fuels";
import { config } from "dotenv"
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

const coins  = (await wallet.getCoins()).coins;
console.log("coins are,", coins);

const scriptTransaction = new ScriptTransactionRequest({
    gasLimit: 500000,
    maxFee: 1000,
});

const gaslessPredicate = new GaslessWallet(wallet);
gaslessPredicate.predicateData[0] = [0];
gaslessPredicate.predicateData[1] = [0];


console.log("predicate address: ", gaslessPredicate.address);

const predicateCoins = (await provider.getCoins(gaslessPredicate.address)).coins;

// NOTE: This line just adds the output coin
gaslessPredicate.addTransfer(scriptTransaction, {
   destination: wallet.address,
   amount: bn(10),
   assetId: predicateCoins[0].assetId
});

scriptTransaction.addCoinInput(predicateCoins[0]);

console.log('script transaction inputs here', scriptTransaction.inputs);
console.log('script transaction outputs here', scriptTransaction.outputs);

const payloadHash = calculatePayloadHash({request: scriptTransaction, inputIndexes: [0], outputIndexes: [0], scriptByteCodeHash: sha256(scriptTransaction.script)})
const signer = new Signer(PRIVATE_KEY);
const signature = signer.sign(payloadHash);
gaslessPredicate.predicateData[2] = signature;
gaslessPredicate.populateTransactionPredicateData(scriptTransaction);

// const predicateCoins = (await (predicate.getCoins())).coins;
console.log('predicate Coins are: ', predicateCoins);
console.log('native asset id:', provider.getBaseAssetId());

console.log('coins are', coins);
scriptTransaction.addCoinInput(coins[0]);
await wallet.populateTransactionWitnessesSignature(scriptTransaction);

if (scriptTransaction.inputs[0].type === 0){
    const input = scriptTransaction.inputs[0];
    console.log("inputs: ", scriptTransaction.inputs);
    console.log("outputs:", scriptTransaction.outputs);
    console.log("witness:", scriptTransaction.witnesses);
}

const estimations = await provider.estimatePredicates(scriptTransaction);
// console.log('estimations', estimations);
// return;

console.log('predicate size', gaslessPredicate.bytes.length);

const response = await (await wallet.sendTransaction(scriptTransaction)).waitForResult();
console.log("response: ", response);
}

main();