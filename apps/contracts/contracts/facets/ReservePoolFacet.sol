// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Idea, IdeaStatus, ReservePool as ReservePoolData} from "../DataTypes.sol";
import {LibReservePool} from "../libraries/LibReservePool.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {WorkToken} from "../tokens/WorkToken.sol";
import {ReentrancyGuard} from "@solidstate/contracts/security/reentrancy_guard/ReentrancyGuard.sol";

contract ReservePoolFacet is ReentrancyGuard {
    event WorkTokenRedeemed(uint256 indexed ideaId, address indexed redeemer, uint256 workTokensBurned, uint256 ideaTokensOut);

    function redeem(uint256 ideaId, uint256 workTokenAmount) external nonReentrant {
        require(workTokenAmount > 0, "ReservePoolFacet: zero amount");

        LibIdea.Storage storage is_ = LibIdea.store();
        Idea storage idea = is_.ideas[ideaId];
        require(idea.workToken != address(0), "ReservePoolFacet: no work token");

        LibReservePool.Storage storage rs = LibReservePool.store();
        ReservePoolData storage pool = rs.pools[ideaId];

        WorkToken workToken = WorkToken(idea.workToken);

        // Use totalSupply as denominator (accounts for already-burned tokens)
        uint256 currentSupply = workToken.totalSupply();
        require(currentSupply > 0, "ReservePoolFacet: no work tokens outstanding");

        // Calculate proportional share: multiply before divide
        uint256 ideaTokensOut = (workTokenAmount * pool.ideaTokenBalance) / currentSupply;
        require(ideaTokensOut > 0, "ReservePoolFacet: redemption too small");

        // Transfer work tokens from user to diamond, then burn.
        // workToken.burn() calls _burn(msg.sender, amount). When called as a regular
        // external call from the Diamond, msg.sender is the Diamond address, so it
        // burns the Diamond's balance — which is correct after the transferFrom.
        IERC20(idea.workToken).transferFrom(msg.sender, address(this), workTokenAmount);
        workToken.burn(workTokenAmount);

        // Update pool
        pool.ideaTokenBalance -= ideaTokensOut;
        pool.totalRedeemed += workTokenAmount;

        // Transfer idea tokens to redeemer
        IERC20(idea.ideaToken).transfer(msg.sender, ideaTokensOut);

        emit WorkTokenRedeemed(ideaId, msg.sender, workTokenAmount, ideaTokensOut);
    }

    function getReservePool(uint256 ideaId) external view returns (ReservePoolData memory) {
        return LibReservePool.store().pools[ideaId];
    }

    function getRedemptionRate(uint256 ideaId) external view returns (uint256) {
        LibIdea.Storage storage is_ = LibIdea.store();
        Idea storage idea = is_.ideas[ideaId];
        if (idea.workToken == address(0)) return 0;

        LibReservePool.Storage storage rs = LibReservePool.store();
        ReservePoolData storage pool = rs.pools[ideaId];

        uint256 currentSupply = IERC20(idea.workToken).totalSupply();
        if (currentSupply == 0) return 0;

        // Returns idea tokens per 1e18 work tokens
        return (1e18 * pool.ideaTokenBalance) / currentSupply;
    }
}
