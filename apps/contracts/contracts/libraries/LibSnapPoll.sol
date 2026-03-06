// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {SnapPoll} from "../DataTypes.sol";

library LibSnapPoll {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.snappoll.storage");

    struct Storage {
        uint256 pollCount;
        mapping(uint256 => SnapPoll) polls;
        mapping(uint256 => uint256) submissionToPoll;
        mapping(uint256 => mapping(address => bool)) hasVoted;
        mapping(uint256 => mapping(address => bool)) votes;
        // STUB: Replace with real holder enumeration post-hack
        mapping(uint256 => address[]) ideaVoterRegistry;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
