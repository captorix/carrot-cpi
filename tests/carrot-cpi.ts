import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram, Transaction, ComputeBudgetProgram } from "@solana/web3.js";
import {
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
} from "@solana/spl-token";
import { CarrotCpi } from "../target/types/carrot_cpi";

// Known addresses from mainnet
const ADDRESSES = {
  CARROT_PROGRAM: new PublicKey("CarrotwivhMpDnm27EHmRLeQ683Z1PufuqEmBZvD282s"),
  CARROT_LOG_PROGRAM: new PublicKey("7Mc3vSdRWoThArpni6t5W4XjvQf4BuMny1uC8b6VBn48"),
  TOKEN_PROGRAM: new PublicKey("TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"),
  TOKEN_2022_PROGRAM: new PublicKey("TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb"),

  CRT_VAULT: new PublicKey("FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ"),
  CRT_MINT: new PublicKey("CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s"),

  USDC_MINT: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"),
  VAULT_USDC_ATA: new PublicKey("Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U"),

  // Oracles for remaining accounts
  ORACLES: [
    new PublicKey("Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U"),
    new PublicKey("Dpw1EAVrSB1ibxiDQyTAW6Zip3J4Btk2x4SgApQCeFbX"),
    new PublicKey("Hpxgqa8dvk2jSfNgTfdYncxSE2YY2c52TTzPaH1V98RW"),
    new PublicKey("HT2PLQBcG5EiCcNSaMHAjSgd9F98ecpATbk4Sk5oYuM"),
    new PublicKey("4cugtfkFydmoPe9CZJ4wFZzDUEmGJFNaThvumYABTFDS"),
    new PublicKey("9zXQxpYH3kYhtoybmZfUNNCRVuud7fY9jswTg1hLyT8k"),
  ],
};

describe("carrot-cpi", () => {
  const provider = anchor.AnchorProvider.env();
  anchor.setProvider(provider);

  const program = anchor.workspace.CarrotCpi as Program<CarrotCpi>;
  const wallet = provider.wallet as anchor.Wallet;

  it("should call deposit CPI", async () => {
    const user = wallet.publicKey;

    // Get user ATAs
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
      ADDRESSES.TOKEN_2022_PROGRAM
    );

    console.log("\n=== Deposit CPI Test ===");
    console.log("User:", user.toBase58());
    console.log("User USDC ATA:", userUsdcAta.toBase58());
    console.log("User Shares ATA:", userSharesAta.toBase58());

    // First, create user's CRT ATA (Token-2022)
    try {
      const createAtaIx = createAssociatedTokenAccountInstruction(
        user,
        userSharesAta,
        user,
        ADDRESSES.CRT_MINT,
        ADDRESSES.TOKEN_2022_PROGRAM
      );
      const tx = new Transaction().add(createAtaIx);
      await provider.sendAndConfirm(tx);
      console.log("Created user CRT ATA");
    } catch (e: any) {
      // ATA might already exist
      console.log("CRT ATA already exists or creation failed:", e.message?.slice(0, 100));
    }

    // Also create user USDC ATA if needed
    try {
      const createUsdcAtaIx = createAssociatedTokenAccountInstruction(
        user,
        userUsdcAta,
        user,
        ADDRESSES.USDC_MINT,
        ADDRESSES.TOKEN_PROGRAM
      );
      const tx = new Transaction().add(createUsdcAtaIx);
      await provider.sendAndConfirm(tx);
      console.log("Created user USDC ATA");
    } catch (e: any) {
      console.log("USDC ATA already exists or creation failed:", e.message?.slice(0, 100));
    }

    // Build remaining accounts (oracles)
    const remainingAccounts = ADDRESSES.ORACLES.map((pubkey) => ({
      pubkey,
      isSigner: false,
      isWritable: false,
    }));

    const amount = new anchor.BN(100_000_000); // 100 USDC

    try {
      const tx = await program.methods
        .deposit(amount)
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

      console.log("Deposit TX:", tx);
    } catch (e: any) {
      console.log("Error:", e.message);
      if (e.logs) {
        console.log("\nLogs:");
        e.logs.forEach((log: string) => console.log(log));
      }
    }
  });

  it("should call redeem CPI", async () => {
    const user = wallet.publicKey;

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
      ADDRESSES.TOKEN_2022_PROGRAM
    );

    console.log("\n=== Redeem CPI Test ===");
    console.log("User:", user.toBase58());

    const remainingAccounts = ADDRESSES.ORACLES.map((pubkey) => ({
      pubkey,
      isSigner: false,
      isWritable: false,
    }));

    const amount = new anchor.BN(1_000_000); // 1 CRT

    try {
      const tx = await program.methods
        .redeem(amount)
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

      console.log("Redeem TX:", tx);
    } catch (e: any) {
      console.log("Error:", e.message);
      if (e.logs) {
        console.log("\nLogs:");
        e.logs.forEach((log: string) => console.log(log));
      }
    }
  });
});
