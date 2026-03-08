export const JobBoardFacetABI = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "JobCancelled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "agent",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "claimedAt",
        "type": "uint256"
      }
    ],
    "name": "JobClaimed",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "ideaId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "address",
        "name": "poster",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "jobType",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "reward",
        "type": "uint256"
      }
    ],
    "name": "JobPosted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "cancelJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "claimJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "wallet",
        "type": "address"
      }
    ],
    "name": "getActiveJobForAgent",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "poster",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "deliverableSpec",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "jobType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "workTokenReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "posterStake",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "claimedBy",
            "type": "address"
          },
          {
            "internalType": "enum JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "postedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Job",
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
        "name": "jobId",
        "type": "uint256"
      }
    ],
    "name": "getJob",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "poster",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "deliverableSpec",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "jobType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "workTokenReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "posterStake",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "claimedBy",
            "type": "address"
          },
          {
            "internalType": "enum JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "postedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Job",
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
    "name": "getJobsByIdea",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "poster",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "deliverableSpec",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "jobType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "workTokenReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "posterStake",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "claimedBy",
            "type": "address"
          },
          {
            "internalType": "enum JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "postedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Job[]",
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
    "name": "getOpenJobsByIdea",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "jobId",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "ideaId",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "poster",
            "type": "address"
          },
          {
            "internalType": "string",
            "name": "title",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "deliverableSpec",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "jobType",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "workTokenReward",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "posterStake",
            "type": "uint256"
          },
          {
            "internalType": "address",
            "name": "claimedBy",
            "type": "address"
          },
          {
            "internalType": "enum JobStatus",
            "name": "status",
            "type": "uint8"
          },
          {
            "internalType": "uint256",
            "name": "postedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "claimedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "completedAt",
            "type": "uint256"
          }
        ],
        "internalType": "struct Job[]",
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
      },
      {
        "internalType": "string",
        "name": "title",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "deliverableSpec",
        "type": "string"
      },
      {
        "internalType": "string",
        "name": "jobType",
        "type": "string"
      },
      {
        "internalType": "uint256",
        "name": "workTokenReward",
        "type": "uint256"
      }
    ],
    "name": "postJob",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
