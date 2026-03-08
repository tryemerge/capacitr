export const workMarketplaceFacetAbi = [
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "submissionId",
        "type": "uint256"
      },
      {
        "indexed": true,
        "internalType": "uint256",
        "name": "jobId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "ideaId",
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
        "internalType": "string",
        "name": "deliverableURI",
        "type": "string"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "pollId",
        "type": "uint256"
      }
    ],
    "name": "WorkSubmitted",
    "type": "event"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "submissionId",
        "type": "uint256"
      }
    ],
    "name": "getSubmission",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "submissionId",
            "type": "uint256"
          },
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
            "name": "agent",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "deliverableHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "deliverableURI",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "contextProof",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pollId",
            "type": "uint256"
          }
        ],
        "internalType": "struct WorkSubmission",
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
    "name": "getSubmissionByJob",
    "outputs": [
      {
        "components": [
          {
            "internalType": "uint256",
            "name": "submissionId",
            "type": "uint256"
          },
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
            "name": "agent",
            "type": "address"
          },
          {
            "internalType": "bytes32",
            "name": "deliverableHash",
            "type": "bytes32"
          },
          {
            "internalType": "string",
            "name": "deliverableURI",
            "type": "string"
          },
          {
            "internalType": "string",
            "name": "contextProof",
            "type": "string"
          },
          {
            "internalType": "uint256",
            "name": "submittedAt",
            "type": "uint256"
          },
          {
            "internalType": "uint256",
            "name": "pollId",
            "type": "uint256"
          }
        ],
        "internalType": "struct WorkSubmission",
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
      },
      {
        "internalType": "string",
        "name": "deliverableURI",
        "type": "string"
      },
      {
        "internalType": "bytes32",
        "name": "deliverableHash",
        "type": "bytes32"
      },
      {
        "internalType": "string",
        "name": "contextProof",
        "type": "string"
      }
    ],
    "name": "submitWork",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const;
