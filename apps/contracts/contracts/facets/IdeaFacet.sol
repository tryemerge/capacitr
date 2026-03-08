// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Idea, IdeaStatus, BondingCurveConfig} from "../DataTypes.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibBondingCurve} from "../libraries/LibBondingCurve.sol";
import {LibTeamReserve} from "../libraries/LibTeamReserve.sol";
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

        is_.ideaCount++;
        ideaId = is_.ideaCount;

        // Deploy tokens
        address ideaToken = address(new IdeaToken(name, symbol, totalSupply, address(this)));
        address workToken = address(new WorkToken(
            string.concat(name, " Work"),
            string.concat("w", symbol)
        ));

        // Write idea fields
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

        // Initialize pools and curve
        _initPools(ideaId, totalSupply);

        emit IdeaLaunched(ideaId, name, symbol, msg.sender, ideaToken);
    }

    function _initPools(uint256 ideaId, uint256 totalSupply) internal {
        // 95% to bonding curve, 5% to team reserve
        uint256 teamAmount = (totalSupply * 500) / 10000;
        uint256 curveAmount = totalSupply - teamAmount;

        // Team reserve (5% locked)
        LibTeamReserve.store().reserves[ideaId].ideaId = ideaId;
        LibTeamReserve.store().reserves[ideaId].ideaTokenBalance = teamAmount;

        // Derivative pool (starts empty, fees accrue here)
        LibReservePool.store().pools[ideaId].ideaId = ideaId;

        // Bonding curve
        _initCurve(ideaId, curveAmount);
    }

    function _initCurve(uint256 ideaId, uint256 curveAmount) internal {
        LibConfig.Storage storage cs = LibConfig.store();
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        curve.ideaId = ideaId;
        curve.virtualEthReserve = 30 ether;
        curve.virtualTokenReserve = (curveAmount * 1353) / 1000;
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
