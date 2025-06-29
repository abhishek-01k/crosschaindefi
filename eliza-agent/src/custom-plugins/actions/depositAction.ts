/**
 * @fileoverview CrossChain DeFi Deposit Action - handles deposits on spoke chains
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
import type { DepositParams, Transaction } from "../types/index.ts";
import { depositTemplate } from "../templates/index.ts";

// Deployed contract addresses from our deployment
const CONTRACT_ADDRESSES = {
    avalancheFuji: {
        depositor: "0x56Ece20263898124295378c5b8EEf367fE3AC76F",
        hub: "0x2519bA8D5f7F64fACC712abc32195FA3a53c02ab"
    },
    baseSepolia: {
        depositor: "0x2c58f9388470Cef9C163d40470BDcE62C0d9888e"
    }
};

// Mock ERC20 token addresses for testnets
const TOKEN_ADDRESSES = {
    avalancheFuji: {
        USDC: "0x5425890298aed601595a70AB815c96711a31Bc65",
        LINK: "0x0b9d5D9136855f6FEc3c0993feE6E9CE8a297846"
    },
    baseSepolia: {
        USDC: "0x036CbD53842c5426634e7929541eC2318f3dCF7e",
        LINK: "0xE4aB69C077896252FAFBD49EFD26B5D171A32410"
    }
};

const DEPOSITOR_ABI = [
    {
        "inputs": [
            {"name": "token", "type": "address"},
            {"name": "amount", "type": "uint256"},
            {"name": "strategy", "type": "uint8"},
            {"name": "autoCompound", "type": "bool"}
        ],
        "name": "deposit",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {"name": "token", "type": "address"},
            {"name": "amount", "type": "uint256"}
        ],
        "name": "withdraw",
        "outputs": [],
        "stateMutability": "nonpayable",
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

export class DepositAction {
    constructor(private walletProvider: WalletProvider) {}

    async deposit(params: DepositParams): Promise<Transaction> {
        const { chainName, tokenSymbol, amount, strategy, autoCompound } = params;
        
        console.log(`Depositing ${amount} ${tokenSymbol} on ${chainName}`);

        // Get contract addresses for the chain
        const contractInfo = CONTRACT_ADDRESSES[chainName as keyof typeof CONTRACT_ADDRESSES];
        if (!contractInfo || !contractInfo.depositor) {
            throw new Error(`Depositor contract not deployed on ${chainName}`);
        }

        const tokenInfo = TOKEN_ADDRESSES[chainName as keyof typeof TOKEN_ADDRESSES];
        if (!tokenInfo || !tokenInfo[tokenSymbol as keyof typeof tokenInfo]) {
            throw new Error(`Token ${tokenSymbol} not supported on ${chainName}`);
        }

        const tokenAddress = tokenInfo[tokenSymbol as keyof typeof tokenInfo];
        const depositorAddress = contractInfo.depositor;

        this.walletProvider.switchChain(chainName as any);
        const walletClient = this.walletProvider.getWalletClient(chainName as any);
        
        try {
            // First approve the token
            const tokenContract = getContract({
                address: tokenAddress as `0x${string}`,
                abi: ERC20_ABI,
                client: walletClient
            });

            const amountWei = parseEther(amount.toString());
            
            console.log(`Approving ${amount} ${tokenSymbol} for deposit...`);
            const approveHash = await tokenContract.write.approve([
                depositorAddress as `0x${string}`,
                amountWei
            ]);

            console.log(`Approval transaction: ${approveHash}`);

            // Then deposit
            const depositorContract = getContract({
                address: depositorAddress as `0x${string}`,
                abi: DEPOSITOR_ABI,
                client: walletClient
            });

            console.log(`Depositing ${amount} ${tokenSymbol}...`);
            const depositHash = await depositorContract.write.deposit([
                tokenAddress as `0x${string}`,
                amountWei,
                strategy, // 0 = Conservative, 1 = Balanced, 2 = Aggressive
                autoCompound
            ]);

            return {
                hash: depositHash,
                from: walletClient.account!.address,
                to: depositorAddress as `0x${string}`,
                value: BigInt(0),
                data: "0x",
            };
        } catch (error) {
            if (error instanceof Error) {
                throw new Error(`Deposit failed: ${error.message}`);
            } else {
                throw new Error(`Deposit failed: unknown error`);
            }
        }
    }
}

const buildDepositParams = async (
    state: State,
    runtime: IAgentRuntime,
    wp: WalletProvider
): Promise<DepositParams> => {
    const chains = Object.keys(wp.chains);
    state.supportedChains = chains.map((item) => `"${item}"`).join("|");

    const context = composeContext({
        state,
        template: depositTemplate,
    });

    const depositDetails = (await generateObjectDeprecated({
        runtime,
        context,
        modelClass: ModelClass.SMALL,
    })) as DepositParams;

    return depositDetails;
};

export const depositAction: Action = {
    name: "deposit",
    description: "Deposit tokens as collateral on a supported chain (Avalanche Fuji, Base Sepolia)",
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

        console.log("Deposit action handler called");
        const walletProvider = await initWalletProvider(runtime);
        const action = new DepositAction(walletProvider);

        const depositParams = await buildDepositParams(state, runtime, walletProvider);

        try {
            const txResponse = await action.deposit(depositParams);
            if (callback) {
                callback({
                    text: `Successfully deposited ${depositParams.amount} ${depositParams.tokenSymbol} on ${depositParams.chainName}!\nTransaction Hash: ${txResponse.hash}\nStrategy: ${depositParams.strategy === 0 ? 'Conservative' : depositParams.strategy === 1 ? 'Balanced' : 'Aggressive'}\nAuto-compound: ${depositParams.autoCompound ? 'Enabled' : 'Disabled'}`,
                    content: {
                        success: true,
                        hash: txResponse.hash,
                        amount: depositParams.amount,
                        token: depositParams.tokenSymbol,
                        chain: depositParams.chainName,
                        strategy: depositParams.strategy,
                        autoCompound: depositParams.autoCompound,
                    },
                });
            }
            return true;
        } catch (error) {
            console.error("Error during deposit:", error);
            if (error instanceof Error) {
                if (callback) {
                    callback({
                        text: `Error depositing: ${error.message}`,
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
                    text: "I'll help you deposit tokens as collateral",
                    action: "DEPOSIT",
                },
            },
            {
                user: "user",
                content: {
                    text: "I want to deposit 100 USDC on Avalanche Fuji with conservative strategy and auto-compound enabled",
                    action: "DEPOSIT",
                },
            },
            {
                user: "user",
                content: {
                    text: "Please deposit 50 LINK on Base Sepolia with balanced strategy",
                    action: "DEPOSIT",
                },
            },
        ],
    ],
    similes: ["DEPOSIT", "COLLATERAL_DEPOSIT", "SUPPLY", "LEND"],
}; 