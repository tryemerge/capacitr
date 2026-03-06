// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Job} from "../DataTypes.sol";

library LibJobBoard {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.jobboard.storage");

    struct Storage {
        uint256 jobCount;
        mapping(uint256 => Job) jobs;
        mapping(uint256 => uint256[]) ideaJobs;
        mapping(address => uint256) agentActiveJob;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
