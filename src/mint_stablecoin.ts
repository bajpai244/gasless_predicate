import { Address, B256Coder, BigNumberCoder, bn, NumberCoder, Provider, Script, ScriptTransactionRequest, sha256, Signer, toB256, uint64ToBytesBE, Wallet, ZeroBytes32 } from "fuels";
import {config} from "dotenv"
import { DummyStablecoin, DummyStablecoinFactory, GaslessPredicate } from "./predicates";

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

const gaslessPredicate = new GaslessPredicate({provider, configurableConstants: {PUBLIC_KEY: wallet.publicKey}});

if(!process.env.STABLE_COIN_CONTRACT_ADDRESS) {
    console.error('STABLE_COIN_CONTRACT_ADDRESS is not defined in the environment variables.');
    process.exit(1);
}

const stableCoinAddress = process.env.STABLE_COIN_CONTRACT_ADDRESS;

const stableCoin = new DummyStablecoin(stableCoinAddress, wallet);

// console.log("total balance: ",await (await stableCoin.functions.total_supply.isReadOnly).waitForResult());
// return ;

const address = gaslessPredicate.address;
const call = stableCoin.functions.mint({Address: {
    bits: address.toB256()
}}, undefined ,bn (100));

call.callParams({gasLimit: 100000});

const callResult = await (await call.call()).waitForResult();

console.log('callResult', callResult);


// const coins  = (await wallet.getCoins()).coins;
// console.log("coins are,", coins);

// const predicate = new GaslessWallet(wallet);
// console.log(predicate.address);

// const tx = new ScriptTransactionRequest();
}

main();