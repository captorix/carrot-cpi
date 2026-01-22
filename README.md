# Carrot CPI

A Solana program built with Anchor framework.

## Overview

This project contains a Cross-Program Invocation (CPI) implementation.

## Prerequisites

- Rust
- Solana CLI
- Anchor Framework

## Build

```bash
anchor build
```

## Test

```bash
anchor test
```

## Deploy

```bash
anchor deploy
```

## Convert IDL

```bash
anchor idl fetch -o idl.json CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s
anchor idl convert idl.json --program-id CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s -o carrot.json
```

## Docs
https://defi-carrot.github.io/carrot-protocol-typedoc/
https://defi-carrot.github.io/carrot-protocol-typedoc/classes/_carrot-protocol_rpc-client.Instructions.html




> ts-node scripts/deposit-calculator.ts 100
```
=== CRT Deposit Calculator ===

Input: 100 USDC

--- Calculation Result ---
NAV (price per CRT): $113.908452
Deposit USD Value: $99.97
CRT Output: 0.877654 CRT
CRT Output (raw): 877653616

--- Creating Instructions Example ---
Number of instructions: 2

--- Instruction 1 ---
Program ID: ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL
Data (hex): 01
Data (base64): AQ==
Keys (6):
  [0] 7KoghdFYkx3DaSentLd5v1hzrRr2czFMJ1C1Arf2MzaL (signer: true, writable: true)
  [1] 6Mw8pRoLCFbio633iHBrmPiqarXxmcyt6Dsfuiqv81NC (signer: false, writable: true)
  [2] 7KoghdFYkx3DaSentLd5v1hzrRr2czFMJ1C1Arf2MzaL (signer: false, writable: false)
  [3] CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s (signer: false, writable: false)
  [4] 11111111111111111111111111111111 (signer: false, writable: false)
  [5] TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb (signer: false, writable: false)

--- Instruction 2 ---
Program ID: CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s
Data (hex): be0162d65163def700e1f50500000000
Data (base64): vgFi1lFj3vcA4fUFAAAAAA==
Keys (17):
  [0] FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ (signer: false, writable: true)
  [1] CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s (signer: false, writable: true)
  [2] 6Mw8pRoLCFbio633iHBrmPiqarXxmcyt6Dsfuiqv81NC (signer: false, writable: true)
  [3] EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v (signer: false, writable: false)
  [4] Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U (signer: false, writable: true)
  [5] 7ZG8NPAqfUyLtfwC3ikHANX3Cpz4yNSi62rcX47cbxzZ (signer: false, writable: true)
  [6] 7KoghdFYkx3DaSentLd5v1hzrRr2czFMJ1C1Arf2MzaL (signer: true, writable: false)
  [7] 11111111111111111111111111111111 (signer: false, writable: false)
  [8] TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA (signer: false, writable: false)
  [9] TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb (signer: false, writable: false)
  [10] 7Mc3vSdRWoThArpni6t5W4XjvQf4BuMny1uC8b6VBn48 (signer: false, writable: false)
  [11] Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U (signer: false, writable: false)
  [12] Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX (signer: false, writable: false)
  [13] Hpxgqa8dvk2jSfNgTfdYncxSE2YY2c52TTzPaH1V98RW (signer: false, writable: false)
  [14] HT2PLQBcG5EiCcNSaMHAjSgd9F98ecpATbk4Sk5oYuM (signer: false, writable: false)
  [15] 4cugtfkFydmoPe9CZJ4wFZzDUEmGJFNaThvumYABTFDS (signer: false, writable: false)
  [16] 9zXQxpYH3kYhtoybmZfUNNCRVuud7fY9jswTg1hLyT8k (signer: false, writable: false)
```