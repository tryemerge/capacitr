// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {WorkSubmission, Job, JobStatus, SnapPoll, PollStatus, Idea} from "../DataTypes.sol";
import {LibWorkMarketplace} from "../libraries/LibWorkMarketplace.sol";
import {LibJobBoard} from "../libraries/LibJobBoard.sol";
import {LibSnapPoll} from "../libraries/LibSnapPoll.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {LibIdea} from "../libraries/LibIdea.sol";

contract WorkMarketplaceFacet {
    event WorkSubmitted(uint256 indexed submissionId, uint256 indexed jobId, uint256 ideaId, address indexed agent, string deliverableURI, uint256 pollId);

    function submitWork(
        uint256 jobId,
        string calldata deliverableURI,
        bytes32 deliverableHash,
        string calldata contextProof
    ) external {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        Job storage job = js.jobs[jobId];

        require(msg.sender == job.claimedBy, "WorkMarketplaceFacet: not claimant");
        require(job.status == JobStatus.CLAIMED, "WorkMarketplaceFacet: job not claimed");

        LibWorkMarketplace.Storage storage ws = LibWorkMarketplace.store();

        // Create submission
        ws.submissionCount++;
        uint256 submissionId = ws.submissionCount;

        // Create poll inline (avoids cross-facet external call)
        uint256 pollId = _createPoll(submissionId, job.ideaId);

        ws.submissions[submissionId] = WorkSubmission({
            submissionId: submissionId,
            jobId: jobId,
            ideaId: job.ideaId,
            agent: msg.sender,
            deliverableHash: deliverableHash,
            deliverableURI: deliverableURI,
            contextProof: contextProof,
            submittedAt: block.timestamp,
            pollId: pollId
        });

        ws.jobToSubmission[jobId] = submissionId;

        // Update job status
        job.status = JobStatus.SUBMITTED;
        job.submittedAt = block.timestamp;

        emit WorkSubmitted(submissionId, jobId, job.ideaId, msg.sender, deliverableURI, pollId);
    }

    function _createPoll(uint256 submissionId, uint256 ideaId) internal returns (uint256 pollId) {
        LibSnapPoll.Storage storage ss = LibSnapPoll.store();
        LibConfig.Storage storage cs = LibConfig.store();

        ss.pollCount++;
        pollId = ss.pollCount;

        // STUB: Use voter registry instead of real holder enumeration
        address[] storage registeredVoters = ss.ideaVoterRegistry[ideaId];
        uint256 voterCount = registeredVoters.length;
        if (voterCount > 20) voterCount = 20; // Cap at 20

        address[] memory voterPool = new address[](voterCount);
        for (uint256 i = 0; i < voterCount; i++) {
            voterPool[i] = registeredVoters[i];
        }

        ss.polls[pollId] = SnapPoll({
            pollId: pollId,
            submissionId: submissionId,
            ideaId: ideaId,
            voterPool: voterPool,
            yesVotes: 0,
            noVotes: 0,
            quorumThreshold: cs.defaultQuorumThreshold,
            passThreshold: cs.defaultPassThreshold,
            status: PollStatus.ACTIVE,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + cs.defaultPollDuration
        });

        ss.submissionToPoll[submissionId] = pollId;
    }

    // --- View Functions ---

    function getSubmission(uint256 submissionId) external view returns (WorkSubmission memory) {
        return LibWorkMarketplace.store().submissions[submissionId];
    }

    function getSubmissionByJob(uint256 jobId) external view returns (WorkSubmission memory) {
        uint256 submissionId = LibWorkMarketplace.store().jobToSubmission[jobId];
        return LibWorkMarketplace.store().submissions[submissionId];
    }
}
