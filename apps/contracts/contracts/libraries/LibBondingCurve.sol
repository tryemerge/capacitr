// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {BondingCurveConfig} from "../DataTypes.sol";

library LibBondingCurve {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.bondingcurve.storage");

    struct Storage {
        mapping(uint256 => BondingCurveConfig) curves;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
