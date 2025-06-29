/**
 * @fileoverview CrossChain DeFi Portfolio Action - shows user's positions across all chains
 */

import { formatEther, getContract } from "viem";
import {
    Action,
    HandlerCallback,
    type IAgentRuntime,
    type Memory,
    type State,
} from "@elizaos/core";

import { initWalletProvider, WalletProvider } from "../providers/wallet.ts";

// Contract addresses
const CONTRACT_ADDRESSES = {
    avalancheFuji: {
        hub: "0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab",
        depositor: "0x56Ece20263898124295378c5b8EEf367fE3AC76F"
    },
    baseSepolia: {
        depositor: "0x2c58f9388470Cef9C163d40470BDcE62C0d9888e"
    }
};

const HUB_ABI = [
    {
        "inputs": [{"name": "user", "type": "address"}],
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
    },
    {
        "inputs": [],
        "name": "getProtocolStats",
        "outputs": [
            {
                "components": [
                    {"name": "totalValueLocked", "type": "uint256"},
                    {"name": "totalBorrowed", "type": "uint256"},
                    {"name": "totalUsers", "type": "uint256"},
                    {"name": "averageHealthFactor", "type": "uint256"}
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

const DEPOSITOR_ABI = [
    {
        "inputs": [{"name": "user", "type": "address"}],
        "name": "getUserDeposits",
        "outputs": [
            {
                "components": [
                    {"name": "totalDeposited", "type": "uint256"},
                    {"name": "currentYield", "type": "uint256"},
                    {"name": "strategy", "type": "uint8"},
                    {"name": "autoCompound", "type": "bool"}
                ],
                "name": "",
                "type": "tuple"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    }
];

export class PortfolioAction {
    constructor(private walletProvider: WalletProvider) {}

    async getPortfolioStatus(userAddress: string): Promise<any> {
        console.log(`Getting portfolio status for ${userAddress}`);

        const portfolio: any = {
            userAddress,
            hubProfile: null,
            deposits: {},
            protocolStats: null,
            totalPortfolioValue: "0",
            healthFactor: "0",
            creditScore: "0"
        };

        try {
            // Get hub profile from Avalanche Fuji
            this.walletProvider.switchChain("avalancheFuji");
            const hubClient = this.walletProvider.getPublicClient("avalancheFuji");

            const hubContract = getContract({
                address: CONTRACT_ADDRESSES.avalancheFuji.hub as `0x${string}`,
                abi: HUB_ABI,
                client: hubClient
            });

            // Get user profile
            const userProfile = await hubContract.read.getUserProfile([userAddress as `0x${string}`]) as any;
            portfolio.hubProfile = {
                totalCollateral: formatEther(userProfile.totalCollateral),
                totalBorrowed: formatEther(userProfile.totalBorrowed),
                healthFactor: formatEther(userProfile.healthFactor),
                creditScore: userProfile.creditScore.toString(),
                lastUpdate: new Date(Number(userProfile.lastUpdate) * 1000).toISOString()
            };

            portfolio.healthFactor = formatEther(userProfile.healthFactor);
            portfolio.creditScore = userProfile.creditScore.toString();

            // Get protocol stats
            const protocolStats = await hubContract.read.getProtocolStats() as any;
            portfolio.protocolStats = {
                totalValueLocked: formatEther(protocolStats.totalValueLocked),
                totalBorrowed: formatEther(protocolStats.totalBorrowed),
                totalUsers: protocolStats.totalUsers.toString(),
                averageHealthFactor: formatEther(protocolStats.averageHealthFactor)
            };

            // Get deposits from each chain
            for (const [chainName, contracts] of Object.entries(CONTRACT_ADDRESSES)) {
                if (contracts.depositor) {
                    try {
                        this.walletProvider.switchChain(chainName as any);
                        const client = this.walletProvider.getPublicClient(chainName as any);

                        const depositorContract = getContract({
                            address: contracts.depositor as `0x${string}`,
                            abi: DEPOSITOR_ABI,
                            client: client
                        });

                        const deposits = await depositorContract.read.getUserDeposits([userAddress as `0x${string}`]) as any;
                        portfolio.deposits[chainName] = {
                            totalDeposited: formatEther(deposits.totalDeposited),
                            currentYield: formatEther(deposits.currentYield),
                            strategy: deposits.strategy === 0 ? "Conservative" : deposits.strategy === 1 ? "Balanced" : "Aggressive",
                            autoCompound: deposits.autoCompound
                        };
                    } catch (error) {
                        console.log(`No deposits found on ${chainName}`);
                        portfolio.deposits[chainName] = {
                            totalDeposited: "0",
                            currentYield: "0",
                            strategy: "None",
                            autoCompound: false
                        };
                    }
                }
            }

            // Calculate total portfolio value
            let totalValue = 0;
            if (portfolio.hubProfile) {
                totalValue = parseFloat(portfolio.hubProfile.totalCollateral);
            }
            for (const deposits of Object.values(portfolio.deposits) as any[]) {
                totalValue += parseFloat(deposits.totalDeposited) + parseFloat(deposits.currentYield);
            }
            portfolio.totalPortfolioValue = totalValue.toFixed(6);

            return portfolio;
        } catch (error) {
            console.error("Error getting portfolio status:", error);
            throw error;
        }
    }
}

export const portfolioAction: Action = {
    name: "portfolio",
    description: "Check your CrossChain DeFi portfolio status across all supported chains",
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

        console.log("Portfolio action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new PortfolioAction(walletProvider);

        // Get user address from wallet
        const userAddress = walletProvider.getAddress();

        try {
            const portfolio = await action.getPortfolioStatus(userAddress);
            
            let statusText = `📊 **CrossChain DeFi Portfolio Status**\n\n`;
            statusText += `**Address:** ${portfolio.userAddress}\n`;
            statusText += `**Total Portfolio Value:** ${portfolio.totalPortfolioValue} USD\n`;
            statusText += `**Health Factor:** ${portfolio.healthFactor}\n`;
            statusText += `**Credit Score:** ${portfolio.creditScore}\n\n`;

            if (portfolio.hubProfile) {
                statusText += `**Hub Profile (Avalanche Fuji):**\n`;
                statusText += `• Total Collateral: ${portfolio.hubProfile.totalCollateral} USD\n`;
                statusText += `• Total Borrowed: ${portfolio.hubProfile.totalBorrowed} USD\n`;
                statusText += `• Last Update: ${portfolio.hubProfile.lastUpdate}\n\n`;
            }

            statusText += `**Deposits by Chain:**\n`;
            for (const [chain, deposits] of Object.entries(portfolio.deposits) as [string, any][]) {
                statusText += `**${chain.charAt(0).toUpperCase() + chain.slice(1)}:**\n`;
                statusText += `• Deposited: ${deposits.totalDeposited} USD\n`;
                statusText += `• Current Yield: ${deposits.currentYield} USD\n`;
                statusText += `• Strategy: ${deposits.strategy}\n`;
                statusText += `• Auto-compound: ${deposits.autoCompound ? "Enabled" : "Disabled"}\n\n`;
            }

            if (portfolio.protocolStats) {
                statusText += `**Protocol Statistics:**\n`;
                statusText += `• Total Value Locked: ${portfolio.protocolStats.totalValueLocked} USD\n`;
                statusText += `• Total Borrowed: ${portfolio.protocolStats.totalBorrowed} USD\n`;
                statusText += `• Total Users: ${portfolio.protocolStats.totalUsers}\n`;
                statusText += `• Average Health Factor: ${portfolio.protocolStats.averageHealthFactor}\n`;
            }

            if (callback) {
                callback({
                    text: statusText,
                    content: {
                        success: true,
                        portfolio: portfolio,
                        action: "portfolio_status",
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error getting portfolio:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error getting portfolio status: ${error.message}`,
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
                    text: "I'll check your portfolio status across all chains",
                    action: "PORTFOLIO",
                },
            },
            {
                user: "user",
                content: {
                    text: "Show me my portfolio",
                    action: "PORTFOLIO",
                },
            },
            {
                user: "user",
                content: {
                    text: "What's my current position?",
                    action: "PORTFOLIO",
                },
            },
            {
                user: "user",
                content: {
                    text: "Check my CrossChain DeFi status",
                    action: "PORTFOLIO",
                },
            },
        ],
    ],
    similes: ["PORTFOLIO", "STATUS", "BALANCE", "POSITION", "ACCOUNT"],
}; 