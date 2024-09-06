import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, Signer, uint64ToBytesBE, Wallet, ZeroBytes32 } from "fuels";
import {config} from "dotenv"
import { DummyStablecoin, DummyStablecoinFactory, GaslessWallet } from "./predicates";

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

const coins = (await wallet.getCoins()).coins;
const coinsToBurn = coins.filter((coin) => {
    return coin.assetId !== provider.getBaseAssetId();
});

const maxFee = bn(10000)
const gasCoin = coins.find((coin) => {
    return coin.assetId === provider.getBaseAssetId() && coin.amount >= maxFee
})
if (!gasCoin) {
    throw new Error('No valid coin found for gas payment.');
}

const scriptRequest = new ScriptTransactionRequest({
    gasLimit: 100000,
    maxFee
});

scriptRequest.addCoinInput(coinsToBurn[0]);
scriptRequest.addCoinInput(gasCoin);
scriptRequest.addCoinOutput(Address.fromAddressOrString(ZeroBytes32), coinsToBurn[0].amount, coinsToBurn[0].assetId)

await wallet.populateTransactionWitnessesSignature(scriptRequest);

console.log("script requst, inputs", scriptRequest.inputs);

// await wallet.populateTransactionWitnessesSignature();

const response = await (await (wallet.sendTransaction(scriptRequest))).waitForResult();
console.log('response', response.id);
}

main();