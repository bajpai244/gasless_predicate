/* Autogenerated file. Do not edit manually. */

/* eslint-disable max-classes-per-file */
/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/consistent-type-imports */

/*
  Fuels version: 0.94.2
  Forc version: 0.63.1
  Fuel-Core version: 0.34.0
*/

import {
  Account,
  BigNumberish,
  BN,
  decompressBytecode,
  Script,
} from 'fuels';

import type { Enum, Vec } from "./common";

export type TxInputInput = Enum<{ InputCoin: InputCoinInput }>;
export type TxInputOutput = Enum<{ InputCoin: InputCoinOutput }>;
export type TxOutputInput = Enum<{ OutputCoin: OutputCoinInput }>;
export type TxOutputOutput = Enum<{ OutputCoin: OutputCoinOutput }>;

export type AddressInput = { bits: string };
export type AddressOutput = AddressInput;
export type AssetIdInput = { bits: string };
export type AssetIdOutput = AssetIdInput;
export type InputCoinInput = { tx_id: string, output_index: BigNumberish };
export type InputCoinOutput = { tx_id: string, output_index: number };
export type OutputCoinInput = { to: AddressInput, amount: BigNumberish, asset_id: AssetIdInput };
export type OutputCoinOutput = { to: AddressOutput, amount: BN, asset_id: AssetIdOutput };

export type DbgExampleInputs = [tx_inputs: Vec<TxInputInput>, tx_outputs: Vec<TxOutputInput>];
export type DbgExampleOutput = boolean;

export type DbgExampleConfigurables = Partial<{
  PUBLIC_KEY: string;
}>;

