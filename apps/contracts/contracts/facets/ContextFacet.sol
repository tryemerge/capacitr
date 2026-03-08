// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {LibContext} from "../libraries/LibContext.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibModuleRegistry} from "../libraries/LibModuleRegistry.sol";
import {Idea, IdeaStatus} from "../DataTypes.sol";

contract ContextFacet {
    event SystemContextUpdated(bytes32 indexed key, bytes32 contentHash, address indexed author);
    event ModuleContextUpdated(uint256 indexed moduleId, bytes32 indexed key, bytes32 contentHash, address indexed author);

    // ── System-level context (diamond owner only for now) ──

    function setSystemContext(bytes32 key, bytes32 contentHash) external {
        // Only diamond owner can set system context
        // SolidStateDiamond stores owner at OwnableStorage slot
        require(msg.sender == _owner(), "ContextFacet: not owner");
        require(contentHash != bytes32(0), "ContextFacet: empty hash");

        LibContext.Storage storage cs = LibContext.store();

        cs.systemLog[key].push(LibContext.ContextEntry({
            contentHash: contentHash,
            author: msg.sender,
            timestamp: block.timestamp
        }));

        if (!cs.systemKeyExists[key]) {
            cs.systemKeys.push(key);
            cs.systemKeyExists[key] = true;
        }

        emit SystemContextUpdated(key, contentHash, msg.sender);
    }

    function getSystemContext(bytes32 key) external view returns (LibContext.ContextEntry memory) {
        LibContext.ContextEntry[] storage log = LibContext.store().systemLog[key];
        require(log.length > 0, "ContextFacet: no entries");
        return log[log.length - 1];
    }

    function getSystemContextHistory(bytes32 key) external view returns (LibContext.ContextEntry[] memory) {
        return LibContext.store().systemLog[key];
    }

    function getSystemContextAt(bytes32 key, uint256 index) external view returns (LibContext.ContextEntry memory) {
        return LibContext.store().systemLog[key][index];
    }

    function getSystemContextCount(bytes32 key) external view returns (uint256) {
        return LibContext.store().systemLog[key].length;
    }

    function getSystemKeys() external view returns (bytes32[] memory) {
        return LibContext.store().systemKeys;
    }

    // ── Module-scoped context ──

    function setModuleContext(uint256 moduleId, bytes32 key, bytes32 contentHash) external {
        require(contentHash != bytes32(0), "ContextFacet: empty hash");

        // Access control: idea launcher, module installer, or diamond owner
        bool authorized = msg.sender == _owner();

        if (!authorized) {
            Idea storage idea = LibIdea.store().ideas[moduleId];
            if (idea.ideaId != 0) {
                authorized = msg.sender == idea.launcher;
            }
        }

        if (!authorized) {
            // Check if caller installed a registered module matching this moduleId
            bytes32 modKey = bytes32(moduleId);
            LibModuleRegistry.ModuleRecord storage record = LibModuleRegistry.store().modules[modKey];
            if (record.active) {
                authorized = msg.sender == record.installedBy;
            }
        }

        require(authorized, "ContextFacet: not authorized");

        LibContext.Storage storage cs = LibContext.store();

        cs.moduleLog[moduleId][key].push(LibContext.ContextEntry({
            contentHash: contentHash,
            author: msg.sender,
            timestamp: block.timestamp
        }));

        if (!cs.moduleKeyExists[moduleId][key]) {
            cs.moduleKeys[moduleId].push(key);
            cs.moduleKeyExists[moduleId][key] = true;
        }

        emit ModuleContextUpdated(moduleId, key, contentHash, msg.sender);
    }

    function getModuleContext(uint256 moduleId, bytes32 key) external view returns (LibContext.ContextEntry memory) {
        LibContext.ContextEntry[] storage log = LibContext.store().moduleLog[moduleId][key];
        require(log.length > 0, "ContextFacet: no entries");
        return log[log.length - 1];
    }

    function getModuleContextHistory(uint256 moduleId, bytes32 key) external view returns (LibContext.ContextEntry[] memory) {
        return LibContext.store().moduleLog[moduleId][key];
    }

    function getModuleContextAt(uint256 moduleId, bytes32 key, uint256 index) external view returns (LibContext.ContextEntry memory) {
        return LibContext.store().moduleLog[moduleId][key][index];
    }

    function getModuleContextCount(uint256 moduleId, bytes32 key) external view returns (uint256) {
        return LibContext.store().moduleLog[moduleId][key].length;
    }

    function getModuleKeys(uint256 moduleId) external view returns (bytes32[] memory) {
        return LibContext.store().moduleKeys[moduleId];
    }

    // ── Internal ──

    function _owner() internal view returns (address owner_) {
        // SolidState OwnableStorage slot
        bytes32 slot = keccak256("solidstate.contracts.storage.Ownable");
        assembly {
            owner_ := sload(slot)
        }
    }
}
