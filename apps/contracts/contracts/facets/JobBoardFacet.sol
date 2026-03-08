// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Job, JobStatus, Idea, IdeaStatus, Agent as AgentData} from "../DataTypes.sol";
import {LibJobBoard} from "../libraries/LibJobBoard.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibAgent} from "../libraries/LibAgent.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract JobBoardFacet {
    event JobPosted(uint256 indexed jobId, uint256 indexed ideaId, address indexed poster, string title, string jobType, uint256 reward);
    event JobClaimed(uint256 indexed jobId, address indexed agent, uint256 claimedAt);
    event JobCancelled(uint256 indexed jobId);

    function postJob(
        uint256 ideaId,
        string calldata title,
        string calldata deliverableSpec,
        string calldata jobType,
        uint256 workTokenReward
    ) external {
        Idea storage idea = LibIdea.store().ideas[ideaId];
        require(
            idea.status == IdeaStatus.ACTIVE,
            "JobBoardFacet: idea not active"
        );

        uint256 posterStake = LibConfig.store().jobPosterStake;
        if (posterStake > 0) {
            IERC20(idea.ideaToken).transferFrom(msg.sender, address(this), posterStake);
        }

        LibJobBoard.Storage storage js = LibJobBoard.store();
        js.jobCount++;
        uint256 jobId = js.jobCount;

        Job storage job = js.jobs[jobId];
        job.jobId = jobId;
        job.ideaId = ideaId;
        job.poster = msg.sender;
        job.title = title;
        job.deliverableSpec = deliverableSpec;
        job.jobType = jobType;
        job.workTokenReward = workTokenReward;
        job.posterStake = posterStake;
        job.status = JobStatus.OPEN;
        job.postedAt = block.timestamp;

        js.ideaJobs[ideaId].push(jobId);

        emit JobPosted(jobId, ideaId, msg.sender, title, jobType, workTokenReward);
    }

    function claimJob(uint256 jobId) external {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        Job storage job = js.jobs[jobId];
        require(job.status == JobStatus.OPEN, "JobBoardFacet: job not open");

        LibAgent.Storage storage as_ = LibAgent.store();
        require(as_.agents[msg.sender].isActive, "JobBoardFacet: not active agent");
        require(js.agentActiveJob[msg.sender] == 0, "JobBoardFacet: agent has active job");

        job.status = JobStatus.CLAIMED;
        job.claimedBy = msg.sender;
        job.claimedAt = block.timestamp;
        js.agentActiveJob[msg.sender] = jobId;

        emit JobClaimed(jobId, msg.sender, block.timestamp);
    }

    function cancelJob(uint256 jobId) external {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        Job storage job = js.jobs[jobId];
        require(msg.sender == job.poster, "JobBoardFacet: not poster");
        require(job.status == JobStatus.OPEN, "JobBoardFacet: job not open");

        job.status = JobStatus.CANCELLED;

        // Return poster stake
        if (job.posterStake > 0) {
            LibIdea.Storage storage is_ = LibIdea.store();
            Idea storage idea = is_.ideas[job.ideaId];
            IERC20(idea.ideaToken).transfer(msg.sender, job.posterStake);
        }

        emit JobCancelled(jobId);
    }

    function getJob(uint256 jobId) external view returns (Job memory) {
        return LibJobBoard.store().jobs[jobId];
    }

    function getJobsByIdea(uint256 ideaId) external view returns (Job[] memory) {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        uint256[] storage jobIds = js.ideaJobs[ideaId];
        Job[] memory jobs = new Job[](jobIds.length);
        for (uint256 i = 0; i < jobIds.length; i++) {
            jobs[i] = js.jobs[jobIds[i]];
        }
        return jobs;
    }

    function getOpenJobsByIdea(uint256 ideaId) external view returns (Job[] memory) {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        uint256[] storage jobIds = js.ideaJobs[ideaId];

        // Count open jobs first
        uint256 openCount = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            if (js.jobs[jobIds[i]].status == JobStatus.OPEN) {
                openCount++;
            }
        }

        Job[] memory openJobs = new Job[](openCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < jobIds.length; i++) {
            if (js.jobs[jobIds[i]].status == JobStatus.OPEN) {
                openJobs[idx] = js.jobs[jobIds[i]];
                idx++;
            }
        }
        return openJobs;
    }

    function getActiveJobForAgent(address wallet) external view returns (Job memory) {
        LibJobBoard.Storage storage js = LibJobBoard.store();
        uint256 jobId = js.agentActiveJob[wallet];
        return js.jobs[jobId];
    }
}
