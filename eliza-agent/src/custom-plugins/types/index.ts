import * as viemChains from "viem/chains";
import type { Hash, Address } from "viem";

// Supported chains for cross-chain operations
const _SupportedChainList = ["mainnet", "avalancheFuji", "baseSepolia", "sepolia"] as const;

export type SupportedChain = (typeof _SupportedChainList)[number];

export interface GetGiftParams {
    code: string;
    address: `0x${string}`;
}

export interface DepositParams {
    chainName: string;
    tokenSymbol: string;
    amount: number;
    strategy: number; // 0 = Conservative, 1 = Balanced, 2 = Aggressive
    autoCompound: boolean;
}

export interface BorrowParams {
    tokenSymbol: string;
    amount: number;
    destinationChain: string;
}

export interface RepayParams {
    tokenSymbol: string;
    amount: number;
}

export interface WithdrawParams {
    chainName: string;
    tokenSymbol: string;
    amount: number;
}

export interface Transaction {
    hash: Hash;
    from: Address;
    to: Address;
    value: bigint;
    data?: `0x${string}`;
    chainId?: number;
}