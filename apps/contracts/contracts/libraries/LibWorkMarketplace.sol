// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {WorkSubmission} from "../DataTypes.sol";

library LibWorkMarketplace {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.work.storage");

    struct Storage {
        uint256 submissionCount;
        mapping(uint256 => WorkSubmission) submissions;
        mapping(uint256 => uint256) jobToSubmission;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
