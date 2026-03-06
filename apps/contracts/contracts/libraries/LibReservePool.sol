// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ReservePool as ReservePoolData} from "../DataTypes.sol";

library LibReservePool {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.reservepool.storage");

    struct Storage {
        mapping(uint256 => ReservePoolData) pools;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
