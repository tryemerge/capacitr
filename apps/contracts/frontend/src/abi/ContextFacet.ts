export const ContextFacetABI = [
  {
    type: 'event',
    name: 'SystemContextUpdated',
    inputs: [
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'contentHash', type: 'bytes32', indexed: false },
      { name: 'author', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'ModuleContextUpdated',
    inputs: [
      { name: 'moduleId', type: 'uint256', indexed: true },
      { name: 'key', type: 'bytes32', indexed: true },
      { name: 'contentHash', type: 'bytes32', indexed: false },
      { name: 'author', type: 'address', indexed: true },
    ],
  },
  {
    type: 'function',
    name: 'setSystemContext',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'key', type: 'bytes32' },
      { name: 'contentHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getSystemContext',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getSystemContextHistory',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'bytes32' }],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getSystemContextAt',
    stateMutability: 'view',
    inputs: [
      { name: 'key', type: 'bytes32' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getSystemContextCount',
    stateMutability: 'view',
    inputs: [{ name: 'key', type: 'bytes32' }],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getSystemKeys',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
  {
    type: 'function',
    name: 'setModuleContext',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'moduleId', type: 'uint256' },
      { name: 'key', type: 'bytes32' },
      { name: 'contentHash', type: 'bytes32' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getModuleContext',
    stateMutability: 'view',
    inputs: [
      { name: 'moduleId', type: 'uint256' },
      { name: 'key', type: 'bytes32' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getModuleContextHistory',
    stateMutability: 'view',
    inputs: [
      { name: 'moduleId', type: 'uint256' },
      { name: 'key', type: 'bytes32' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple[]',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getModuleContextAt',
    stateMutability: 'view',
    inputs: [
      { name: 'moduleId', type: 'uint256' },
      { name: 'key', type: 'bytes32' },
      { name: 'index', type: 'uint256' },
    ],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'contentHash', type: 'bytes32' },
          { name: 'author', type: 'address' },
          { name: 'timestamp', type: 'uint256' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'getModuleContextCount',
    stateMutability: 'view',
    inputs: [
      { name: 'moduleId', type: 'uint256' },
      { name: 'key', type: 'bytes32' },
    ],
    outputs: [{ name: '', type: 'uint256' }],
  },
  {
    type: 'function',
    name: 'getModuleKeys',
    stateMutability: 'view',
    inputs: [{ name: 'moduleId', type: 'uint256' }],
    outputs: [{ name: '', type: 'bytes32[]' }],
  },
] as const;
