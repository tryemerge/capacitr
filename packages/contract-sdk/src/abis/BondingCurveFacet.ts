export const bondingCurveFacetAbi = [
  {
    "inputs": [],
    "name": "ReentrancyGuard__ReentrantCall",
    "type": "error"
  },
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
        "internalType": "address",
        "name": "workToken",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "marketCap",
        "type": "uint256"
      }
    ],
    "name": "IdeaGraduated",
    "type": "event"
  },
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
        "indexed": true,
        "internalType": "address",
        "name": "buyer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ethIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokensOut",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ethFee",
        "type": "uint256"
      }
    ],
    "name": "TokensPurchased",
    "type": "event"
  },
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
        "indexed": true,
        "internalType": "address",
        "name": "seller",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokensIn",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ethOut",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "tokenFee",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ethFee",
        "type": "uint256"
      }
    ],
    "name": "TokensSold",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minTokensOut",
        "type": "uint256"
      }
    ],
    "name": "buy",
    "outputs": [],
    "stateMutability": "payable",
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
    "name": "getCurveConfig",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "virtualEthReserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "virtualTokenReserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "realEthReserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "realTokenReserve",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ethFeePercent",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "tokenFeePercent",
            "type": "uint256"
          },
          {
            "internalType": "bool",
            "name": "active",
            "type": "bool"
          }
        ],
        "internalType": "struct BondingCurveConfig",
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
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      }
    ],
    "name": "getPrice",
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
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "ethAmount",
        "type": "uint256"
      }
    ],
    "name": "getQuoteBuy",
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
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenAmount",
        "type": "uint256"
      }
    ],
    "name": "getQuoteSell",
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
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "tokenAmount",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "minEthOut",
        "type": "uint256"
      }
    ],
    "name": "sell",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
