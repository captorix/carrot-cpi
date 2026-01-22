import { PublicKey } from "@solana/web3.js";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import * as fs from "fs";

// Test wallet pubkey (default solana keygen)
// Run: solana address to get your wallet
const MINT_AUTHORITY = new PublicKey("H1MppW7MRXyvE5bB5T8zs2boakg2JhwqVEF6qoRrCu5J");

function createMintData(
  decimals: number,
  supply: bigint,
  mintAuthority: PublicKey
): Buffer {
  // SPL Token Mint Layout (82 bytes):
  // - mintAuthorityOption: u32 (4 bytes) - 1 = Some, 0 = None
  // - mintAuthority: Pubkey (32 bytes)
  // - supply: u64 (8 bytes)
  // - decimals: u8 (1 byte)
  // - isInitialized: bool (1 byte)
  // - freezeAuthorityOption: u32 (4 bytes)
  // - freezeAuthority: Pubkey (32 bytes)
  // Total: 82 bytes

  const data = Buffer.alloc(82);
  let offset = 0;

  // mintAuthorityOption = 1 (Some)
  data.writeUInt32LE(1, offset);
  offset += 4;

  // mintAuthority
  mintAuthority.toBuffer().copy(data, offset);
  offset += 32;

  // supply
  data.writeBigUInt64LE(supply, offset);
  offset += 8;

  // decimals
  data.writeUInt8(decimals, offset);
  offset += 1;

  // isInitialized = true
  data.writeUInt8(1, offset);
  offset += 1;

  // freezeAuthorityOption = 1 (Some)
  data.writeUInt32LE(1, offset);
  offset += 4;

  // freezeAuthority
  mintAuthority.toBuffer().copy(data, offset);

  return data;
}

function createTokenAccountData(
  mint: PublicKey,
  owner: PublicKey,
  amount: bigint
): Buffer {
  // SPL Token Account Layout (165 bytes):
  // - mint: Pubkey (32 bytes)
  // - owner: Pubkey (32 bytes)
  // - amount: u64 (8 bytes)
  // - delegateOption: u32 (4 bytes)
  // - delegate: Pubkey (32 bytes)
  // - state: u8 (1 byte) - 1 = initialized
  // - isNativeOption: u32 (4 bytes)
  // - isNative: u64 (8 bytes)
  // - delegatedAmount: u64 (8 bytes)
  // - closeAuthorityOption: u32 (4 bytes)
  // - closeAuthority: Pubkey (32 bytes)
  // Total: 165 bytes

  const data = Buffer.alloc(165);
  let offset = 0;

  // mint
  mint.toBuffer().copy(data, offset);
  offset += 32;

  // owner
  owner.toBuffer().copy(data, offset);
  offset += 32;

  // amount
  data.writeBigUInt64LE(amount, offset);
  offset += 8;

  // delegateOption = 0 (None)
  data.writeUInt32LE(0, offset);
  offset += 4;

  // delegate (32 bytes of zeros)
  offset += 32;

  // state = 1 (Initialized)
  data.writeUInt8(1, offset);
  offset += 1;

  // isNativeOption = 0 (None)
  data.writeUInt32LE(0, offset);
  offset += 4;

  // isNative (8 bytes of zeros)
  offset += 8;

  // delegatedAmount (8 bytes of zeros)
  offset += 8;

  // closeAuthorityOption = 0 (None)
  data.writeUInt32LE(0, offset);

  return data;
}

function saveAccount(
  filename: string,
  address: string,
  data: Buffer,
  owner: string,
  lamports: number
) {
  const account = {
    pubkey: address,
    account: {
      lamports,
      data: [data.toString("base64"), "base64"],
      owner,
      executable: false,
      rentEpoch: 0,
    },
  };

  fs.writeFileSync(filename, JSON.stringify(account, null, 2));
  console.log(`Created: ${filename}`);
}

// ===== USDC Mint =====
const USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";
const USDC_DECIMALS = 6;

const usdcMintData = createMintData(
  USDC_DECIMALS,
  BigInt("1000000000000000"), // 1 billion USDC supply
  MINT_AUTHORITY
);

saveAccount(
  "./accounts/usdc-mint.json",
  USDC_MINT,
  usdcMintData,
  TOKEN_PROGRAM_ID.toBase58(),
  1461600
);

// ===== Vault USDC ATA =====
const VAULT_USDC_ATA = "Gfedc4JEmMahEMBJXcXfLHWgNs9d7UzLPq1tkba5S11U";
const CRT_VAULT = new PublicKey("FfCRL34rkJiMiX5emNDrYp3MdWH2mES3FvDQyFppqgpJ");

const vaultUsdcData = createTokenAccountData(
  new PublicKey(USDC_MINT),
  CRT_VAULT,
  BigInt("100000000000") // 100,000 USDC
);

saveAccount(
  "./accounts/vault-usdc-ata.json",
  VAULT_USDC_ATA,
  vaultUsdcData,
  TOKEN_PROGRAM_ID.toBase58(),
  2039280
);

// ===== User USDC ATA =====
// This needs to match the user's wallet
const USER_USDC_ATA = "Gdj1UZfLYxXKUtr3RTHw6G6Kz76GHxAyA45Kz9yV3d8n";

const userUsdcData = createTokenAccountData(
  new PublicKey(USDC_MINT),
  MINT_AUTHORITY, // user's wallet
  BigInt("10000000000") // 10,000 USDC
);

saveAccount(
  "./accounts/user-usdc-ata.json",
  USER_USDC_ATA,
  userUsdcData,
  TOKEN_PROGRAM_ID.toBase58(),
  2039280
);
