// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IERC8004Identity {
    function ownerOf(uint256 agentId) external view returns (address);
    function getAgentWallet(uint256 agentId) external view returns (address);
}
