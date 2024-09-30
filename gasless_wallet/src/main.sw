script;

mod utils;
mod types;
mod serde;
 
use std::address::Address;
use std::logging::log;
use std::tx::tx_script_bytecode_hash;
use std::outputs::{Output, output_type, output_amount,output_asset_id,output_asset_to, output_count};
use std::inputs::{Input, input_type, input_count, input_amount};
use std::bytes_conversions::{b256::*, u64::*, u16::*};
use std::bytes::Bytes;
use std::hash::Hasher;
use std::b512::B512;
use std::ecr::ec_recover;
use std::asset_id::AssetId;

use utils::{input_tx_id, search_output_coin, input_type_is_coin, find_input_tx_by_utxo_id};
use types::{InputCoin, TxInput, OutputCoin, TxOutput};
use serde::{serialize_inputs, serialize_outputs};


configurable {
    PUBLIC_KEY: B512 = B512::new()
}

fn hash_bytes(bytes: Bytes) -> b256 {
    let mut hasher = Hasher::new();
    hasher.write(bytes);

    hasher.sha256()
}

enum ValidationError {
        OutputNotFound: (),
        InputNotFound: ()
}

// validate all outputs that are provided are present
fn validate_outputs(
    tx_outputs: Vec<TxOutput>
) -> Result<(), ValidationError>{

    let mut consumed_output_indexes: Vec<u64> = Vec::new();

    let mut i = 0;

    while i < (tx_outputs).len() {

    let output = (tx_outputs).get(i).unwrap();

    match output {
       TxOutput::OutputCoin(output_coin) => {   

        // TODO: we should pack this into two arguments, one of type TxOutput::OutputCoin, second for the providing reference for the vector
        let output_coin_idx = search_output_coin(output_coin.to, output_coin.amount, output_coin.asset_id, &consumed_output_indexes);

        match output_coin_idx {
        Some(index) => {
            consumed_output_indexes.push(index);
            }
        None => {
            return Err(ValidationError::OutputNotFound);
        }
        };

        }
    };

        i+=1;
    }

    Ok(())    
}


fn validate_inputs(input_txs: Vec<TxInput>) -> Result<(), ValidationError>{
    let mut i = 0;

    while i < (input_txs).len() {
       let tx_input = (input_txs).get(i).unwrap(); 

       match tx_input {
       TxInput::InputCoin(input_coin) => { 
        if let None = find_input_tx_by_utxo_id(input_coin.tx_id, input_coin.output_index) {
            return Err(ValidationError::InputNotFound);
       }
       }
       }

       i+=1;
    }
    
    Ok(())
}

/// extract inputs, and outputs
/// extract the script bytecode hash
/// calculate the tranasaction hash based on that
///
/// V0, user can only sign over a single input and single output { only of type coin }
/// txn_hash = sha_256([[input_tx_id_bytes], [hash_of_serialized_output_type_coin]], [script_bytecodehash_bytes])
fn main(
    tx_inputs: Vec<TxInput>, 
    tx_outputs: Vec<TxOutput>, 
    signature: B512
) -> bool {


    validate_inputs(tx_inputs).unwrap();
    validate_outputs(tx_outputs).unwrap();


    // log(PUBLIC_KEY);

    let mut payload = Bytes::new();

    let mut serialized_inputs = serialize_inputs(tx_inputs);
    let serialized_outputs = serialize_outputs(tx_outputs);

    payload.append(serialized_inputs);
    payload.append(serialized_outputs);


    // log(payload);

    let payload_hash = hash_bytes(payload);
    log(payload_hash);

    log(signature);
    let recovered_public_key = ec_recover(signature, payload_hash).unwrap();

    recovered_public_key == PUBLIC_KEY
}