const abi = {
  "programType": "script",
  "specVersion": "1",
  "encodingVersion": "1",
  "concreteTypes": [
    {
      "type": "bool",
      "concreteTypeId": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903"
    },
    {
      "type": "enum TxInput",
      "concreteTypeId": "67c80f7883622d4f66c11d53e2f037ede5841cd030f0ca3d1dc936d0128507cb",
      "metadataTypeId": 2
    },
    {
      "type": "enum TxOutput",
      "concreteTypeId": "af34e1a28aeada2641e09fe17c04cf603395e41324ed732fded5bcb116df6a77",
      "metadataTypeId": 3
    },
    {
      "type": "struct std::b512::B512",
      "concreteTypeId": "745e252e80bec590efc3999ae943f07ccea4d5b45b00bb6575499b64abdd3322",
      "metadataTypeId": 10
    },
    {
      "type": "struct std::vec::Vec<enum TxInput>",
      "concreteTypeId": "bc7c44c1611de3647c8fb6195acf2d5dd763d20f10a96cbd4a3d7b394d094cd4",
      "metadataTypeId": 12,
      "typeArguments": [
        "67c80f7883622d4f66c11d53e2f037ede5841cd030f0ca3d1dc936d0128507cb"
      ]
    },
    {
      "type": "struct std::vec::Vec<enum TxOutput>",
      "concreteTypeId": "97ff3cc17f62db65f7192a97e4b66c12a128d3e87622971a0c5867781dd581d3",
      "metadataTypeId": 12,
      "typeArguments": [
        "af34e1a28aeada2641e09fe17c04cf603395e41324ed732fded5bcb116df6a77"
      ]
    },
    {
      "type": "u64",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "metadataTypes": [
    {
      "type": "[_; 2]",
      "metadataTypeId": 0,
      "components": [
        {
          "name": "__array_element",
          "typeId": 1
        }
      ]
    },
    {
      "type": "b256",
      "metadataTypeId": 1
    },
    {
      "type": "enum TxInput",
      "metadataTypeId": 2,
      "components": [
        {
          "name": "InputCoin",
          "typeId": 6
        }
      ]
    },
    {
      "type": "enum TxOutput",
      "metadataTypeId": 3,
      "components": [
        {
          "name": "OutputCoin",
          "typeId": 7
        }
      ]
    },
    {
      "type": "generic T",
      "metadataTypeId": 4
    },
    {
      "type": "raw untyped ptr",
      "metadataTypeId": 5
    },
    {
      "type": "struct InputCoin",
      "metadataTypeId": 6,
      "components": [
        {
          "name": "tx_id",
          "typeId": 1
        },
        {
          "name": "output_index",
          "typeId": 13
        }
      ]
    },
    {
      "type": "struct OutputCoin",
      "metadataTypeId": 7,
      "components": [
        {
          "name": "to",
          "typeId": 8
        },
        {
          "name": "amount",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        },
        {
          "name": "asset_id",
          "typeId": 9
        }
      ]
    },
    {
      "type": "struct std::address::Address",
      "metadataTypeId": 8,
      "components": [
        {
          "name": "bits",
          "typeId": 1
        }
      ]
    },
    {
      "type": "struct std::asset_id::AssetId",
      "metadataTypeId": 9,
      "components": [
        {
          "name": "bits",
          "typeId": 1
        }
      ]
    },
    {
      "type": "struct std::b512::B512",
      "metadataTypeId": 10,
      "components": [
        {
          "name": "bits",
          "typeId": 0
        }
      ]
    },
    {
      "type": "struct std::vec::RawVec",
      "metadataTypeId": 11,
      "components": [
        {
          "name": "ptr",
          "typeId": 5
        },
        {
          "name": "cap",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        4
      ]
    },
    {
      "type": "struct std::vec::Vec",
      "metadataTypeId": 12,
      "components": [
        {
          "name": "buf",
          "typeId": 11,
          "typeArguments": [
            {
              "name": "",
              "typeId": 4
            }
          ]
        },
        {
          "name": "len",
          "typeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
        }
      ],
      "typeParameters": [
        4
      ]
    },
    {
      "type": "u16",
      "metadataTypeId": 13
    }
  ],
  "functions": [
    {
      "inputs": [
        {
          "name": "tx_inputs",
          "concreteTypeId": "bc7c44c1611de3647c8fb6195acf2d5dd763d20f10a96cbd4a3d7b394d094cd4"
        },
        {
          "name": "tx_outputs",
          "concreteTypeId": "97ff3cc17f62db65f7192a97e4b66c12a128d3e87622971a0c5867781dd581d3"
        }
      ],
      "name": "main",
      "output": "b760f44fa5965c2474a3b471467a22c43185152129295af588b022ae50b50903",
      "attributes": [
        {
          "name": "doc-comment",
          "arguments": [
            " extract inputs, and outputs"
          ]
        },
        {
          "name": "doc-comment",
          "arguments": [
            " extract the script bytecode hash"
          ]
        },
        {
          "name": "doc-comment",
          "arguments": [
            " calculate the tranasaction hash based on that"
          ]
        },
        {
          "name": "doc-comment",
          "arguments": [
            ""
          ]
        },
        {
          "name": "doc-comment",
          "arguments": [
            " V0, user can only sign over a single input and single output { only of type coin }"
          ]
        },
        {
          "name": "doc-comment",
          "arguments": [
            " txn_hash = sha_256([[input_tx_id_bytes], [hash_of_serialized_output_type_coin]], [script_bytecodehash_bytes])"
          ]
        }
      ]
    }
  ],
  "loggedTypes": [
    {
      "logId": "1515152261580153489",
      "concreteTypeId": "1506e6f44c1d6291cdf46395a8e573276a4fa79e8ace3fc891e092ef32d1b0a0"
    }
  ],
  "messagesTypes": [],
  "configurables": [
    {
      "name": "PUBLIC_KEY",
      "concreteTypeId": "745e252e80bec590efc3999ae943f07ccea4d5b45b00bb6575499b64abdd3322",
      "offset": 10040
    }
  ]
};

const bytecode = decompressBytecode('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');

export class DbgExample extends Script<DbgExampleInputs, DbgExampleOutput> {

  static readonly abi = abi;
  static readonly bytecode = bytecode;

  constructor(wallet: Account) {
    super(bytecode, abi, wallet);
  }
}
