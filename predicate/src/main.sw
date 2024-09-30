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

use gasless_lib::utils::{input_tx_id, search_output_coin, input_type_is_coin, find_input_tx_by_utxo_id, hash_bytes};
use gasless_lib::types::{InputCoin, TxInput, OutputCoin, TxOutput};
use gasless_lib::serde::{serialize_inputs, serialize_outputs};
use gasless_lib::validate::{validate_inputs, validate_outputs};


configurable {
    PUBLIC_KEY: B512 = B512::new()
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
    // log(payload_hash);

    // log(signature);
    let recovered_public_key = ec_recover(signature, payload_hash).unwrap();

    recovered_public_key == PUBLIC_KEY
}