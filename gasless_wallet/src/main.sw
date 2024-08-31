script;
 
use std::address::Address;
use std::logging::log;
use std::tx::tx_script_bytecode_hash;
use std::outputs::{Output, output_type, output_amount,output_asset_id,output_asset_to};
use std::inputs::{Input, input_type};
use std::bytes_conversions::{b256::*, u64::*};
use std::bytes::Bytes;
use std::hash::Hasher;
use std::b512::B512;
use std::ecr::ec_recover;

const GTF_INPUT_COIN_TX_ID = 0x201;

fn input_txn_hash(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}

configurable {
    PUBLIC_KEY: B512 = B512::new()
}

/// serialization of output_type_coin
/// we are currently converting to big endian bytes
/// [[to_address_bytes], amount: [amount_to_bytes], [asset_id_bytes] ] 
fn serialize_output_type_coin(index: u64) -> Option<Bytes> {
    let mut output_bytes: Bytes = Bytes::new();

    let correct_output_type = match output_type(index).unwrap() {
        Output::Coin => {
            true
        },
        _ => {
            false
        }
    };

    if !correct_output_type {
        return None;
    };

    let to = (output_asset_to(index).unwrap()).bits();
    let to_bytes = to.to_be_bytes();

    let amount = output_amount(index).unwrap();
    let amount_bytes = amount.to_be_bytes();

    let asset_id = (output_asset_id(index).unwrap()).bits();
    let asset_id_bytes = asset_id.to_be_bytes();

    let mut i = 0;
    while i < to_bytes.len() {
        output_bytes.push(to_bytes.get(i).unwrap());
        i+=1;
    };

    let mut i = 0;
    while i < amount_bytes.len() {
        output_bytes.push(amount_bytes.get(i).unwrap());
        i+=1;
    };

    let mut i = 0;
    while i < asset_id_bytes.len() {
        output_bytes.push(asset_id_bytes.get(i).unwrap());
        i+=1;
    };

    Some(output_bytes)
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

fn serialize_input_coins (indexes: Vec<u64>) -> Option<Bytes> {
    let mut result = Bytes::new();

    for i in indexes.iter() {
        if !input_type_is_coin(i) {
            return None;
        }

        let txn_hash = input_txn_hash(i);
        let mut txn_hash_bytes = txn_hash.to_be_bytes();

        result.append(txn_hash_bytes);
    };

    Some(result)
}

fn serialize_output_coins (indexes: Vec<u64>) -> Option<Bytes> {
    let mut result = Bytes::new();

    for i in indexes.iter() {
        let mut serialized_output_coin_bytes = serialize_output_type_coin(i).unwrap();
        result.append(serialized_output_coin_bytes);
    };

    Some(result)
}

/// extract inputs, and outputs
/// extract the script bytecode hash
/// calculate the tranasaction hash based on that
///
/// V0, user can only sign over a single input and single output { only of type coin }
/// txn_hash = sha_256([[input_tx_id_bytes], [hash_of_serialized_output_type_coin]], [script_bytecodehash_bytes])
fn main(input_tx_idxs: Vec<u64>, output_tx_idxs: Vec<u64>, 
signature: B512
) -> bool {

    // log(PUBLIC_KEY);

    let mut payload = Bytes::new();

    let mut serialized_input_coins = serialize_input_coins(input_tx_idxs).unwrap();
    let mut script_byte_code_hash_bytes =  tx_script_bytecode_hash().unwrap().to_be_bytes();
    let mut serialized_output_coins = serialize_output_coins(output_tx_idxs).unwrap();

    // log(tx_script_bytecode_hash().unwrap());

    // log(serialized_input_coins);
    // log(script_byte_code_hash_bytes);
    // log(serialized_output_coins);

    payload.append(serialized_input_coins);
    payload.append(script_byte_code_hash_bytes);
    payload.append(serialized_output_coins);

    // log(payload);
    let payload_hash = hash_bytes(payload);
    // log(payload_hash);

    // log(signature);
    let recovered_public_key = ec_recover(signature, payload_hash).unwrap();
    log(recovered_public_key);

    recovered_public_key == PUBLIC_KEY
}