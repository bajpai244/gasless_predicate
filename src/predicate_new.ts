import { Address, bn, Provider, ScriptTransactionRequest, sha256, Signer, Wallet } from "fuels";
import { config } from "dotenv"
import { calculatePayloadHash } from "./lib";
import { GaslessWallet } from "./predicates";
import type { OutputCoinInput } from "./predicates/scripts/DbgExample";
import type { TxOutputInput } from "./predicates/predicates/GaslessWallet";

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

const recipientAddress = wallet.address;

const coins  = (await wallet.getCoins()).coins;
const gasInputCoin = coins.find((coin) => {
    return coin.assetId === provider.getBaseAssetId();
})

if (!gasInputCoin) {
    throw new Error('No valid input coin found for gas payment.');
}

console.log("valid input coin for gas,", gasInputCoin);

const scriptTransaction = new ScriptTransactionRequest({
    gasLimit: 1000000,
    maxFee: 1000,
});

const gaslessPredicate = new GaslessWallet({
    provider, configurableConstants: {PUBLIC_KEY: wallet.publicKey }
});

const gaslessPredicateAddress = gaslessPredicate.address;
console.log("predicate address: ", gaslessPredicateAddress.toAddress());

const predicateCoins = (await provider.getCoins(gaslessPredicate.address)).coins;
const amount = bn(10);
const assetId = predicateCoins[0].assetId;

// NOTE: This line just adds the output coin
gaslessPredicate.addTransfer(scriptTransaction, {
    destination: recipientAddress,
    amount,
    assetId
 });

 const expectedOutputs: Array<TxOutputInput> = [
    {OutputCoin:{
    to: { bits: recipientAddress.toHexString() },
    amount,
    asset_id: {
      bits: assetId
    }}
  }];


gaslessPredicate.predicateData[0] = expectedOutputs;

scriptTransaction.addCoinInput(predicateCoins[0]);
gaslessPredicate.populateTransactionPredicateData(scriptTransaction);
await provider.estimatePredicates(scriptTransaction);

scriptTransaction.addCoinInput(gasInputCoin);

await wallet.populateTransactionWitnessesSignature(scriptTransaction);

console.log("inputs: ", scriptTransaction.inputs);
console.log("outputs:", scriptTransaction.outputs);
console.log("witness:", scriptTransaction.witnesses);

console.log('predicate size', gaslessPredicate.bytes.length);

const response = await (await wallet.sendTransaction(scriptTransaction)).waitForResult();
console.log("response: ", response);
}

main();