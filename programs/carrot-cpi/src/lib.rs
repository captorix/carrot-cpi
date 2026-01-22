use anchor_lang::prelude::*;

declare_id!("HvVmVrZ9yFrSPp27pmAzdLkqr4ESZ2FW1AgETajoVXDc");

// Generate CPI bindings from Carrot IDL
declare_program!(carrot);

use carrot::cpi::accounts::Issue as CarrotIssue;
use carrot::cpi::accounts::Redeem as CarrotRedeem;
use carrot::program::Carrot;

#[program]
pub mod carrot_cpi {
    use super::*;

    pub fn initialize(_ctx: Context<Initialize>) -> Result<()> {
        msg!("Initialized!");
        Ok(())
    }

    /// Deposit assets into Carrot vault and receive CRT shares
    pub fn deposit<'info>(
        ctx: Context<'_, '_, 'info, 'info, Deposit<'info>>,
        amount: u64,
    ) -> Result<()> {
        msg!("Depositing {} tokens into Carrot vault", amount);

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

        msg!("Deposit successful!");
        Ok(())
    }

    /// Redeem CRT shares for underlying assets
    pub fn redeem<'info>(
        ctx: Context<'_, '_, 'info, 'info, Redeem<'info>>,
        amount: u64,
    ) -> Result<()> {
        msg!("Redeeming {} CRT shares from Carrot vault", amount);

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

        msg!("Redeem successful!");
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}

#[derive(Accounts)]
pub struct Deposit<'info> {
    /// Carrot vault account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CRT shares mint
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub shares_mint: UncheckedAccount<'info>,

    /// User's CRT shares token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub user_shares_ata: UncheckedAccount<'info>,

    /// Asset mint (e.g., USDC)
    /// CHECK: Validated by Carrot program
    pub asset_mint: UncheckedAccount<'info>,

    /// Vault's asset token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub vault_asset_ata: UncheckedAccount<'info>,

    /// User's asset token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub user_asset_ata: UncheckedAccount<'info>,

    /// User making the deposit
    #[account(mut)]
    pub user: Signer<'info>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Asset token program (SPL Token or Token-2022)
    /// CHECK: Validated by Carrot program
    pub asset_token_program: UncheckedAccount<'info>,

    /// Shares token program (Token-2022 for CRT)
    /// CHECK: Validated by Carrot program
    pub shares_token_program: UncheckedAccount<'info>,

    /// Carrot log program
    /// CHECK: Validated by Carrot program
    pub log_program: UncheckedAccount<'info>,

    /// Carrot program for CPI
    pub carrot_program: Program<'info, Carrot>,
}

#[derive(Accounts)]
pub struct Redeem<'info> {
    /// Carrot vault account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub vault: UncheckedAccount<'info>,

    /// CRT shares mint
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub shares_mint: UncheckedAccount<'info>,

    /// User's CRT shares token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub user_shares_ata: UncheckedAccount<'info>,

    /// Asset mint (e.g., USDC)
    /// CHECK: Validated by Carrot program
    pub asset_mint: UncheckedAccount<'info>,

    /// Vault's asset token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub vault_asset_ata: UncheckedAccount<'info>,

    /// User's asset token account
    /// CHECK: Validated by Carrot program
    #[account(mut)]
    pub user_asset_ata: UncheckedAccount<'info>,

    /// User making the redemption
    #[account(mut)]
    pub user: Signer<'info>,

    /// System program
    pub system_program: Program<'info, System>,

    /// Asset token program (SPL Token or Token-2022)
    /// CHECK: Validated by Carrot program
    pub asset_token_program: UncheckedAccount<'info>,

    /// Shares token program (Token-2022 for CRT)
    /// CHECK: Validated by Carrot program
    pub shares_token_program: UncheckedAccount<'info>,

    /// Carrot log program
    /// CHECK: Validated by Carrot program
    pub log_program: UncheckedAccount<'info>,

    /// Carrot program for CPI
    pub carrot_program: Program<'info, Carrot>,
}
