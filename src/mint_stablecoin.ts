import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, Signer, uint64ToBytesBE, Wallet } from "fuels";
import {config} from "dotenv"
import { DummyStablecoinFactory, GaslessWallet } from "./predicates";

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

const stableCoinFactor = new DummyStablecoinFactory(wallet);
const {contractId, waitForTransactionId} = await (await stableCoinFactor.deploy());

await waitForTransactionId();
console.log('deployed to contractId: ',contractId);

const recipientAddress = Address.fromAddressOrString(process.env.RECIPIENT_ADDRESS);

const coins  = (await wallet.getCoins()).coins;
console.log("coins are,", coins);

const predicate = new GaslessWallet(wallet);
console.log(predicate.address);

const tx = new ScriptTransactionRequest();
}

main();