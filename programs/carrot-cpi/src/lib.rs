use anchor_lang::prelude::*;

declare_id!("HvVmVrZ9yFrSPp27pmAzdLkqr4ESZ2FW1AgETajoVXDc");

#[program]
pub mod carrot_cpi {
    use super::*;

    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        msg!("Greetings from: {:?}", ctx.program_id);
        Ok(())
    }
}

#[derive(Accounts)]
pub struct Initialize {}
