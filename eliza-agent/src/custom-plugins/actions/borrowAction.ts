/**
 * @fileoverview CrossChain DeFi Borrow Action - handles borrowing from the hub chain
 */

import { formatEther, parseEther, getContract } from "viem";
import {
    Action,
    composeContext,
    generateObjectDeprecated,
    HandlerCallback,
    ModelClass,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";
import type { BorrowParams, Transaction } from "../types/index.ts";
import { borrowTemplate } from "../templates/index.ts";

// Hub contract is deployed on Avalanche Fuji
const HUB_CONTRACT_ADDRESS = "0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab";
const HUB_CHAIN = "avalancheFuji";

// Chain selectors for CCIP
const CHAIN_SELECTORS = {
    avalancheFuji: "14767482222434948022",
    baseSepolia: "10344971235874465080",
    sepolia: "16015286601757825753"
};

// Token addresses on different chains
const TOKEN_ADDRESSES = {
    avalancheFuji: {
        USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
        LINK: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"
    },
    baseSepolia: {
        USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        LINK: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410"
    },
    sepolia: {
        USDC: "0x1c7D4B196Cb0C7B01d743Fbc6116a902379C7238",
        LINK: "0x779877A7B0D9E8603169DdbD7836e478b4624789"
    }
};

const HUB_ABI = [
    {
        "inputs": [
            {"name": "token", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "destinationChainSelector", "type": "uint64"}
        ],
        "name": "borrow",
        "outputs": [],
        "stateMutability": "payable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "token", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "repay",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "user", "type": "address"}
        ],
        "name": "getUserProfile",
        "outputs": [
            {
                "components": [
                    {"name": "totalCollateral", "type": "uint256"},
                    {"name": "totalBorrowed", "type": "uint256"},
                    {"name": "healthFactor", "type": "uint256"},
                    {"name": "creditScore", "type": "uint256"},
                    {"name": "lastUpdate", "type": "uint256"}
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export class BorrowAction {
    constructor(private walletProvider: WalletProvider) {}

    async borrow(params: BorrowParams): Promise<Transaction> {
        const { tokenSymbol, amount, destinationChain } = params;
        
        console.log(`Borrowing ${amount} ${tokenSymbol} to ${destinationChain}`);

        // Always use hub chain for borrowing
        this.walletProvider.switchChain(HUB_CHAIN);
        const walletClient = this.walletProvider.getWalletClient(HUB_CHAIN);

        // Get token address on hub chain
        const tokenInfo = TOKEN_ADDRESSES[HUB_CHAIN as keyof typeof TOKEN_ADDRESSES];
        if (!tokenInfo || !tokenInfo[tokenSymbol as keyof typeof tokenInfo]) {
            throw new Error(`Token ${tokenSymbol} not supported on hub chain`);
        }

        const tokenAddress = tokenInfo[tokenSymbol as keyof typeof tokenInfo];
        const destinationChainSelector = CHAIN_SELECTORS[destinationChain as keyof typeof CHAIN_SELECTORS];
        
        if (!destinationChainSelector) {
            throw new Error(`Destination chain ${destinationChain} not supported`);
        }

        try {
            const hubContract = getContract({
                address: HUB_CONTRACT_ADDRESS as `0x${string}`,
                abi: HUB_ABI,
                client: walletClient
            });

            const amountWei = parseEther(amount.toString());

            // Check user's health factor before borrowing
            const userProfile = await hubContract.read.getUserProfile([walletClient.account!.address]) as any;
            console.log("User profile:", userProfile);

            if (userProfile.healthFactor < BigInt(1000000000000000000)) { // 1.0 in 18 decimals
                throw new Error("Health factor too low to borrow");
            }

            console.log(`Borrowing ${amount} ${tokenSymbol} to ${destinationChain}...`);
            // Note: CCIP fees might be required, we're sending 0.1 ETH as fee
            const borrowHash = await hubContract.write.borrow([
                tokenAddress as `0x${string}`,
                amountWei,
                BigInt(destinationChainSelector)
            ], {
                value: parseEther("0.1") // CCIP fee
            });

            return {
                hash: borrowHash,
                from: walletClient.account!.address,
                to: HUB_CONTRACT_ADDRESS as `0x${string}`,
                value: parseEther("0.1"),
                data: "0x",
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Borrow failed: ${error.message}`);
            } else {
                throw new Error(`Borrow failed: unknown error`);
            }
        }
    }
}

const buildBorrowParams = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<BorrowParams> => {
    const chains = Object.keys(CHAIN_SELECTORS);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: borrowTemplate,
    });

    const borrowDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as BorrowParams;

    return borrowDetails;
};

export const borrowAction: Action = {
    name: "borrow",
    description: "Borrow tokens from the CrossChain DeFi protocol using collateral from any supported chain",
    handler: async (
        runtime: IAgentRuntime,
        message: Memory,
        state?: State,
        _options?: any,
        callback?: HandlerCallback
    ) => {
        if (!state) {
            state = (await runtime.composeState(message)) as State;
        } else {
            state = await runtime.updateRecentMessageState(state);
        }

        console.log("Borrow action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new BorrowAction(walletProvider);

        const borrowParams = await buildBorrowParams(state, runtime, walletProvider);

        try {
            const txResponse = await action.borrow(borrowParams);
            if (callback) {
                callback({
                    text: `Successfully initiated borrow of ${borrowParams.amount} ${borrowParams.tokenSymbol} to ${borrowParams.destinationChain}!\nTransaction Hash: ${txResponse.hash}\nThe tokens will be sent to your wallet on ${borrowParams.destinationChain} once the cross-chain message is processed.`,
                    content: {
                        success: true,
                        hash: txResponse.hash,
                        amount: borrowParams.amount,
                        token: borrowParams.tokenSymbol,
                        destinationChain: borrowParams.destinationChain,
                        ccipFee: "0.1 ETH",
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during borrow:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error borrowing: ${error.message}`,
                        content: { error: error.message },
                    });
                }
            }
            return false;
        }
    },
    validate: async (runtime: IAgentRuntime) => {
        const privateKey = runtime.getSetting("EVM_PRIVATE_KEY");
        return typeof privateKey === "string" && privateKey.startsWith("0x");
    },
    examples: [
        [
            {
                user: "assistant",
                content: {
                    text: "I'll help you borrow tokens from the protocol",
                    action: "BORROW",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to borrow 500 USDC to Base Sepolia",
                    action: "BORROW",
                },
            },
            {
                user: "user",
                content: {
                    text: "Can I borrow 10 LINK to Sepolia?",
                    action: "BORROW",
                },
            },
        ],
    ],
    similes: ["BORROW", "LOAN", "CREDIT", "TAKE_LOAN"],
}; 