export const ideaFacetAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "launcher",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "ideaToken",
        "type": "address"
      }
    ],
    "name": "IdeaLaunched",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "getAllIdeas",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "ideaToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "workToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "launcher",
            "type": "address"
          },
          {
            "internalType": "enum IdeaStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduationThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Idea[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      }
    ],
    "name": "getIdea",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "ideaToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "workToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "launcher",
            "type": "address"
          },
          {
            "internalType": "enum IdeaStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduationThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Idea",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "tokenAddress",
        "type": "address"
      }
    ],
    "name": "getIdeaByToken",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "string",
            "name": "name",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "symbol",
            "type": "string"
          },
          {
            "internalType": "address",
            "name": "ideaToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "workToken",
            "type": "address"
          },
          {
            "internalType": "address",
            "name": "launcher",
            "type": "address"
          },
          {
            "internalType": "enum IdeaStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "totalSupply",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduationThreshold",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "createdAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "graduatedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Idea",
        "name": "",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getIdeaCount",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "symbol",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "totalSupply",
        "type": "uint256"
      }
    ],
    "name": "launchIdea",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
