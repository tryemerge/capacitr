// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IModule} from "../interfaces/IModule.sol";
import {IERC2535DiamondCutInternal} from
    "@solidstate/contracts/interfaces/IERC2535DiamondCutInternal.sol";
import {AgentFacet} from "../facets/AgentFacet.sol";

contract AgentModule is IModule {
    address immutable facet;

    constructor(address _facet) {
        facet = _facet;
    }

    function moduleId() external pure returns (bytes32) {
        return keccak256("Agent");
    }

    function moduleName() external pure returns (string memory) {
        return "Agent";
    }

    function moduleVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    function dependencies() external pure returns (bytes32[] memory) {
        return new bytes32[](0);
    }

    function installPlan() external view returns (IERC2535DiamondCutInternal.FacetCut[] memory cuts) {
        bytes4[] memory selectors = _selectors();
        cuts = new IERC2535DiamondCutInternal.FacetCut[](1);
        cuts[0] = IERC2535DiamondCutInternal.FacetCut({
            target: facet,
            action: IERC2535DiamondCutInternal.FacetCutAction.ADD,
            selectors: selectors
        });
    }

    function uninstallPlan() external view returns (IERC2535DiamondCutInternal.FacetCut[] memory cuts) {
        bytes4[] memory selectors = _selectors();
        cuts = new IERC2535DiamondCutInternal.FacetCut[](1);
        cuts[0] = IERC2535DiamondCutInternal.FacetCut({
            target: address(0),
            action: IERC2535DiamondCutInternal.FacetCutAction.REMOVE,
            selectors: selectors
        });
    }

    function _selectors() internal pure returns (bytes4[] memory s) {
        s = new bytes4[](6);
        s[0] = AgentFacet.registerAgent.selector;
        s[1] = AgentFacet.updateContextURI.selector;
        s[2] = AgentFacet.deactivateAgent.selector;
        s[3] = AgentFacet.reactivateAgent.selector;
        s[4] = AgentFacet.getAgent.selector;
        s[5] = AgentFacet.isRegistered.selector;
    }
}
