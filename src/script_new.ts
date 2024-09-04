import {
  Address,
  B256Coder,
  B512Coder,
  BigNumberCoder,
  bn,
  NumberCoder,
  Provider,
  Script,
  ScriptTransactionRequest,
  sha256,
  Signer,
  uint64ToBytesBE,
  Wallet,
} from "fuels";
import { config } from "dotenv";
import { DbgExample } from "./predicates/scripts/index";
import { writeFileSync, readFileSync } from "node:fs";
import { calculatePayloadHash } from "./lib";
import type { OutputCoinInput } from "./predicates/scripts/DbgExample";

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

  if (!process.env.RECIPIENT_ADDRESS) {
    console.error(
      "RECIPIENT_ADDRESS is not defined in the environment variables."
    );
    process.exit(1);
  }
  const recipientAddress = wallet.address;

  const coins = (await wallet.getCoins()).coins;
  console.log("coins are,", coins);

  const script = new DbgExample(wallet);
  script.setConfigurableConstants({
    PUBLIC_KEY: wallet.publicKey,
  });

  const signer = new Signer(PRIVATE_KEY);

  const amount = bn(10);
  const assetId = coins[0].assetId;

  const input: OutputCoinInput = {
    to: { bits: recipientAddress.toHexString() },
    amount,
    asset_id: {
      bits: assetId
    },
  };

  console.log('script input: ', input);

  // we are setting up random arguments, which we will reset before sending the transaction
  const tx = script.functions.main([
    {OutputCoin: input},
    {OutputCoin: input}
]);
  tx.callParams({ gasLimit: 100000 });

  const request = await tx.getTransactionRequest();
  request.addCoinInput(coins[0]);
  request.addCoinOutput(recipientAddress, amount, assetId);
  request.addCoinOutput(recipientAddress, amount, assetId);

  writeFileSync("./tx.json", JSON.stringify(request.toTransaction()));

//   const payloadHash = calculatePayloadHash({
//     request,
//     inputIndexes: [0],
//     outputIndexes: [1],
//   });

//   console.log("payloadHash", payloadHash);

//   const signature = signer.sign(payloadHash);
//   console.log("digital signature", signature);

//   tx.setArguments([0], [1], signature);

  const call = await tx.call();

  console.log("call sent ...");
  const response = await call.waitForResult();

  console.log("tx_id: ", response.transactionId);
  console.log("return value: ", response.value);
  console.log("transaction logs", response.logs);
//   console.log("payload_hash", payloadHash);
//   console.log("public key", wallet.publicKey);

//   console.log("shar [0]", sha256(new Uint8Array([0, 1])));
  console.log("gas used", response.gasUsed);

  // const sig1 = signer.sign(payloadHash);

  // console.log('signature:', sig1);
  // console.log("public key", signer.publicKey);

  // const recoverPublicKey = Signer.recoverPublicKey(payloadHash, sig1);
  // console.log('recoveredPublicKey', recoverPublicKey);
};

main();
