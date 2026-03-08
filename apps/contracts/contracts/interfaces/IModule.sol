// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IERC2535DiamondCutInternal} from
    "@solidstate/contracts/interfaces/IERC2535DiamondCutInternal.sol";

interface IModule {
    /// @notice Unique identifier for this module (e.g., keccak256("Agent"))
    function moduleId() external pure returns (bytes32);

    /// @notice Human-readable name
    function moduleName() external pure returns (string memory);

    /// @notice Semantic version string
    function moduleVersion() external pure returns (string memory);

    /// @notice Array of moduleIds this module depends on (may be empty)
    function dependencies() external pure returns (bytes32[] memory);

    /// @notice Returns the FacetCut[] array needed to install this module
    function installPlan() external view
        returns (IERC2535DiamondCutInternal.FacetCut[] memory);

    /// @notice Returns the FacetCut[] array needed to uninstall this module
    function uninstallPlan() external view
        returns (IERC2535DiamondCutInternal.FacetCut[] memory);
}
