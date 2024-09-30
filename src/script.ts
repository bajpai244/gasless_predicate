import {
  B256Coder,
  bn,
  Provider,
  Signer,
  Wallet,
} from "fuels";
import { config } from "dotenv";
import { writeFileSync } from "node:fs";
import { calculaatePayloadHash } from "./lib";
import type { TxInputInput, TxOutputInput } from "./predicates/scripts/DbgExample";
import { GaslessScript } from "./predicates";

config();

const main = async () => {
  // Create a provider.
  const LOCAL_FUEL_NETWORK = process.env.LOCAL_FUEL_NETWORK_URL;
  if (!LOCAL_FUEL_NETWORK) {
    console.error(
      "LOCAL_FUEL_NETWORK_URL is not defined in the environment variables."
    );
    process.exit(1);
  }

  const provider = await Provider.create(LOCAL_FUEL_NETWORK);

  // Create our wallet (with a private key).
  const PRIVATE_KEY = process.env.PRIVATE_KEY;
  if (!PRIVATE_KEY) {
    console.error("PRIVATE_KEY is not defined in the environment variables.");
    process.exit(1);
  }

  const wallet = Wallet.fromPrivateKey(PRIVATE_KEY, provider);

  const recipientAddress = wallet.address;

  const coins = (await wallet.getCoins()).coins;
  console.log("coins are,", coins);

  const script = new GaslessScript(wallet);
  script.setConfigurableConstants({
    PUBLIC_KEY: wallet.publicKey,
  });

  const signer = new Signer(PRIVATE_KEY);


  const amount = bn(10);

  const inputCoin = coins.find((coin) => {
    return coin.assetId === provider.getBaseAssetId() && coin.amount > amount;
  });

  if (!inputCoin) {
    throw new Error("No suitable input coin found. Ensure you have sufficient funds.");
  }

  console.log('input coin:', inputCoin.id);

  const assetId = inputCoin.assetId;

  const inputCoinTxId = inputCoin.id.slice(0, inputCoin.id.length - 4)
  const inputCoinOutputIndex = Number.parseInt(inputCoin.id.slice(inputCoin.id.length -4), 16)


  const inputTxs: Array<TxInputInput> = [{InputCoin: {
    tx_id: inputCoinTxId,
    output_index: inputCoinOutputIndex
  }}];

  console.log('inputTxs:', inputTxs);

  const expectedOutputs: Array<TxOutputInput> = [
    {OutputCoin:{
    to: { bits: recipientAddress.toHexString() },
    amount,
    asset_id: {
      bits: assetId
    }}
  }];

  const payloadHash = calculaatePayloadHash(inputTxs, expectedOutputs);
  console.log('payload hash', payloadHash);

  const signature = signer.sign(payloadHash);

  console.log('script inputs for outputs: ', expectedOutputs);

  // we are setting up random arguments, which we will reset before sending the transaction
  const tx = script.functions.main(inputTxs, expectedOutputs, signature);
  tx.callParams({ gasLimit: 500000 });

  const request = await tx.getTransactionRequest();
  request.addCoinInput(inputCoin);
  request.addCoinOutput(recipientAddress, amount, assetId);
  request.addCoinOutput(recipientAddress, amount, assetId);

  writeFileSync("./tx.json", JSON.stringify(request.toTransaction()));


  const call = await tx.call();

  console.log("call sent ...");
  const response = await call.waitForResult();

  console.log("tx_id: ", response.transactionId);
  console.log("return value: ", response.value);
  console.log("transaction logs", response.logs);

  console.log("gas used", response.gasUsed);
  console.log("siganture", signature);
  console.log("payload_hash", payloadHash);


  // const sig1 = signer.sign(payloadHash);

  // console.log('signature:', sig1);
  // console.log("public key", signer.publicKey);

  // const recoverPublicKey = Signer.recoverPublicKey(payloadHash, sig1);
  // console.log('recoveredPublicKey', recoverPublicKey);
};

main();
