export const ReservePoolFacetABI = [
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
        "indexed": true,
        "internalType": "address",
        "name": "redeemer",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "workTokensBurned",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ideaTokensOut",
        "type": "uint256"
      }
    ],
    "name": "WorkTokenRedeemed",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      }
    ],
    "name": "getRedemptionRate",
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
      }
    ],
    "name": "getReservePool",
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
            "name": "ideaTokenBalance",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalWorkTokensMinted",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "totalRedeemed",
            "type": "uint256"
          }
        ],
        "internalType": "struct ReservePool",
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
      },
      {
        "internalType": "uint256",
        "name": "workTokenAmount",
        "type": "uint256"
      }
    ],
    "name": "redeem",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
