# Carrot Protocol CPI Integration

Guide for integrating Carrot Protocol into your Solana program via CPI.

## Program Addresses

| Program | Address |
|---------|---------|
| Carrot Protocol | `CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s` |
| Carrot Log | `7Mc3vSdRWoThArpni6t5W4XjvQf4BuMny1uC8b6VBn48` |

## Vault & Token Addresses

| Account | Address |
|---------|---------|
| CRT Vault | `FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ` |
| CRT Mint (Token-2022) | `CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s` |
| USDC Mint | `EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v` |
| Vault USDC ATA | `Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U` |

## Setup

### 1. Copy IDL

Copy `idls/carrot.json` to your project's `idls/` folder.

### 2. Cargo.toml

```toml
[dependencies]
anchor-lang = { version = "0.31.1", features = ["idl-build"] }

[features]
idl-build = ["anchor-lang/idl-build"]
```

### 3. Declare Program

In your `lib.rs`:

```rust
use anchor_lang::prelude::*;

// Generate CPI bindings from IDL
declare_program!(carrot);

use carrot::cpi::accounts::Issue as CarrotIssue;
use carrot::cpi::accounts::Redeem as CarrotRedeem;
use carrot::program::Carrot;
```

## CPI: Deposit (Issue)

Deposit assets into Carrot vault and receive CRT shares.

### Rust Code

```rust
pub fn deposit<'info>(
    ctx: Context<'_, '_, 'info, 'info, Deposit<'info>>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = CarrotIssue {
        vault: ctx.accounts.vault.to_account_info(),
        shares: ctx.accounts.shares_mint.to_account_info(),
        user_shares_ata: ctx.accounts.user_shares_ata.to_account_info(),
        asset: ctx.accounts.asset_mint.to_account_info(),
        vault_asset_ata: ctx.accounts.vault_asset_ata.to_account_info(),
        user_asset_ata: ctx.accounts.user_asset_ata.to_account_info(),
        user: ctx.accounts.user.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        asset_token_program: ctx.accounts.asset_token_program.to_account_info(),
        shares_token_program: ctx.accounts.shares_token_program.to_account_info(),
        log_program: ctx.accounts.log_program.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.carrot_program.to_account_info(),
        cpi_accounts,
    ).with_remaining_accounts(ctx.remaining_accounts.to_vec());

    carrot::cpi::issue(cpi_ctx, carrot::types::IssueArgs { amount })?;
    Ok(())
}
```

### Accounts Struct

```rust
#[derive(Accounts)]
pub struct Deposit<'info> {
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CHECK: CRT shares mint (Token-2022)
    #[account(mut)]
    pub shares_mint: UncheckedAccount<'info>,

    /// CHECK: User's CRT token account
    #[account(mut)]
    pub user_shares_ata: UncheckedAccount<'info>,

    /// CHECK: Asset mint (e.g. USDC)
    pub asset_mint: UncheckedAccount<'info>,

    /// CHECK: Vault's asset token account
    #[account(mut)]
    pub vault_asset_ata: UncheckedAccount<'info>,

    /// CHECK: User's asset token account
    #[account(mut)]
    pub user_asset_ata: UncheckedAccount<'info>,

    #[account(mut)]
    pub user: Signer<'info>,

    pub system_program: Program<'info, System>,

    /// CHECK: SPL Token or Token-2022
    pub asset_token_program: UncheckedAccount<'info>,

    /// CHECK: Token-2022 for CRT
    pub shares_token_program: UncheckedAccount<'info>,

    /// CHECK: Carrot Log program
    pub log_program: UncheckedAccount<'info>,

    pub carrot_program: Program<'info, Carrot>,
}
```

## CPI: Redeem

Burn CRT shares and receive underlying assets.

### Rust Code

```rust
pub fn redeem<'info>(
    ctx: Context<'_, '_, 'info, 'info, Redeem<'info>>,
    amount: u64,
) -> Result<()> {
    let cpi_accounts = CarrotRedeem {
        vault: ctx.accounts.vault.to_account_info(),
        shares: ctx.accounts.shares_mint.to_account_info(),
        user_shares_ata: ctx.accounts.user_shares_ata.to_account_info(),
        asset: ctx.accounts.asset_mint.to_account_info(),
        vault_asset_ata: ctx.accounts.vault_asset_ata.to_account_info(),
        user_asset_ata: ctx.accounts.user_asset_ata.to_account_info(),
        user: ctx.accounts.user.to_account_info(),
        system_program: ctx.accounts.system_program.to_account_info(),
        asset_token_program: ctx.accounts.asset_token_program.to_account_info(),
        shares_token_program: ctx.accounts.shares_token_program.to_account_info(),
        log_program: ctx.accounts.log_program.to_account_info(),
    };

    let cpi_ctx = CpiContext::new(
        ctx.accounts.carrot_program.to_account_info(),
        cpi_accounts,
    ).with_remaining_accounts(ctx.remaining_accounts.to_vec());

    carrot::cpi::redeem(cpi_ctx, carrot::types::RedeemArgs { amount })?;
    Ok(())
}
```

## Client Side (TypeScript)

### Addresses

