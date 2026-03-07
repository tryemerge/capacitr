// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Idea} from "../DataTypes.sol";

library LibIdea {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.idea.storage");

    struct Storage {
        uint256 ideaCount;
        mapping(uint256 => Idea) ideas;
        mapping(address => uint256) tokenToIdeaId;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
