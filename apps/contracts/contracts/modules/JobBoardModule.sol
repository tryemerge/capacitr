// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IModule} from "../interfaces/IModule.sol";
import {IERC2535DiamondCutInternal} from
    "@solidstate/contracts/interfaces/IERC2535DiamondCutInternal.sol";
import {JobBoardFacet} from "../facets/JobBoardFacet.sol";

contract JobBoardModule is IModule {
    address immutable facet;

    constructor(address _facet) {
        facet = _facet;
    }

    function moduleId() external pure returns (bytes32) {
        return keccak256("JobBoard");
    }

    function moduleName() external pure returns (string memory) {
        return "JobBoard";
    }

    function moduleVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    function dependencies() external pure returns (bytes32[] memory deps) {
        deps = new bytes32[](1);
        deps[0] = keccak256("Agent");
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
        s = new bytes4[](7);
        s[0] = JobBoardFacet.postJob.selector;
        s[1] = JobBoardFacet.claimJob.selector;
        s[2] = JobBoardFacet.cancelJob.selector;
        s[3] = JobBoardFacet.getJob.selector;
        s[4] = JobBoardFacet.getJobsByIdea.selector;
        s[5] = JobBoardFacet.getOpenJobsByIdea.selector;
        s[6] = JobBoardFacet.getActiveJobForAgent.selector;
    }
}
