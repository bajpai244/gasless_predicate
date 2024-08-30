import {  B256Coder, InputType, OutputType, type ScriptTransactionRequest, type Coin, type Input, type InputCoin, type Output, type OutputCoin, BigNumberCoder, sha256 } from "fuels";

const isOutputCoinType = (output: Output) => {
    if(output.type !== OutputType.Coin ){
        return false;
    }

    return true;
}

const isInputCoinType = (input: Input) => {
    if(input.type !== InputType.Coin ){
        return false;
    }

    return true;
}

const serializeOutputCoins = (outputCoins: Array<OutputCoin>) => {
    const b256Coder = new B256Coder();
    const u64Coder=  new BigNumberCoder("u64");

    let bytes = new Uint8Array([]);

    for(const outputCoin of outputCoins) {
        const toBytes = b256Coder.encode(outputCoin.to);
        const amountBytes = u64Coder.encode(outputCoin.amount);
        const assetIdBytes = b256Coder.encode(outputCoin.assetId);

        bytes = new Uint8Array([...bytes, ...toBytes, ...amountBytes, ...assetIdBytes])
    }


    return bytes;
}

const serializeInputCoins = (inputCoins: Array<InputCoin>) => {
    const b256Coder = new B256Coder();

    let bytes = new Uint8Array([]);

    for (const inputCoin of inputCoins) {
        const encoding = b256Coder.encode(inputCoin.txID);
        bytes = new Uint8Array([...bytes, ...encoding]);
    }

    return bytes;
}

export const calculatePayloadHash  = (
arg:    {request: ScriptTransactionRequest,
    inputIndexes: Array<number>,
    scriptByteCodeHash:string,
    outputIndexes: Array<number>
 }
) => {
    const {request, inputIndexes, scriptByteCodeHash, outputIndexes} = arg;
    const transaction =  request.toTransaction();
    const b256Coder = new B256Coder();

    const inputs = transaction.inputs;

    const inputCoins: InputCoin[] = [];
    for (const index of inputIndexes) {
        const input = inputs[index];
        if (isInputCoinType(input)) {
            inputCoins.push(input as InputCoin);
        } else {
            throw new Error(`Input at index ${index} is not a Coin type`);
        }
    }

    const inputCoinsBytes = serializeInputCoins(inputCoins)

    const scriptByteCodeHashBytes = b256Coder.encode(scriptByteCodeHash);

    const outputs = transaction.outputs;

    const outputCoins: OutputCoin[] = [];
    for (const index of outputIndexes) {
        const output = outputs[index];
        if (isOutputCoinType(output)) {
            outputCoins.push(output as OutputCoin);
        } else {
            throw new Error(`Output at index ${index} is not a Coin type`);
        }
    }

    const outputCoinsBytes = serializeOutputCoins(outputCoins);

    const payload = new Uint8Array([...inputCoinsBytes, ...scriptByteCodeHashBytes, ...outputCoinsBytes]);
    return sha256(payload);
}