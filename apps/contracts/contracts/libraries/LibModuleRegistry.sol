// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

library LibModuleRegistry {
    bytes32 constant STORAGE_POSITION =
        keccak256("idea.marketplace.moduleregistry.storage");

    struct ModuleRecord {
        bytes32 moduleId;
        string name;
        string version;
        address installerContract;
        address installedBy;
        uint256 installedAt;
        bool active;
        bytes4[] selectors;
    }

    struct Storage {
        mapping(bytes32 => ModuleRecord) modules;
        bytes32[] moduleIds;
        mapping(bytes4 => bytes32) selectorToModule;
        mapping(address => bool) moduleInstallers;
    }

    function store() internal pure returns (Storage storage s) {
        bytes32 position = STORAGE_POSITION;
        assembly {
            s.slot := position
        }
    }
}
