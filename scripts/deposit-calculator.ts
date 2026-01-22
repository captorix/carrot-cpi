import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { AnchorProvider, Wallet, BN } from "@coral-xyz/anchor";
import { RpcClient, Common } from "@carrot-protocol/rpc-client";

// Constants
const CRT_VAULT = new PublicKey("FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ");
const CRT_MINT = new PublicKey("CRTx1JouZhzSU6XytsE42UQraoGqiHgxabocVfARTy2s");
const USDC_MINT = new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v");
const USDC_DECIMALS = 6;

// RPC endpoint (use your own or a public one)
const RPC_URL = "https://mainnet.helius-rpc.com/?api-key=081f3779-8e32-4d27-b875-3f02d937173a";

/**
 * Calculate how many CRT tokens you will receive for a given USDC amount.
 */
async function calculateCrtOutput(usdcAmountUi: number): Promise<{
  crtAmountUi: number;
  crtAmountRaw: BN;
  nav: number;
  depositUsdValue: number;
}> {
  const connection = new Connection(RPC_URL, "confirmed");

  // Create a dummy wallet for read-only operations
  const dummyKeypair = Keypair.generate();
  const provider = new AnchorProvider(
    connection,
    new Wallet(dummyKeypair),
    { commitment: "confirmed" }
  );

  const client = new RpcClient({
    provider,
    useJito: false,
    feeAmount: 0,
  });

  // Fetch vault data
  const vaultData = await client.getVault(CRT_VAULT);

  // Find USDC asset data
  const usdcAsset = vaultData.assets.find((asset) =>
    asset.mint.equals(USDC_MINT)
  );

  if (!usdcAsset) {
    throw new Error("USDC asset not found in vault");
  }

  // Convert USDC UI amount to raw amount
  const usdcAmountRaw = Common.uiToAmount(usdcAmountUi, USDC_DECIMALS);

  // Calculate USD value of the deposit
  const depositUsdValue = Common.amountToUsd(
    usdcAmountRaw,
    usdcAsset.mintDecimals,
    usdcAsset.priceAvg
  );

  // Calculate CRT shares earned
  const crtAmountUi = Common.sharesEarned(depositUsdValue, vaultData.navPostFee);
  const crtAmountRaw = Common.uiToAmount(crtAmountUi, vaultData.sharesDecimals);

  return {
    crtAmountUi,
    crtAmountRaw,
    nav: vaultData.navPostFee,
    depositUsdValue,
  };
}

/**
 * Create deposit (issue) instructions for CRT vault.
 * Returns the instructions - you need to sign and send them yourself.
 */
async function createDepositInstructions(
  userPublicKey: PublicKey,
  usdcAmountUi: number
) {
  const connection = new Connection(RPC_URL, "confirmed");

  // Create a dummy wallet for instruction preparation
  const dummyKeypair = Keypair.generate();
  const provider = new AnchorProvider(
    connection,
    new Wallet(dummyKeypair),
    { commitment: "confirmed" }
  );

  const client = new RpcClient({
    provider,
    useJito: false,
    feeAmount: 0,
  });

  // Convert USDC amount to raw
  const usdcAmountRaw = Common.uiToAmount(usdcAmountUi, USDC_DECIMALS);

  // Prepare issue instructions
  const issueIxns = await client.prepareIssue(
    CRT_VAULT,
    userPublicKey,
    USDC_MINT,
    usdcAmountRaw
  );

  return issueIxns;
}

/**
 * Full deposit flow (requires actual wallet with funds).
 */
async function executeDeposit(
  wallet: Wallet,
  usdcAmountUi: number
): Promise<string> {
  const connection = new Connection(RPC_URL, "confirmed");

  const provider = new AnchorProvider(connection, wallet, {
    commitment: "confirmed",
  });

  const client = new RpcClient({
    provider,
    useJito: false,
    feeAmount: 0,
  });

  // Convert USDC amount to raw
  const usdcAmountRaw = Common.uiToAmount(usdcAmountUi, USDC_DECIMALS);

  // Execute issue transaction
  const txSig = await client.issue(CRT_VAULT, USDC_MINT, usdcAmountRaw);

  return txSig;
}

// Main execution
async function main() {
  // Get USDC amount from command line argument
  const usdcAmountArg = process.argv[2];

  if (!usdcAmountArg) {
    console.log("Usage: ts-node scripts/deposit-calculator.ts <USDC_AMOUNT>");
    console.log("Example: ts-node scripts/deposit-calculator.ts 100");
    process.exit(1);
  }

  const usdcAmount = parseFloat(usdcAmountArg);

  if (isNaN(usdcAmount) || usdcAmount <= 0) {
    console.error("Invalid USDC amount");
    process.exit(1);
  }

  console.log("\n=== CRT Deposit Calculator ===\n");
  console.log(`Input: ${usdcAmount} USDC`);

  try {
    const result = await calculateCrtOutput(usdcAmount);

    console.log("\n--- Calculation Result ---");
    console.log(`NAV (price per CRT): $${result.nav.toFixed(6)}`);
    console.log(`Deposit USD Value: $${result.depositUsdValue.toFixed(2)}`);
    console.log(`CRT Output: ${result.crtAmountUi.toFixed(6)} CRT`);
    console.log(`CRT Output (raw): ${result.crtAmountRaw.toString()}`);

    // Show how to create instructions
    console.log("\n--- Creating Instructions Example ---");
    const dummyUser = Keypair.generate().publicKey;
    const instructions = await createDepositInstructions(dummyUser, usdcAmount);
    console.log(`Number of instructions: ${instructions.length}\n`);

    instructions.forEach((ix, index) => {
      console.log(`--- Instruction ${index + 1} ---`);
      console.log(`Program ID: ${ix.programId.toBase58()}`);
      console.log(`Data (hex): ${ix.data.toString("hex")}`);
      console.log(`Data (base64): ${ix.data.toString("base64")}`);
      console.log(`Keys (${ix.keys.length}):`);
      ix.keys.forEach((key, keyIndex) => {
        console.log(
          `  [${keyIndex}] ${key.pubkey.toBase58()} (signer: ${key.isSigner}, writable: ${key.isWritable})`
        );
      });
      console.log("");
    });
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

main();
