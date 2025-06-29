export * from "./providers/wallet.ts";
export * from "./types/index.ts";

import type { Plugin } from "@elizaos/core";
import { evmWalletProvider } from "./providers/wallet.ts";
import { getGiftAction } from "./actions/getGift.ts";
import { depositAction } from "./actions/depositAction.ts";
import { borrowAction } from "./actions/borrowAction.ts";
import { repayAction } from "./actions/repayAction.ts";

export const crossChainDefiPlugin: Plugin = {
    name: "crossChainDefi",
    description: "CrossChain DeFi protocol integration with deposit, borrow, repay, and portfolio management",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [getGiftAction, depositAction, borrowAction, repayAction],
};

// Keep the old plugin for backward compatibility
export const getGiftPlugin: Plugin = {
    name: "getGift",
    description: "EVM blockchain integration plugin",
    providers: [evmWalletProvider],
    evaluators: [],
    services: [],
    actions: [getGiftAction],
};

export default crossChainDefiPlugin;
