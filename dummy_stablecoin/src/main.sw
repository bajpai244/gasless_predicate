contract;

use std::{
    asset::{mint_to, burn},
    constants::DEFAULT_SUB_ID,
    context::msg_amount,
    identity::Identity,
};

abi NativeAsset {
    #[storage(read, write)]
    fn mint(recipient: Identity, amount: u64);
    #[storage(read, write)]
    fn burn(amount: u64);
}

impl NativeAsset for Contract {
    #[storage(read, write)]
    fn mint(recipient: Identity, amount: u64) {
        mint_to(recipient, DEFAULT_SUB_ID, amount);
    }

    #[storage(read, write)]
    fn burn(amount: u64) {
        burn(DEFAULT_SUB_ID, amount);
    }
}