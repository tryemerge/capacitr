export const AgentFacetABI = [
  {
    type: 'event',
    name: 'AgentRegistered',
    inputs: [
      { name: 'owner', type: 'address', indexed: true },
      { name: 'wallet', type: 'address', indexed: false },
      { name: 'contextURI', type: 'string', indexed: false },
    ],
  },
  {
    type: 'event',
    name: 'AgentDeactivated',
    inputs: [
      { name: 'wallet', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'AgentReactivated',
    inputs: [
      { name: 'wallet', type: 'address', indexed: true },
    ],
  },
  {
    type: 'event',
    name: 'AgentContextUpdated',
    inputs: [
      { name: 'wallet', type: 'address', indexed: true },
      { name: 'newContextURI', type: 'string', indexed: false },
    ],
  },
  {
    type: 'function',
    name: 'registerAgent',
    stateMutability: 'payable',
    inputs: [
      { name: 'contextURI', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'updateContextURI',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'newContextURI', type: 'string' },
    ],
    outputs: [],
  },
  {
    type: 'function',
    name: 'deactivateAgent',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'reactivateAgent',
    stateMutability: 'nonpayable',
    inputs: [],
    outputs: [],
  },
  {
    type: 'function',
    name: 'getAgent',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [
      {
        name: '',
        type: 'tuple',
        components: [
          { name: 'owner', type: 'address' },
          { name: 'wallet', type: 'address' },
          { name: 'reputationScore', type: 'uint256' },
          { name: 'totalJobsCompleted', type: 'uint256' },
          { name: 'totalJobsFailed', type: 'uint256' },
          { name: 'stakedAmount', type: 'uint256' },
          { name: 'isActive', type: 'bool' },
          { name: 'contextURI', type: 'string' },
        ],
      },
    ],
  },
  {
    type: 'function',
    name: 'isRegistered',
    stateMutability: 'view',
    inputs: [{ name: 'wallet', type: 'address' }],
    outputs: [{ name: '', type: 'bool' }],
  },
] as const;
