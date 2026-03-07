// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@solidstate/contracts/proxy/diamond/SolidStateDiamond.sol";
import "./libraries/LibConfig.sol";

contract IdeaMarketplace is SolidStateDiamond {
    constructor(
        address treasury,
        uint256 defaultGraduationThreshold,
        uint256 defaultEthFeeBps,
        uint256 defaultTokenFeeBps,
        uint256 agentStakeRequirement,
        uint256 defaultPollDuration,
        uint256 defaultQuorumThreshold,
        uint256 defaultPassThreshold,
        uint256 jobPosterStake
    ) {
        LibConfig.Storage storage cs = LibConfig.store();
        cs.treasury = treasury;
        cs.defaultGraduationThreshold = defaultGraduationThreshold;
        cs.defaultEthFeeBps = defaultEthFeeBps;
        cs.defaultTokenFeeBps = defaultTokenFeeBps;
        cs.agentStakeRequirement = agentStakeRequirement;
        cs.defaultPollDuration = defaultPollDuration;
        cs.defaultQuorumThreshold = defaultQuorumThreshold;
        cs.defaultPassThreshold = defaultPassThreshold;
        cs.jobPosterStake = jobPosterStake;
    }
}
