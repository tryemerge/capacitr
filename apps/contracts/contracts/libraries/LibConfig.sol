// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library LibConfig {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.config.storage");

    struct Storage {
        address treasury;
        uint256 defaultGraduationThreshold;
        uint256 defaultEthFeeBps;
        uint256 defaultTokenFeeBps;
        uint256 agentStakeRequirement;
        uint256 defaultPollDuration;
        uint256 defaultQuorumThreshold;
        uint256 defaultPassThreshold;
        uint256 jobPosterStake;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
