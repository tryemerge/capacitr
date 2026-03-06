// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SnapPoll, PollStatus, Idea, IdeaStatus, Job, JobStatus, WorkSubmission} from "../DataTypes.sol";
import {LibSnapPoll} from "../libraries/LibSnapPoll.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {LibJobBoard} from "../libraries/LibJobBoard.sol";
import {LibWorkMarketplace} from "../libraries/LibWorkMarketplace.sol";
import {LibReservePool} from "../libraries/LibReservePool.sol";
import {LibAgent} from "../libraries/LibAgent.sol";
import {Agent as AgentData, ReservePool as ReservePoolData} from "../DataTypes.sol";
import {WorkToken} from "../tokens/WorkToken.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IERC8004Reputation} from "../interfaces/IERC8004Reputation.sol";
import {IERC8004Validation} from "../interfaces/IERC8004Validation.sol";

contract SnapPollFacet {
    event PollCreated(uint256 indexed pollId, uint256 indexed submissionId, uint256 ideaId, address[] voterPool, uint256 expiresAt);
    event VoteCast(uint256 indexed pollId, address indexed voter, bool vote);
    event PollResolved(uint256 indexed pollId, PollStatus status, uint256 yesVotes, uint256 noVotes);
    event WorkApproved(uint256 indexed submissionId, uint256 indexed jobId, address indexed agent, uint256 workTokensMinted);
    event WorkRejected(uint256 indexed submissionId, uint256 indexed jobId, address indexed agent);

    // STUB: Register as a voter for an idea
    function registerAsVoter(uint256 ideaId) external {
        LibSnapPoll.Storage storage ss = LibSnapPoll.store();
        // Check caller holds idea tokens
        LibIdea.Storage storage is_ = LibIdea.store();
        Idea storage idea = is_.ideas[ideaId];
        require(idea.ideaToken != address(0), "SnapPollFacet: invalid idea");
        require(IERC20(idea.ideaToken).balanceOf(msg.sender) > 0, "SnapPollFacet: no tokens held");

        // Check not already registered
        address[] storage voters = ss.ideaVoterRegistry[ideaId];
        for (uint256 i = 0; i < voters.length; i++) {
            require(voters[i] != msg.sender, "SnapPollFacet: already registered");
        }
        voters.push(msg.sender);
    }

    function castVote(uint256 pollId, bool vote) external {
        LibSnapPoll.Storage storage ss = LibSnapPoll.store();
        SnapPoll storage poll = ss.polls[pollId];

        require(block.timestamp < poll.expiresAt, "SnapPollFacet: poll expired");
        require(poll.status == PollStatus.ACTIVE, "SnapPollFacet: poll not active");
        require(!ss.hasVoted[pollId][msg.sender], "SnapPollFacet: already voted");

        // Verify voter is in voter pool
        bool isVoter = false;
        for (uint256 i = 0; i < poll.voterPool.length; i++) {
            if (poll.voterPool[i] == msg.sender) {
                isVoter = true;
                break;
            }
        }
        require(isVoter, "SnapPollFacet: not in voter pool");

        ss.hasVoted[pollId][msg.sender] = true;
        ss.votes[pollId][msg.sender] = vote;

        if (vote) {
            poll.yesVotes++;
        } else {
            poll.noVotes++;
        }

        emit VoteCast(pollId, msg.sender, vote);

        // Check if we can resolve early (quorum met + threshold passed)
        uint256 totalVotes = poll.yesVotes + poll.noVotes;
        if (totalVotes >= poll.quorumThreshold) {
            if ((poll.yesVotes * 10000) / totalVotes >= poll.passThreshold) {
                _resolvePoll(pollId);
            }
        }
    }

    function resolvePoll(uint256 pollId) external {
        LibSnapPoll.Storage storage ss = LibSnapPoll.store();
        SnapPoll storage poll = ss.polls[pollId];

        require(poll.status == PollStatus.ACTIVE, "SnapPollFacet: poll not active");

        uint256 totalVotes = poll.yesVotes + poll.noVotes;
        require(
            block.timestamp >= poll.expiresAt || totalVotes >= poll.quorumThreshold,
            "SnapPollFacet: cannot resolve yet"
        );

        _resolvePoll(pollId);
    }

    function _resolvePoll(uint256 pollId) internal {
        LibSnapPoll.Storage storage ss = LibSnapPoll.store();
        SnapPoll storage poll = ss.polls[pollId];

        if (poll.status != PollStatus.ACTIVE) return; // Already resolved (e.g. early resolution race)

        uint256 totalVotes = poll.yesVotes + poll.noVotes;

        bool passed = totalVotes >= poll.quorumThreshold &&
            (poll.yesVotes * 10000) / totalVotes >= poll.passThreshold;

        if (passed) {
            poll.status = PollStatus.PASSED;
            _onPollPassed(poll.submissionId);
        } else {
            poll.status = PollStatus.FAILED;
            _onPollFailed(poll.submissionId);
        }

        // STUB: ERC-8004 Validation Registry
        LibConfig.Storage storage cs = LibConfig.store();
        if (cs.erc8004ValidationRegistry != address(0)) {
            try IERC8004Validation(cs.erc8004ValidationRegistry).validationResponse(
                bytes32(pollId),
                passed ? 100 : 0,
                "",
                bytes32(0),
                ""
            ) {} catch {}
        }

        emit PollResolved(pollId, poll.status, poll.yesVotes, poll.noVotes);
    }

    function _onPollPassed(uint256 submissionId) internal {
        LibWorkMarketplace.Storage storage ws = LibWorkMarketplace.store();
        WorkSubmission storage submission = ws.submissions[submissionId];

        LibJobBoard.Storage storage js = LibJobBoard.store();
        Job storage job = js.jobs[submission.jobId];

        LibIdea.Storage storage is_ = LibIdea.store();
        Idea storage idea = is_.ideas[submission.ideaId];

        // Mint work tokens to agent
        WorkToken(idea.workToken).mint(submission.agent, job.workTokenReward);

        // Update reserve pool
        LibReservePool.store().pools[submission.ideaId].totalWorkTokensMinted += job.workTokenReward;

        // Return poster stake
        if (job.posterStake > 0) {
            IERC20(idea.ideaToken).transfer(job.poster, job.posterStake);
        }

        // Update job
        job.status = JobStatus.COMPLETED;
        job.completedAt = block.timestamp;

        // Clear agent active job
        js.agentActiveJob[submission.agent] = 0;

        // Update agent stats
        LibAgent.Storage storage as_ = LibAgent.store();
        as_.agents[submission.agent].totalJobsCompleted++;

        // STUB: ERC-8004 Reputation
        LibConfig.Storage storage cs = LibConfig.store();
        if (cs.erc8004ReputationRegistry != address(0)) {
            try IERC8004Reputation(cs.erc8004ReputationRegistry).giveFeedback(
                as_.agents[submission.agent].erc8004AgentId,
                100,
                0,
                "workQuality",
                job.jobType,
                submission.deliverableURI,
                submission.deliverableURI,
                submission.deliverableHash
            ) {} catch {}
        }

        // Set idea status to ACTIVE if not already
        if (idea.status == IdeaStatus.GRADUATED) {
            idea.status = IdeaStatus.ACTIVE;
        }

        emit WorkApproved(submissionId, submission.jobId, submission.agent, job.workTokenReward);
    }

    function _onPollFailed(uint256 submissionId) internal {
        LibWorkMarketplace.Storage storage ws = LibWorkMarketplace.store();
        WorkSubmission storage submission = ws.submissions[submissionId];

        LibJobBoard.Storage storage js = LibJobBoard.store();
        Job storage job = js.jobs[submission.jobId];

        // Reset job to open
        job.status = JobStatus.OPEN;
        job.claimedBy = address(0);
        job.claimedAt = 0;
        job.submittedAt = 0;

        // Clear agent active job
        js.agentActiveJob[submission.agent] = 0;

        // Update agent stats
        LibAgent.Storage storage as_ = LibAgent.store();
        as_.agents[submission.agent].totalJobsFailed++;

        // STUB: ERC-8004 Reputation with score 0
        LibConfig.Storage storage cs = LibConfig.store();
        if (cs.erc8004ReputationRegistry != address(0)) {
            try IERC8004Reputation(cs.erc8004ReputationRegistry).giveFeedback(
                as_.agents[submission.agent].erc8004AgentId,
                0,
                0,
                "workQuality",
                job.jobType,
                submission.deliverableURI,
                submission.deliverableURI,
                submission.deliverableHash
            ) {} catch {}
        }

        emit WorkRejected(submissionId, submission.jobId, submission.agent);
    }

    // --- View Functions ---

    function getPoll(uint256 pollId) external view returns (SnapPoll memory) {
        return LibSnapPoll.store().polls[pollId];
    }

    function getPollBySubmission(uint256 submissionId) external view returns (SnapPoll memory) {
        uint256 pollId = LibSnapPoll.store().submissionToPoll[submissionId];
        return LibSnapPoll.store().polls[pollId];
    }

    function hasAddressVoted(uint256 pollId, address voter) external view returns (bool) {
        return LibSnapPoll.store().hasVoted[pollId][voter];
    }
}
