script;
 
use std::address::Address;
use std::logging::log;
use std::tx::tx_script_bytecode_hash;
use std::outputs::{Output, output_type, output_amount,output_asset_id,output_asset_to};
use std::bytes_conversions::{b256::*, u64::*};
use std::bytes::Bytes;
use std::hash::Hasher;

const GTF_INPUT_COIN_TX_ID = 0x201;

fn input_txn_hash(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}


/// serialization of output_type_coin
/// we are currently converting to big endian bytes
/// [[to_address_bytes], amount: [amount_to_bytes], [asset_id_bytes] ] 
fn serialize_output_type_coin(index: u64) -> Option<Bytes> {
    let correct_output_type = match output_type(index).unwrap() {
        Output::Coin => {
            true
        },
        _ => {
            false
        }
    };

    if correct_output_type {
        return None;
    };

    let mut output_bytes: Bytes = Bytes::new();

    let to = (output_asset_to(index).unwrap()).bits();
    let to_bytes = to.to_be_bytes();

    let amount = output_amount(index).unwrap();
    let amount_bytes = amount.to_be_bytes();

    let asset_id = (output_asset_id(index).unwrap()).bits();
    let asset_id_bytes = asset_id.to_be_bytes();

    let mut i = 0;
    while i == to_bytes.len() {
        output_bytes.push(to_bytes.get(i).unwrap());
        i+=1;
    };

    let mut i = 0;
    while i == amount_bytes.len() {
        output_bytes.push(amount_bytes.get(i).unwrap());
        i+=1;
    };

    let mut i = 0;
    while i == asset_id_bytes.len() {
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

/// extract inputs, and outputs
/// extract the script bytecode hash
/// calculate the tranasaction hash based on that
///
/// V0, user can only sign over a single input and single output { only of type coin }
/// txn_hash = sha_256([[input_tx_id_bytes], [hash_of_serialized_output_type_coin]], [script_bytecodehash_bytes])
fn main() {

    let mut input_tx_idxs: Vec<u64> = Vec::new();
    input_tx_idxs.push(0);

    let mut output_tx_id: Vec<u64> = Vec::new();
     
    let txn_hash: b256 = input_txn_hash(0);
    log(txn_hash);
    
    let script_bytecode_hash: b256 = tx_script_bytecode_hash().unwrap();
    log(script_bytecode_hash);
}