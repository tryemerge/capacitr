// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Agent as AgentData} from "../DataTypes.sol";
import {LibAgent} from "../libraries/LibAgent.sol";
import {LibConfig} from "../libraries/LibConfig.sol";

contract AgentFacet {
    event AgentRegistered(address indexed owner, address wallet, string contextURI);
    event AgentDeactivated(address indexed wallet);
    event AgentReactivated(address indexed wallet);
    event AgentContextUpdated(address indexed wallet, string newContextURI);

    function registerAgent(string calldata contextURI) external payable {
        LibAgent.Storage storage as_ = LibAgent.store();
        LibConfig.Storage storage cs = LibConfig.store();

        require(!as_.agents[msg.sender].isActive, "AgentFacet: already registered");

        require(msg.value >= cs.agentStakeRequirement, "AgentFacet: insufficient stake");

        as_.agents[msg.sender] = AgentData({
            owner: msg.sender,
            wallet: msg.sender,
            reputationScore: 0,
            totalJobsCompleted: 0,
            totalJobsFailed: 0,
            stakedAmount: msg.value,
            isActive: true,
            contextURI: contextURI
        });

        emit AgentRegistered(msg.sender, msg.sender, contextURI);
    }

    function updateContextURI(string calldata newContextURI) external {
        LibAgent.Storage storage as_ = LibAgent.store();
        require(as_.agents[msg.sender].isActive, "AgentFacet: not active agent");
        as_.agents[msg.sender].contextURI = newContextURI;
        emit AgentContextUpdated(msg.sender, newContextURI);
    }

    function deactivateAgent() external {
        LibAgent.Storage storage as_ = LibAgent.store();
        require(as_.agents[msg.sender].isActive, "AgentFacet: not active agent");
        as_.agents[msg.sender].isActive = false;
        emit AgentDeactivated(msg.sender);
    }

    function reactivateAgent() external {
        LibAgent.Storage storage as_ = LibAgent.store();
        require(!as_.agents[msg.sender].isActive, "AgentFacet: already active");
        require(as_.agents[msg.sender].owner != address(0), "AgentFacet: not registered");
        as_.agents[msg.sender].isActive = true;
        emit AgentReactivated(msg.sender);
    }

    function getAgent(address wallet) external view returns (AgentData memory) {
        return LibAgent.store().agents[wallet];
    }

    function isRegistered(address wallet) external view returns (bool) {
        return LibAgent.store().agents[wallet].owner != address(0);
    }
}
