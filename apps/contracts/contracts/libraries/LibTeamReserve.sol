// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {TeamReserve} from "../DataTypes.sol";

library LibTeamReserve {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.teamreserve.storage");

    struct Storage {
        mapping(uint256 => TeamReserve) reserves;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
