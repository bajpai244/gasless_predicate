library;

use std::bytes_conversions::{b256::*, u64::*, u16::*};
use std::bytes::Bytes;

use ::types::{TxInput, TxOutput};

pub fn serialize_inputs(inputs: Vec<TxInput>) -> Bytes {
    let mut bytes = Bytes::new();

    for input in inputs.iter()  {
        match input {
            TxInput::InputCoin (input_coin) => {
                let mut tx_id_bytes = input_coin.tx_id.to_be_bytes();
                let mut output_index_bytes = input_coin.output_index.to_be_bytes();

                bytes.append(tx_id_bytes);
                bytes.append(output_index_bytes);
            }
        }

    }

    bytes
}

pub fn serialize_outputs(outputs: Vec<TxOutput>) -> Bytes {
    let mut bytes = Bytes::new();

    for output in (outputs).iter()  {   
        match output {
    TxOutput::OutputCoin(output_coin) => {

    let to_bytes = output_coin.to.bits().to_be_bytes();
    let amount_bytes = output_coin.amount.to_be_bytes();
    let asset_id_bytes = output_coin.asset_id.bits().to_be_bytes();

    bytes.append(to_bytes);
    bytes.append(amount_bytes);
    bytes.append(asset_id_bytes);

            }
        }
    };

    bytes
}