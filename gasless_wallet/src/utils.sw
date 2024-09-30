library;

use std::inputs::{Input, input_type, input_count, input_amount};
use std::outputs::{Output, output_type, output_amount,output_asset_id,output_asset_to, output_count};


const GTF_INPUT_COIN_TX_ID = 0x201;
const GTF_INPUT_COIN_OUTPUT_INDEX = 0x202;

// TODO: we can remove this and use the below one, has better name
pub fn input_txn_hash(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}

pub fn input_tx_id(index: u64) -> b256 {
     __gtf::<b256>(index, GTF_INPUT_COIN_TX_ID)
}

// output index of the input in the transaction it is part of
// should only be called for Coin type of input
pub fn input_tx_output_index(index: u64) -> u16 {
     __gtf::<u16>(index, GTF_INPUT_COIN_OUTPUT_INDEX)
}

pub fn input_type_is_coin(index: u64) -> bool {
        match input_type(index).unwrap() {
            Input::Coin => {
                true
            },
            _ => {
                false
            }
        }
}

// returns the index at which inputs exists if it exists
pub fn find_input_tx_by_utxo_id(transaction_id: b256, output_idx: u16) -> Option<u64> {

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



pub fn search_output_coin(to: Address, amount: u64, asset_id: AssetId, consumed_output_indexes: &Vec<u64>) -> Option<u64> {
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