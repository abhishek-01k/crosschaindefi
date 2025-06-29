/**
 * @fileoverview CrossChain DeFi Repay Action - handles loan repayment through the hub chain
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
import type { RepayParams, Transaction } from "../types/index.ts";
import { repayTemplate } from "../templates/index.ts";

// Hub contract is deployed on Avalanche Fuji
const HUB_CONTRACT_ADDRESS = "0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab";
const HUB_CHAIN = "avalancheFuji";

// Token addresses on hub chain
const TOKEN_ADDRESSES = {
    USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
    LINK: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"
};

const HUB_ABI = [
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

const ERC20_ABI = [
    {
        "inputs": [{"name": "spender", "type": "address"}, {"name": "amount", "type": "uint256"}],
        "name": "approve",
        "outputs": [{"name": "", "type": "bool"}],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [{"name": "account", "type": "address"}],
        "name": "balanceOf",
        "outputs": [{"name": "", "type": "uint256"}],
        "stateMutability": "view",
        "type": "function"
    }
];

export class RepayAction {
    constructor(private walletProvider: WalletProvider) {}

    async repay(params: RepayParams): Promise<Transaction> {
        const { tokenSymbol, amount } = params;
        
        console.log(`Repaying ${amount} ${tokenSymbol}`);

        // Always use hub chain for repayment
        this.walletProvider.switchChain(HUB_CHAIN);
        const walletClient = this.walletProvider.getWalletClient(HUB_CHAIN);

        // Get token address
        const tokenAddress = TOKEN_ADDRESSES[tokenSymbol as keyof typeof TOKEN_ADDRESSES];
        if (!tokenAddress) {
            throw new Error(`Token ${tokenSymbol} not supported`);
        }

        try {
            // First check user's current debt
            const hubContract = getContract({
                address: HUB_CONTRACT_ADDRESS as `0x${string}`,
                abi: HUB_ABI,
                client: walletClient
            });

            const userProfile = await hubContract.read.getUserProfile([walletClient.account!.address]) as any;
            console.log("User profile before repay:", userProfile);

            if (userProfile.totalBorrowed === BigInt(0)) {
                throw new Error("No outstanding debt to repay");
            }

            // Check token balance
            const tokenContract = getContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                client: walletClient
            });

            const amountWei = parseEther(amount.toString());
            const balance = await tokenContract.read.balanceOf([walletClient.account!.address]) as any;
            
            if (BigInt(balance) < amountWei) {
                throw new Error(`Insufficient ${tokenSymbol} balance. Required: ${amount}, Available: ${formatEther(BigInt(balance))}`);
            }

            // Approve token spending
            console.log(`Approving ${amount} ${tokenSymbol} for repayment...`);
            const approveHash = await tokenContract.write.approve([
                HUB_CONTRACT_ADDRESS as `0x${string}`,
                amountWei
            ]);

            console.log(`Approval transaction: ${approveHash}`);

            // Repay the loan
            console.log(`Repaying ${amount} ${tokenSymbol}...`);
            const repayHash = await hubContract.write.repay([
                tokenAddress as `0x${string}`,
                amountWei
            ]);

            return {
                hash: repayHash,
                from: walletClient.account!.address,
                to: HUB_CONTRACT_ADDRESS as `0x${string}`,
                value: BigInt(0),
                data: "0x",
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Repay failed: ${error.message}`);
            } else {
                throw new Error(`Repay failed: unknown error`);
            }
        }
    }
}

const buildRepayParams = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<RepayParams> => {
    const supportedTokens = Object.keys(TOKEN_ADDRESSES);
    state.supportedTokens = supportedTokens.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: repayTemplate,
    });

    const repayDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as RepayParams;

    return repayDetails;
};

export const repayAction: Action = {
    name: "repay",
    description: "Repay borrowed tokens to the CrossChain DeFi protocol",
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

        console.log("Repay action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new RepayAction(walletProvider);

        const repayParams = await buildRepayParams(state, runtime, walletProvider);

        try {
            const txResponse = await action.repay(repayParams);
            if (callback) {
                callback({
                    text: `Successfully repaid ${repayParams.amount} ${repayParams.tokenSymbol}!\nTransaction Hash: ${txResponse.hash}\nYour health factor should improve and you may now be able to borrow more or withdraw collateral.`,
                    content: {
                        success: true,
                        hash: txResponse.hash,
                        amount: repayParams.amount,
                        token: repayParams.tokenSymbol,
                        action: "repay",
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during repay:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error repaying: ${error.message}`,
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
                    text: "I'll help you repay your loan",
                    action: "REPAY",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to repay 250 USDC",
                    action: "REPAY",
                },
            },
            {
                user: "user",
                content: {
                    text: "Please repay 5 LINK from my loan",
                    action: "REPAY",
                },
            },
        ],
    ],
    similes: ["REPAY", "PAY_BACK", "RETURN_LOAN", "SETTLE_DEBT"],
}; 