export const moduleRegistryFacetAbi = [
  {
    "inputs": [],
    "name": "DiamondWritable__InvalidInitializationParameters",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__RemoveTargetNotZeroAddress",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__ReplaceTargetIsIdentical",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__SelectorAlreadyAdded",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__SelectorIsImmutable",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__SelectorNotFound",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__SelectorNotSpecified",
    "type": "error"
  },
  {
    "inputs": [],
    "name": "DiamondWritable__TargetHasNoCode",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "components": [
          {
            "internalType": "address",
            "name": "target",
            "type": "address"
          },
          {
            "internalType": "enum IERC2535DiamondCutInternal.FacetCutAction",
            "name": "action",
            "type": "uint8"
          },
          {
            "internalType": "bytes4[]",
            "name": "selectors",
            "type": "bytes4[]"
          }
        ],
        "indexed": false,
        "internalType": "struct IERC2535DiamondCutInternal.FacetCut[]",
        "name": "facetCuts",
        "type": "tuple[]"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "target",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "data",
        "type": "bytes"
      }
    ],
    "name": "DiamondCut",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "moduleId",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "installedBy",
        "type": "address"
      }
    ],
    "name": "ModuleInstalled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "installer",
        "type": "address"
      }
    ],
    "name": "ModuleInstallerAdded",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "address",
        "name": "installer",
        "type": "address"
      }
    ],
    "name": "ModuleInstallerRemoved",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "bytes32",
        "name": "moduleId",
        "type": "bytes32"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "removedBy",
        "type": "address"
      }
    ],
    "name": "ModuleUninstalled",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "installer",
        "type": "address"
      }
    ],
    "name": "addModuleInstaller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getInstalledModuleIds",
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
        "name": "moduleId",
        "type": "bytes32"
      }
    ],
    "name": "getModule",
    "outputs": [
      {
        "internalType": "string",
        "name": "name",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "version",
        "type": "string"
      },
      {
        "internalType": "address",
        "name": "installerContract",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "installedBy",
        "type": "address"
      },
      {
        "internalType": "uint256",
        "name": "installedAt",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "active",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes4",
        "name": "selector",
        "type": "bytes4"
      }
    ],
    "name": "getModuleForSelector",
    "outputs": [
      {
        "internalType": "bytes32",
        "name": "",
        "type": "bytes32"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "moduleContract",
        "type": "address"
      }
    ],
    "name": "installModule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "moduleId",
        "type": "bytes32"
      }
    ],
    "name": "isModuleInstalled",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "account",
        "type": "address"
      }
    ],
    "name": "isModuleInstaller",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "installer",
        "type": "address"
      }
    ],
    "name": "removeModuleInstaller",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "moduleId",
        "type": "bytes32"
      }
    ],
    "name": "uninstallModule",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
