// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {IModule} from "../interfaces/IModule.sol";
import {IERC2535DiamondCutInternal} from
    "@solidstate/contracts/interfaces/IERC2535DiamondCutInternal.sol";
import {ReservePoolFacet} from "../facets/ReservePoolFacet.sol";

contract ReservePoolModule is IModule {
    address immutable facet;

    constructor(address _facet) {
        facet = _facet;
    }

    function moduleId() external pure returns (bytes32) {
        return keccak256("ReservePool");
    }

    function moduleName() external pure returns (string memory) {
        return "ReservePool";
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
        s = new bytes4[](3);
        s[0] = ReservePoolFacet.redeem.selector;
        s[1] = ReservePoolFacet.getReservePool.selector;
        s[2] = ReservePoolFacet.getRedemptionRate.selector;
    }
}
