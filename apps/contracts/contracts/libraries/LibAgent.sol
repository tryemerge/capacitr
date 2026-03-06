// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Agent as AgentData} from "../DataTypes.sol";

library LibAgent {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.agent.storage");

    struct Storage {
        mapping(address => AgentData) agents;
        mapping(uint256 => address) erc8004ToWallet;
        uint256 stakeRequirement;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
