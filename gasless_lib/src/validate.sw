library;

use ::utils::{search_output_coin, find_input_tx_by_utxo_id};
use ::types::{TxOutput, TxInput, ValidationError};

// validate all outputs that are provided are present
pub fn validate_outputs(
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


pub fn validate_inputs(input_txs: Vec<TxInput>) -> Result<(), ValidationError>{
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
