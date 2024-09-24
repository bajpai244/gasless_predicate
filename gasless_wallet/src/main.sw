script;
 
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

const GTF_INPUT_COIN_TX_ID = 0x201;
const GTF_INPUT_COIN_OUTPUT_INDEX = 0x202;

struct InputCoin {
    tx_id: b256,
    output_index: u16
}

enum TxInput {
    InputCoin: InputCoin
}

struct OutputCoin {
    to: Address,
    amount: u64,
    asset_id: AssetId
}

enum TxOutput {
    OutputCoin : OutputCoin  
}

// TODO: we can remove this and use the below one, has better name
fn input_txn_hash(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}

fn input_tx_id(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}

// output index of the input in the transaction it is part of
// should only be called for Coin type of input
fn input_tx_output_index(index: u64) -> u16 {
     __gtf::<u16>(index, GTF_INPUT_COIN_OUTPUT_INDEX)
}

configurable {
    PUBLIC_KEY: B512 = B512::new()
}

fn hash_bytes(bytes: Bytes) -> b256 {
    let mut hasher = Hasher::new();
    hasher.write(bytes);

    hasher.sha256()
}

fn input_type_is_coin(index: u64) -> bool {
        match input_type(index).unwrap() {
            Input::Coin => {
                true
            },
            _ => {
                false
            }
        }
}

fn serialize_inputs(inputs: Vec<TxInput>) -> Bytes {
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

fn serialize_outputs(outputs: Vec<TxOutput>) -> Bytes {
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




fn search_output_coin(to: Address, amount: u64, asset_id: AssetId, consumed_output_indexes: &Vec<u64>) -> Option<u64> {
    let total_outputs: u64 = output_count().into();

    let mut i = 0;
    while i < total_outputs {

        match (output_type(i).unwrap()) {
            Output::Coin => {

                if vec_contains(consumed_output_indexes, i).is_some() {
                    i+=1;

                    continue;
                };

                let output_to = output_asset_to(i).unwrap();
                let output_amount = output_amount(i).unwrap();
                let output_asset_id = output_asset_id(i).unwrap();

                if output_to == to && output_amount == amount && output_asset_id == asset_id {
                    return Some(i);
                }
            },
            _ => {

            }
        }

        i +=1;
    };

    None
}

fn vec_contains<T> (vector: &Vec<T>, value: T) -> Option<u64> 
    where T:Eq
{
    let mut i = 0;
    
    while  i < (*vector).len()  {
        if (*vector).get(i).unwrap() == value {
            return Some(i);
        }

        i+=1;
    };

    None
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

// returns the index at which inputs exists if it exists
fn find_input_tx_by_utxo_id(transaction_id: b256, output_idx: u16) -> Option<u64> {

    let mut i = 0;
    while i < input_count().into() {

        let input_coin_type = input_type(i).unwrap();

        match input_coin_type {
            Input::Coin => {
                if transaction_id == input_tx_id(i) 
                // TODO: We need to renable it, right now it only returns 0, so need to find a solution
                // && output_idx == input_tx_output_index(i)   
                {
                    return Some(i);
                }
            },
            _ => {

            }
        };

        i+=1;
    }

    None
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


    let payload_len = payload.len();

    // log(payload);

    let payload_hash = hash_bytes(payload);
    // log(payload_hash);

    // log(signature);
    let recovered_public_key = ec_recover(signature, payload_hash).unwrap();

    recovered_public_key == PUBLIC_KEY
}