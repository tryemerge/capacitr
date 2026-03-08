// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {DiamondWritableInternal} from
    "@solidstate/contracts/proxy/diamond/writable/DiamondWritableInternal.sol";
import {IModule} from "../interfaces/IModule.sol";
import {LibModuleRegistry} from "../libraries/LibModuleRegistry.sol";

contract ModuleRegistryFacet is DiamondWritableInternal {
    event ModuleInstalled(bytes32 indexed moduleId, string name, address indexed installedBy);
    event ModuleUninstalled(bytes32 indexed moduleId, address indexed removedBy);
    event ModuleInstallerAdded(address indexed installer);
    event ModuleInstallerRemoved(address indexed installer);

    // ── Install / Uninstall ──

    function installModule(address moduleContract) external {
        require(_isAuthorized(msg.sender), "ModuleRegistry: not authorized");

        IModule mod = IModule(moduleContract);
        bytes32 modId = mod.moduleId();

        LibModuleRegistry.Storage storage ms = LibModuleRegistry.store();
        require(!ms.modules[modId].active, "ModuleRegistry: already installed");

        // Check dependencies
        bytes32[] memory deps = mod.dependencies();
        for (uint256 i = 0; i < deps.length; i++) {
            require(ms.modules[deps[i]].active, "ModuleRegistry: missing dependency");
        }

        // Get install plan and execute diamond cut
        FacetCut[] memory cuts = mod.installPlan();
        _diamondCut(cuts, address(0), "");

        // Record module metadata
        _recordModule(ms, mod, modId, cuts, moduleContract);

        emit ModuleInstalled(modId, mod.moduleName(), msg.sender);
    }

    function uninstallModule(bytes32 moduleId) external {
        require(msg.sender == _owner(), "ModuleRegistry: not owner");

        LibModuleRegistry.Storage storage ms = LibModuleRegistry.store();
        LibModuleRegistry.ModuleRecord storage record = ms.modules[moduleId];
        require(record.active, "ModuleRegistry: not installed");

        // Check no other active module depends on this one
        _checkNoDependents(ms, moduleId);

        // Get uninstall plan and execute diamond cut
        IModule mod = IModule(record.installerContract);
        FacetCut[] memory cuts = mod.uninstallPlan();
        _diamondCut(cuts, address(0), "");

        // Clean up selector mappings
        for (uint256 i = 0; i < record.selectors.length; i++) {
            delete ms.selectorToModule[record.selectors[i]];
        }

        record.active = false;

        emit ModuleUninstalled(moduleId, msg.sender);
    }

    // ── Access Control ──

    function addModuleInstaller(address installer) external {
        require(msg.sender == _owner(), "ModuleRegistry: not owner");
        LibModuleRegistry.store().moduleInstallers[installer] = true;
        emit ModuleInstallerAdded(installer);
    }

    function removeModuleInstaller(address installer) external {
        require(msg.sender == _owner(), "ModuleRegistry: not owner");
        LibModuleRegistry.store().moduleInstallers[installer] = false;
        emit ModuleInstallerRemoved(installer);
    }

    function isModuleInstaller(address account) external view returns (bool) {
        return LibModuleRegistry.store().moduleInstallers[account];
    }

    // ── Views ──

    function getModule(bytes32 moduleId) external view returns (
        string memory name,
        string memory version,
        address installerContract,
        address installedBy,
        uint256 installedAt,
        bool active
    ) {
        LibModuleRegistry.ModuleRecord storage r = LibModuleRegistry.store().modules[moduleId];
        return (r.name, r.version, r.installerContract, r.installedBy, r.installedAt, r.active);
    }

    function isModuleInstalled(bytes32 moduleId) external view returns (bool) {
        return LibModuleRegistry.store().modules[moduleId].active;
    }

    function getInstalledModuleIds() external view returns (bytes32[] memory) {
        LibModuleRegistry.Storage storage ms = LibModuleRegistry.store();
        uint256 activeCount = 0;
        for (uint256 i = 0; i < ms.moduleIds.length; i++) {
            if (ms.modules[ms.moduleIds[i]].active) activeCount++;
        }

        bytes32[] memory result = new bytes32[](activeCount);
        uint256 idx = 0;
        for (uint256 i = 0; i < ms.moduleIds.length; i++) {
            if (ms.modules[ms.moduleIds[i]].active) {
                result[idx] = ms.moduleIds[i];
                idx++;
            }
        }
        return result;
    }

    function getModuleForSelector(bytes4 selector) external view returns (bytes32) {
        return LibModuleRegistry.store().selectorToModule[selector];
    }

    // ── Internal ──

    function _isAuthorized(address account) internal view returns (bool) {
        if (account == _owner()) return true;
        return LibModuleRegistry.store().moduleInstallers[account];
    }

    function _owner() internal view returns (address owner_) {
        bytes32 slot = keccak256("solidstate.contracts.storage.Ownable");
        assembly {
            owner_ := sload(slot)
        }
    }

    function _recordModule(
        LibModuleRegistry.Storage storage ms,
        IModule mod,
        bytes32 modId,
        FacetCut[] memory cuts,
        address moduleContract
    ) internal {
        LibModuleRegistry.ModuleRecord storage record = ms.modules[modId];
        record.moduleId = modId;
        record.name = mod.moduleName();
        record.version = mod.moduleVersion();
        record.installerContract = moduleContract;
        record.installedBy = msg.sender;
        record.installedAt = block.timestamp;
        record.active = true;

        // Store selectors and build reverse mapping
        for (uint256 i = 0; i < cuts.length; i++) {
            for (uint256 j = 0; j < cuts[i].selectors.length; j++) {
                bytes4 sel = cuts[i].selectors[j];
                record.selectors.push(sel);
                ms.selectorToModule[sel] = modId;
            }
        }

        ms.moduleIds.push(modId);
    }

    function _checkNoDependents(
        LibModuleRegistry.Storage storage ms,
        bytes32 moduleId
    ) internal view {
        for (uint256 i = 0; i < ms.moduleIds.length; i++) {
            bytes32 otherId = ms.moduleIds[i];
            if (!ms.modules[otherId].active || otherId == moduleId) continue;

            IModule other = IModule(ms.modules[otherId].installerContract);
            bytes32[] memory deps = other.dependencies();
            for (uint256 j = 0; j < deps.length; j++) {
                require(deps[j] != moduleId, "ModuleRegistry: has dependents");
            }
        }
    }
}
