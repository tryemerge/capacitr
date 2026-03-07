// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Idea, IdeaStatus, BondingCurveConfig} from "../DataTypes.sol";
import {LibBondingCurve} from "../libraries/LibBondingCurve.sol";
import {LibIdea} from "../libraries/LibIdea.sol";
import {LibReservePool} from "../libraries/LibReservePool.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {ReentrancyGuard} from "@solidstate/contracts/security/reentrancy_guard/ReentrancyGuard.sol";

contract BondingCurveFacet is ReentrancyGuard {
    event TokensPurchased(uint256 indexed ideaId, address indexed buyer, uint256 ethIn, uint256 tokensOut, uint256 tokenFee, uint256 ethFee);
    event TokensSold(uint256 indexed ideaId, address indexed seller, uint256 tokensIn, uint256 ethOut, uint256 tokenFee, uint256 ethFee);
    event IdeaGraduated(uint256 indexed ideaId, address workToken, uint256 marketCap);

    function buy(uint256 ideaId, uint256 minTokensOut) external payable nonReentrant {
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        Idea storage idea = LibIdea.store().ideas[ideaId];

        require(curve.active, "BondingCurveFacet: curve not active");
        require(msg.value > 0, "BondingCurveFacet: zero ETH");

        // Deduct ETH fee from msg.value BEFORE curve calc
        uint256 ethFee = (msg.value * curve.ethFeePercent) / 10000;
        uint256 netEthIn = msg.value - ethFee;

        // Compute tokens out, deduct token fee
        uint256 grossTokensOut = _getTokensOut(curve, netEthIn);
        uint256 tokenFee = (grossTokensOut * curve.tokenFeePercent) / 10000;
        uint256 netTokensOut = grossTokensOut - tokenFee;

        require(netTokensOut >= minTokensOut, "BondingCurveFacet: slippage");
        require(grossTokensOut <= curve.realTokenReserve, "BondingCurveFacet: insufficient liquidity");

        // Update reserves
        curve.realEthReserve += netEthIn;
        curve.realTokenReserve -= grossTokensOut;

        // Token fee → reserve pool
        LibReservePool.store().pools[ideaId].ideaTokenBalance += tokenFee;

        // Send ETH fee to treasury, transfer tokens to buyer
        _sendEth(LibConfig.store().treasury, ethFee);
        IERC20(idea.ideaToken).transfer(msg.sender, netTokensOut);

        emit TokensPurchased(ideaId, msg.sender, msg.value, netTokensOut, tokenFee, ethFee);

        // Check graduation
        if (curve.realTokenReserve > 0) {
            uint256 marketCap = (curve.realEthReserve * idea.totalSupply) / curve.realTokenReserve;
            if (marketCap >= idea.graduationThreshold) {
                _graduate(ideaId);
            }
        }
    }

    function sell(uint256 ideaId, uint256 tokenAmount, uint256 minEthOut) external nonReentrant {
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        Idea storage idea = LibIdea.store().ideas[ideaId];

        require(curve.active, "BondingCurveFacet: curve not active");
        require(tokenAmount > 0, "BondingCurveFacet: zero tokens");

        // Transfer tokens from seller to Diamond
        IERC20(idea.ideaToken).transferFrom(msg.sender, address(this), tokenAmount);

        // Deduct token fee → reserve pool
        uint256 tokenFee = (tokenAmount * curve.tokenFeePercent) / 10000;
        uint256 netTokensIn = tokenAmount - tokenFee;
        LibReservePool.store().pools[ideaId].ideaTokenBalance += tokenFee;

        // Compute ETH out, deduct ETH fee
        uint256 grossEthOut = _getEthOut(curve, netTokensIn);
        uint256 ethFee = (grossEthOut * curve.ethFeePercent) / 10000;
        uint256 netEthOut = grossEthOut - ethFee;

        require(netEthOut >= minEthOut, "BondingCurveFacet: slippage");

        // Update reserves
        curve.realTokenReserve += netTokensIn;
        curve.realEthReserve -= grossEthOut;

        // Send ETH fee to treasury
        _sendEth(LibConfig.store().treasury, ethFee);
        // Send net ETH to seller
        _sendEth(msg.sender, netEthOut);

        emit TokensSold(ideaId, msg.sender, tokenAmount, netEthOut, tokenFee, ethFee);
    }

    function _graduate(uint256 ideaId) internal {
        Idea storage idea = LibIdea.store().ideas[ideaId];
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];

        idea.status = IdeaStatus.GRADUATED;
        idea.graduatedAt = block.timestamp;

        uint256 marketCap = curve.realTokenReserve > 0
            ? (curve.realEthReserve * idea.totalSupply) / curve.realTokenReserve
            : type(uint256).max;
        emit IdeaGraduated(ideaId, idea.workToken, marketCap);
    }

    // --- View Functions ---

    function getPrice(uint256 ideaId) external view returns (uint256) {
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        uint256 ethReserve = curve.virtualEthReserve + curve.realEthReserve;
        uint256 tokenReserve = curve.virtualTokenReserve + curve.realTokenReserve;
        // Price = ethReserve / tokenReserve (scaled by 1e18)
        return (ethReserve * 1e18) / tokenReserve;
    }

    function getQuoteBuy(uint256 ideaId, uint256 ethAmount) external view returns (uint256) {
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        uint256 ethFee = (ethAmount * curve.ethFeePercent) / 10000;
        uint256 netEth = ethAmount - ethFee;
        uint256 grossTokens = _getTokensOut(curve, netEth);
        uint256 tokenFee = (grossTokens * curve.tokenFeePercent) / 10000;
        return grossTokens - tokenFee;
    }

    function getQuoteSell(uint256 ideaId, uint256 tokenAmount) external view returns (uint256) {
        BondingCurveConfig storage curve = LibBondingCurve.store().curves[ideaId];
        uint256 tokenFee = (tokenAmount * curve.tokenFeePercent) / 10000;
        uint256 netTokens = tokenAmount - tokenFee;
        uint256 grossEth = _getEthOut(curve, netTokens);
        uint256 ethFee = (grossEth * curve.ethFeePercent) / 10000;
        return grossEth - ethFee;
    }

    function getCurveConfig(uint256 ideaId) external view returns (BondingCurveConfig memory) {
        return LibBondingCurve.store().curves[ideaId];
    }

    function _sendEth(address to, uint256 amount) internal {
        if (amount == 0) return;
        (bool success, ) = to.call{value: amount}("");
        require(success, "BondingCurveFacet: ETH transfer failed");
    }

    // --- Internal Math ---

    function _getTokensOut(BondingCurveConfig storage curve, uint256 ethIn) internal view returns (uint256) {
        uint256 ethReserve = curve.virtualEthReserve + curve.realEthReserve;
        uint256 tokenReserve = curve.virtualTokenReserve + curve.realTokenReserve;
        uint256 newEthReserve = ethReserve + ethIn;
        uint256 newTokenReserve = (ethReserve * tokenReserve) / newEthReserve;
        return tokenReserve - newTokenReserve;
    }

    function _getEthOut(BondingCurveConfig storage curve, uint256 tokensIn) internal view returns (uint256) {
        uint256 ethReserve = curve.virtualEthReserve + curve.realEthReserve;
        uint256 tokenReserve = curve.virtualTokenReserve + curve.realTokenReserve;
        uint256 newTokenReserve = tokenReserve + tokensIn;
        uint256 newEthReserve = (ethReserve * tokenReserve) / newTokenReserve;
        return ethReserve - newEthReserve;
    }
}
