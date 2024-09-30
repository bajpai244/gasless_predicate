library;

pub struct InputCoin {
    pub tx_id: b256,
    pub output_index: u16
}

pub enum TxInput {
    pub InputCoin: InputCoin
}


pub struct OutputCoin {
    pub to: Address,
    pub amount: u64,
    pub asset_id: AssetId
}

pub enum TxOutput {
    pub OutputCoin : OutputCoin  
}

pub enum ValidationError {
        OutputNotFound: (),
        InputNotFound: ()
}