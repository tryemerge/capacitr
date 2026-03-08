export const contextFacetAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "name": "ModuleContextUpdated",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "author",
        "type": "address"
      }
    ],
    "name": "SystemContextUpdated",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getModuleContext",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry",
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
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getModuleContextAt",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry",
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
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getModuleContextCount",
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
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getModuleContextHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry[]",
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
        "name": "moduleId",
        "type": "uint256"
      }
    ],
    "name": "getModuleKeys",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getSystemContext",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry",
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
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "index",
        "type": "uint256"
      }
    ],
    "name": "getSystemContextAt",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry",
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
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getSystemContextCount",
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
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      }
    ],
    "name": "getSystemContextHistory",
    "outputs": [
      {
        "components": [
          {
            "internalType": "bytes32",
            "name": "contentHash",
            "type": "bytes32"
          },
          {
            "internalType": "address",
            "name": "author",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "timestamp",
            "type": "uint256"
          }
        ],
        "internalType": "struct LibContext.ContextEntry[]",
        "name": "",
        "type": "tuple[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getSystemKeys",
    "outputs": [
      {
        "internalType": "bytes32[]",
        "name": "",
        "type": "bytes32[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "moduleId",
        "type": "uint256"
      },
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      }
    ],
    "name": "setModuleContext",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "key",
        "type": "bytes32"
      },
      {
        "internalType": "bytes32",
        "name": "contentHash",
        "type": "bytes32"
      }
    ],
    "name": "setSystemContext",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
