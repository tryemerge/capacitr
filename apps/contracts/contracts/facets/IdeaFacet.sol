// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Idea, IdeaStatus, BondingCurveConfig, ReservePool as ReservePoolData} from "../DataTypes.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibBondingCurve} from "../libraries/LibBondingCurve.sol";
import {LibReservePool} from "../libraries/LibReservePool.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {IdeaToken} from "../tokens/IdeaToken.sol";
import {WorkToken} from "../tokens/WorkToken.sol";

contract IdeaFacet {
    event IdeaLaunched(uint256 indexed ideaId, string name, string symbol, address indexed launcher, address ideaToken);

    function launchIdea(
        string calldata name,
        string calldata symbol,
        uint256 totalSupply
    ) external returns (uint256 ideaId) {
        require(totalSupply > 0, "IdeaFacet: zero supply");

        LibIdea.Storage storage is_ = LibIdea.store();

        // Increment first — ideaId 0 is invalid sentinel
        is_.ideaCount++;
        ideaId = is_.ideaCount;

        // Deploy IdeaToken — full supply minted to this Diamond
        address ideaToken = address(new IdeaToken(name, symbol, totalSupply, address(this)));
        string memory workName = string.concat(name, " Work");
        string memory workSymbol = string.concat("w", symbol);
        address workToken = address(new WorkToken(workName, workSymbol));

        // 5% to reserve, 95% to bonding curve
        uint256 curveAmount = totalSupply - (totalSupply * 500) / 10000;

        // Write idea fields directly to avoid struct-literal stack pressure
        Idea storage idea = is_.ideas[ideaId];
        idea.ideaId = ideaId;
        idea.name = name;
        idea.symbol = symbol;
        idea.ideaToken = ideaToken;
        idea.workToken = workToken;
        idea.launcher = msg.sender;
        idea.status = IdeaStatus.SEEDING;
        idea.totalSupply = totalSupply;
        idea.graduationThreshold = LibConfig.store().defaultGraduationThreshold;
        idea.createdAt = block.timestamp;

        is_.tokenToIdeaId[ideaToken] = ideaId;

        // Initialize reserve pool
        LibReservePool.store().pools[ideaId].ideaId = ideaId;
        LibReservePool.store().pools[ideaId].ideaTokenBalance = totalSupply - curveAmount;

        // Initialize bonding curve
        _initCurve(ideaId, curveAmount);

        emit IdeaLaunched(ideaId, name, symbol, msg.sender, ideaToken);
    }

    function _initCurve(uint256 ideaId, uint256 curveAmount) internal {
        LibConfig.Storage storage cs = LibConfig.store();
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        curve.ideaId = ideaId;
        curve.virtualEthReserve = 1 ether;
        curve.virtualTokenReserve = curveAmount;
        curve.realTokenReserve = curveAmount;
        curve.ethFeePercent = cs.defaultEthFeeBps;
        curve.tokenFeePercent = cs.defaultTokenFeeBps;
        curve.active = true;
    }

    function getIdea(uint256 ideaId) external view returns (Idea memory) {
        return LibIdea.store().ideas[ideaId];
    }

    function getIdeaByToken(address tokenAddress) external view returns (Idea memory) {
        uint256 ideaId = LibIdea.store().tokenToIdeaId[tokenAddress];
        require(ideaId != 0, "IdeaFacet: unknown token");
        return LibIdea.store().ideas[ideaId];
    }

    function getAllIdeas() external view returns (Idea[] memory) {
        LibIdea.Storage storage is_ = LibIdea.store();
        uint256 count = is_.ideaCount;
        Idea[] memory ideas = new Idea[](count);
        for (uint256 i = 1; i <= count; i++) {
            ideas[i - 1] = is_.ideas[i];
        }
        return ideas;
    }

    function getIdeaCount() external view returns (uint256) {
        return LibIdea.store().ideaCount;
    }
}