```typescript
const ADDRESSES = {
  CARROT_PROGRAM: new PublicKey("CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s"),
  CARROT_LOG_PROGRAM: new PublicKey("7Mc3vSdRWoThArpni6t5W4XjvQf4BuMny1uC8b6VBn48"),
  TOKEN_PROGRAM: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  TOKEN_2022_PROGRAM: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),

  CRT_VAULT: new PublicKey("FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ"),
  CRT_MINT: new PublicKey("CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s"),

  USDC_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  VAULT_USDC_ATA: new PublicKey("Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U"),

  // Oracle accounts for remaining_accounts
  ORACLES: [
    new PublicKey("Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U"),
    new PublicKey("Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"),
    new PublicKey("Hpxgqa8dvk2jSfNgTfdYncxSE2YY2c52TTzPaH1V98RW"),
    new PublicKey("HT2PLQBcG5EiCcNSaMHAjSgd9F98ecpATbk4Sk5oYuM"),
    new PublicKey("4cugtfkFydmoPe9CZJ4wFZzDUEmGJFNaThvumYABTFDS"),
    new PublicKey("9zXQxpYH3kYhtoybmZfUNNCRVuud7fY9jswTg1hLyT8k"),
  ],
};
```

### Deposit Example

```typescript
import { ComputeBudgetProgram } from "@solana/web3.js";
import { getAssociatedTokenAddressSync } from "@solana/spl-token";

const userUsdcAta = getAssociatedTokenAddressSync(
  ADDRESSES.USDC_MINT,
  user,
  false,
  ADDRESSES.TOKEN_PROGRAM
);

const userSharesAta = getAssociatedTokenAddressSync(
  ADDRESSES.CRT_MINT,
  user,
  false,
  ADDRESSES.TOKEN_2022_PROGRAM  // CRT uses Token-2022
);

// Oracles as remaining accounts
const remainingAccounts = ADDRESSES.ORACLES.map((pubkey) => ({
  pubkey,
  isSigner: false,
  isWritable: false,
}));

const tx = await program.methods
  .deposit(new BN(100_000_000))  // 100 USDC (6 decimals)
  .preInstructions([
    ComputeBudgetProgram.setComputeUnitLimit({ units: 400_000 }),
  ])
  .accounts({
    vault: ADDRESSES.CRT_VAULT,
    sharesMint: ADDRESSES.CRT_MINT,
    userSharesAta: userSharesAta,
    assetMint: ADDRESSES.USDC_MINT,
    vaultAssetAta: ADDRESSES.VAULT_USDC_ATA,
    userAssetAta: userUsdcAta,
    user: user,
    systemProgram: SystemProgram.programId,
    assetTokenProgram: ADDRESSES.TOKEN_PROGRAM,
    sharesTokenProgram: ADDRESSES.TOKEN_2022_PROGRAM,
    logProgram: ADDRESSES.CARROT_LOG_PROGRAM,
    carrotProgram: ADDRESSES.CARROT_PROGRAM,
  })
  .remainingAccounts(remainingAccounts)
  .rpc();
```

## Token Calculation

### Shares Earned (Deposit)

```typescript
import { RpcClient } from "@carrot-protocol/rpc-client";

const client = new RpcClient(connection);
const vault = await client.getVault("FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ");

// Get USDC asset from vault
const usdcAsset = vault.assets.find(a => 
  a.mint.equals(new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"))
);

// Calculate
const depositAmountUsd = (depositAmount / 10 ** usdcAsset.mintDecimals) * usdcAsset.priceAvg;
const sharesEarned = depositAmountUsd / vault.navPostFee;
```

### Assets Received (Redeem)

```typescript
const sharesAmountUi = redeemAmount / 10 ** vault.sharesDecimals;
const redemptionFeeBps = vault.fee.exitBps;

const grossUsd = sharesAmountUi * vault.navPostFee;
const netUsd = grossUsd * (1 - redemptionFeeBps / 10000);
const assetsReceived = (netUsd / usdcAsset.priceAvg) * 10 ** usdcAsset.mintDecimals;
```

## Important Notes

1. **Token-2022**: CRT mint uses Token-2022, not SPL Token
2. **Compute Budget**: Use at least 400,000 CUs for CPI calls
3. **Remaining Accounts**: Oracle accounts must be passed as remaining_accounts
4. **User ATA**: Create user's CRT ATA before first deposit (use Token-2022 program)

## Files

| File | Description |
|------|-------------|
| `idls/carrot.json` | Carrot Protocol IDL |
| `programs/carrot-cpi/src/lib.rs` | Example CPI implementation |
| `tests/carrot-cpi.ts` | TypeScript test examples |
| `carrot.so` | Carrot Protocol binary (for local testing) |
| `carrot-log.so` | Carrot Log binary (for local testing) |

## Local Testing

### Anchor.toml

```toml
[[test.genesis]]
address = "CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s"
program = "./carrot.so"

[[test.genesis]]
address = "7Mc3vSdRWoThArpni6t5W4XjvQf4BuMny1uC8b6VBn48"
program = "./carrot-log.so"

[test.validator]
url = "https://api.mainnet-beta.solana.com"

[[test.validator.clone]]
address = "FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ"

[[test.validator.clone]]
address = "CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s"
```

Run tests:
```bash
anchor test
```
