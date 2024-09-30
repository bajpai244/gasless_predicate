import { Provider, Wallet } from "fuels";
import {config} from "dotenv"
import { GaslessPredicate  } from "./predicates";

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

const gaslessPredicate = new GaslessPredicate({
    provider, configurableConstants: {PUBLIC_KEY: wallet.publicKey }
});
const predicateAddresss = gaslessPredicate.address;

console.log('wallet balances', await wallet.getBalances());
console.log('predicate balances', await provider.getBalances(predicateAddresss));
}

main();