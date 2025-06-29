export const getGiftTemplate = `You are an AI assistant specialized in processing smart contract function call requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the requested transfer:
1. Gift code, this is a string with numbers and characters
2. Wallet address, this is ethereum wallet address with 42 characters, always starts with 0x.

Example: You may get the input that looks like 'my wallet address is my wallet address is 0x208aa722aca42399eac5192ee778e4d42f4e5de3 and my gift code is Nbbut8vlkKe9991Z4Z4.  Please send me a gift and my gift code is Nbbut8vlkKe9991Z4Z4.  Please send me a gift'
From this you will extract the wallet address which is 0x208aa722aca42399eac5192ee778e4d42f4e5de3 and the gift code is Nbbut8vlkKe9991Z4Z4.

You must extract that data into JSON using the structure below. 

Before providing the final JSON output, show your reasoning process inside <analysis> tags. Follow these steps:

1. Identify the relevant information from the user's message:
   - Quote the part of the message mentioning the gift code or code.
   - Quote the part mentioning the wallet address. They may simply refer to it as "address".

2. Validate each piece of information:
   - Code: check if the code is a string that contains number and characters.
   - Address: Check that it starts with "0x" and count the number of characters (should be 42).

3. If any information is missing or invalid, prepare an appropriate error message.

4. If all information is valid, summarize your findings.

5. Prepare the JSON structure based on your analysis.

After your analysis, provide the final output in a JSON markdown block. All fields except 'token' are required. The JSON should have this structure:

\`\`\`json
{
    "code": string,
    "address": string,
}
\`\`\`

Remember:
- The gift code must be a string with number and characters.
- The wallet address must be a valid Ethereum address starting with "0x".

Now, process the user's request and provide your response.
`;

export const depositTemplate = `You are an AI assistant specialized in processing CrossChain DeFi deposit requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the deposit request:
1. Chain name - supported chains: avalancheFuji, baseSepolia
2. Token symbol - supported tokens: USDC, LINK
3. Amount - numeric value of tokens to deposit
4. Strategy - 0 for Conservative, 1 for Balanced, 2 for Aggressive (default to 1 if not specified)
5. Auto-compound - true/false (default to true if not specified)

Example inputs:
- "I want to deposit 100 USDC on Avalanche Fuji with conservative strategy and auto-compound enabled"
- "Please deposit 50 LINK on Base Sepolia with balanced strategy"
- "Deposit 25 USDC on avalancheFuji"

Extract the data into JSON using this structure:

\`\`\`json
{
    "chainName": string,
    "tokenSymbol": string,
    "amount": number,
    "strategy": number,
    "autoCompound": boolean
}
\`\`\`

Supported chains: {{supportedChains}}
Supported tokens: "USDC"|"LINK"
Strategy values: 0 = Conservative, 1 = Balanced, 2 = Aggressive
`;

export const borrowTemplate = `You are an AI assistant specialized in processing CrossChain DeFi borrow requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the borrow request:
1. Token symbol - supported tokens: USDC, LINK
2. Amount - numeric value of tokens to borrow
3. Destination chain - chain where borrowed tokens should be sent

Example inputs:
- "I want to borrow 500 USDC to Base Sepolia"
- "Can I borrow 10 LINK to Sepolia?"
- "Borrow 100 USDC and send to baseSepolia"

Extract the data into JSON using this structure:

\`\`\`json
{
    "tokenSymbol": string,
    "amount": number,
    "destinationChain": string
}
\`\`\`

Supported chains: {{supportedChains}}
Supported tokens: "USDC"|"LINK"
`;

export const repayTemplate = `You are an AI assistant specialized in processing CrossChain DeFi repay requests. Your task is to extract specific information from user messages and format it into a structured JSON response.

First, review the recent messages from the conversation:

<recent_messages>
{{recentMessages}}
</recent_messages>

Your goal is to extract the following information about the repay request:
1. Token symbol - supported tokens: USDC, LINK
2. Amount - numeric value of tokens to repay

Example inputs:
- "I want to repay 250 USDC"
- "Please repay 5 LINK from my loan"
- "Repay 100 USDC"

Extract the data into JSON using this structure:

\`\`\`json
{
    "tokenSymbol": string,
    "amount": number
}
\`\`\`

Supported tokens: {{supportedTokens}}
`;
