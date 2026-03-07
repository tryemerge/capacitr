// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IModule} from "../interfaces/IModule.sol";
import {IERC2535DiamondCutInternal} from
    "@solidstate/contracts/interfaces/IERC2535DiamondCutInternal.sol";
import {WorkMarketplaceFacet} from "../facets/WorkMarketplaceFacet.sol";
import {SnapPollFacet} from "../facets/SnapPollFacet.sol";

contract WorkMarketplaceModule is IModule {
    address immutable workFacet;
    address immutable pollFacet;

    constructor(address _workFacet, address _pollFacet) {
        workFacet = _workFacet;
        pollFacet = _pollFacet;
    }

    function moduleId() external pure returns (bytes32) {
        return keccak256("WorkMarketplace");
    }

    function moduleName() external pure returns (string memory) {
        return "WorkMarketplace";
    }

    function moduleVersion() external pure returns (string memory) {
        return "1.0.0";
    }

    function dependencies() external pure returns (bytes32[] memory deps) {
        deps = new bytes32[](2);
        deps[0] = keccak256("Agent");
        deps[1] = keccak256("JobBoard");
    }

    function installPlan() external view returns (IERC2535DiamondCutInternal.FacetCut[] memory cuts) {
        cuts = new IERC2535DiamondCutInternal.FacetCut[](2);

        // WorkMarketplaceFacet selectors
        bytes4[] memory workSelectors = new bytes4[](3);
        workSelectors[0] = WorkMarketplaceFacet.submitWork.selector;
        workSelectors[1] = WorkMarketplaceFacet.getSubmission.selector;
        workSelectors[2] = WorkMarketplaceFacet.getSubmissionByJob.selector;

        cuts[0] = IERC2535DiamondCutInternal.FacetCut({
            target: workFacet,
            action: IERC2535DiamondCutInternal.FacetCutAction.ADD,
            selectors: workSelectors
        });

        // SnapPollFacet selectors
        bytes4[] memory pollSelectors = new bytes4[](6);
        pollSelectors[0] = SnapPollFacet.registerAsVoter.selector;
        pollSelectors[1] = SnapPollFacet.castVote.selector;
        pollSelectors[2] = SnapPollFacet.resolvePoll.selector;
        pollSelectors[3] = SnapPollFacet.getPoll.selector;
        pollSelectors[4] = SnapPollFacet.getPollBySubmission.selector;
        pollSelectors[5] = SnapPollFacet.hasAddressVoted.selector;

        cuts[1] = IERC2535DiamondCutInternal.FacetCut({
            target: pollFacet,
            action: IERC2535DiamondCutInternal.FacetCutAction.ADD,
            selectors: pollSelectors
        });
    }

    function uninstallPlan() external view returns (IERC2535DiamondCutInternal.FacetCut[] memory cuts) {
        cuts = new IERC2535DiamondCutInternal.FacetCut[](2);

        bytes4[] memory workSelectors = new bytes4[](3);
        workSelectors[0] = WorkMarketplaceFacet.submitWork.selector;
        workSelectors[1] = WorkMarketplaceFacet.getSubmission.selector;
        workSelectors[2] = WorkMarketplaceFacet.getSubmissionByJob.selector;

        cuts[0] = IERC2535DiamondCutInternal.FacetCut({
            target: address(0),
            action: IERC2535DiamondCutInternal.FacetCutAction.REMOVE,
            selectors: workSelectors
        });

        bytes4[] memory pollSelectors = new bytes4[](6);
        pollSelectors[0] = SnapPollFacet.registerAsVoter.selector;
        pollSelectors[1] = SnapPollFacet.castVote.selector;
        pollSelectors[2] = SnapPollFacet.resolvePoll.selector;
        pollSelectors[3] = SnapPollFacet.getPoll.selector;
        pollSelectors[4] = SnapPollFacet.getPollBySubmission.selector;
        pollSelectors[5] = SnapPollFacet.hasAddressVoted.selector;

        cuts[1] = IERC2535DiamondCutInternal.FacetCut({
            target: address(0),
            action: IERC2535DiamondCutInternal.FacetCutAction.REMOVE,
            selectors: pollSelectors
        });
    }
}
