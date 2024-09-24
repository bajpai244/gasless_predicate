import {  B256Coder, BigNumberCoder, sha256, NumberCoder } from "fuels";
import type { TxInputInput, TxOutputInput } from "../predicates/scripts/DbgExample";

export const calculaatePayloadHash = (inputs: Array<TxInputInput>, outputs: Array<TxOutputInput>) => {
    const b256Coder = new B256Coder();
    const u16Coder = new NumberCoder("u16");
    const u64Coder = new BigNumberCoder("u64");

    let payload = new Uint8Array([]);
    
    for (const input of inputs) {
        const {tx_id, output_index} = input.InputCoin;
        
        const txIdBytes = b256Coder.encode(tx_id);
        const outputIndexBytes = u16Coder.encode(output_index as number);

        payload = new Uint8Array([...txIdBytes, ...outputIndexBytes]);
    }

    for (const output of outputs) {
        const {to, amount, asset_id} = output.OutputCoin;

        const toBytes  = b256Coder.encode(to.bits);
        const amountBytes = u64Coder.encode(amount);
        const assetIdBytes = b256Coder.encode(asset_id.bits);

        payload = new Uint8Array([...payload,...toBytes, ...amountBytes, ...assetIdBytes]);
    }

    console.log("payload: ",payload);
    return sha256(payload);
}
