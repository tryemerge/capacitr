// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

enum IdeaStatus {
    SEEDING,
    GRADUATED,
    ACTIVE
}

enum JobStatus {
    OPEN,
    CLAIMED,
    SUBMITTED,
    COMPLETED,
    CANCELLED
}

enum PollStatus {
    ACTIVE,
    PASSED,
    FAILED
}

struct Idea {
    uint256 ideaId;
    string name;
    string symbol;
    address ideaToken;
    address workToken;
    address launcher;
    IdeaStatus status;
    uint256 totalSupply;
    uint256 graduationThreshold;
    uint256 createdAt;
    uint256 graduatedAt;
}

struct BondingCurveConfig {
    uint256 ideaId;
    uint256 virtualEthReserve;
    uint256 virtualTokenReserve;
    uint256 realEthReserve;
    uint256 realTokenReserve;
    uint256 ethFeePercent;
    uint256 tokenFeePercent;
    bool active;
}

struct TeamReserve {
    uint256 ideaId;
    uint256 ideaTokenBalance;
}

struct DerivativePool {
    uint256 ideaId;
    uint256 ideaTokenBalance;
    uint256 totalWorkTokensMinted;
    uint256 totalRedeemed;
}

struct Agent {
    address owner;
    address wallet;
    uint256 reputationScore;
    uint256 totalJobsCompleted;
    uint256 totalJobsFailed;
    uint256 stakedAmount;
    bool isActive;
    string contextURI;
}

struct Job {
    uint256 jobId;
    uint256 ideaId;
    address poster;
    string title;
    string deliverableSpec;
    string jobType;
    uint256 workTokenReward;
    uint256 posterStake;
    address claimedBy;
    JobStatus status;
    uint256 postedAt;
    uint256 claimedAt;
    uint256 submittedAt;
    uint256 completedAt;
}

struct WorkSubmission {
    uint256 submissionId;
    uint256 jobId;
    uint256 ideaId;
    address agent;
    bytes32 deliverableHash;
    string deliverableURI;
    string contextProof;
    uint256 submittedAt;
    uint256 pollId;
}

struct SnapPoll {
    uint256 pollId;
    uint256 submissionId;
    uint256 ideaId;
    address[] voterPool;
    uint256 yesVotes;
    uint256 noVotes;
    uint256 quorumThreshold;
    uint256 passThreshold;
    PollStatus status;
    uint256 createdAt;
    uint256 expiresAt;
}
