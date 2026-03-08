// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library LibContext {
    bytes32 constant STORAGE_POSITION = keccak256("idea.marketplace.context.storage");

    struct ContextEntry {
        bytes32 contentHash;
        address author;
        uint256 timestamp;
    }

    struct Storage {
        // System-level context: key => append-only log
        mapping(bytes32 => ContextEntry[]) systemLog;
        // Module-scoped context: moduleId => key => append-only log
        mapping(uint256 => mapping(bytes32 => ContextEntry[])) moduleLog;
        // Track all keys used per module (for enumeration)
        mapping(uint256 => bytes32[]) moduleKeys;
        // Track all system keys
        bytes32[] systemKeys;
        // Dedup: has this key been pushed to the keys array?
        mapping(bytes32 => bool) systemKeyExists;
        mapping(uint256 => mapping(bytes32 => bool)) moduleKeyExists;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
