import { Address, B256Coder, bn, createAssetId, Provider, ScriptTransactionRequest, sha256, Signer, Wallet } from "fuels";
import { config } from "dotenv"
import { calculaatePayloadHashNew, calculatePayloadHash } from "./lib";
import { GaslessWallet } from "./predicates";
import type { OutputCoinInput, TxInputInput } from "./predicates/scripts/DbgExample";
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

const STABLE_COIN_CONTRACT_ADDRESS = process.env.STABLE_COIN_CONTRACT_ADDRESS;
if (!STABLE_COIN_CONTRACT_ADDRESS) {
    throw new Error('STABLE_COIN_CONTRACT_ADDRESS is not defined in the environment variables.');
}

const defaultSubId = "0x0000000000000000000000000000000000000000000000000000000000000000"
const predicateAssetId = createAssetId(STABLE_COIN_CONTRACT_ADDRESS, defaultSubId);

const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);
const signer = new Signer(PRIVATE_KEY);

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
    maxFee: 50000,
});

const gaslessPredicate = new GaslessWallet({
    provider, configurableConstants: {PUBLIC_KEY: wallet.publicKey }
});

const gaslessPredicateAddress = gaslessPredicate.address;
console.log("predicate address: ", gaslessPredicateAddress.toAddress());

const predicateCoins = (await provider.getCoins(gaslessPredicate.address)).coins;

const predicateInputCoin = predicateCoins.find((coin)=>{
    return coin.assetId === predicateAssetId.bits
});
if (!predicateInputCoin) {
    throw new Error('No valid input coin found for predicate.');
}

console.log("Valid input coin for predicate:", predicateInputCoin);

const amount = bn(10);
const assetId = predicateInputCoin.assetId;

// NOTE: This line just adds the output coin
gaslessPredicate.addTransfer(scriptTransaction, {
    destination: recipientAddress,
    amount,
    assetId
 });

 const inputCoinTxId = predicateInputCoin.id.slice(0, predicateInputCoin.id.length - 4)
 const inputCoinOutputIndex = Number.parseInt(predicateInputCoin.id.slice(predicateInputCoin.id.length -4), 16)


 const inputTxs: Array<TxInputInput> = [
    {InputCoin: {
   tx_id: inputCoinTxId,
   output_index: inputCoinOutputIndex
 }}];


 const expectedOutputs: Array<TxOutputInput> = [
    {OutputCoin:{
    to: { bits: recipientAddress.toHexString() },
    amount,
    asset_id: {
      bits: assetId
    }}
  }];

  const payloadHash = calculaatePayloadHashNew(inputTxs, expectedOutputs);
  const signtare = signer.sign(payloadHash);


gaslessPredicate.predicateData[0] = inputTxs;
gaslessPredicate.predicateData[1] = expectedOutputs;
gaslessPredicate.predicateData[2] = signtare;

scriptTransaction.addCoinInput(predicateCoins[0]);
gaslessPredicate.populateTransactionPredicateData(scriptTransaction);

const estimations = await provider.estimatePredicates(scriptTransaction);

scriptTransaction.addCoinInput(gasInputCoin);

await wallet.populateTransactionWitnessesSignature(scriptTransaction);

// console.log("outputs:", scriptTransaction.outputs);
// console.log("witness:", scriptTransaction.witnesses);

console.log('predicate size', gaslessPredicate.bytes.length);

const response = await (await wallet.sendTransaction(scriptTransaction)).waitForResult();
console.log("response: ", response.id);
console.log("gas used", response.gasUsed);

}

main();