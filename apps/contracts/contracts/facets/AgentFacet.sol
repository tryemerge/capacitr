// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {Agent as AgentData} from "../DataTypes.sol";
import {LibAgent} from "../libraries/LibAgent.sol";
import {LibConfig} from "../libraries/LibConfig.sol";
import {IERC8004Identity} from "../interfaces/IERC8004Identity.sol";

contract AgentFacet {
    event AgentRegistered(uint256 indexed erc8004AgentId, address indexed owner, address wallet, string contextURI);
    event AgentDeactivated(address indexed wallet);
    event AgentReactivated(address indexed wallet);
    event AgentContextUpdated(address indexed wallet, string newContextURI);

    function registerAgent(
        uint256 erc8004AgentId,
        string calldata contextURI
    ) external payable {
        LibAgent.Storage storage as_ = LibAgent.store();
        LibConfig.Storage storage cs = LibConfig.store();

        require(!as_.agents[msg.sender].isActive, "AgentFacet: already registered");

        address wallet = msg.sender;

        // STUB: Allow wallet-only registration for hack if erc8004AgentId == 0
        if (erc8004AgentId != 0) {
            require(
                cs.erc8004IdentityRegistry != address(0),
                "AgentFacet: no identity registry"
            );
            require(
                IERC8004Identity(cs.erc8004IdentityRegistry).ownerOf(erc8004AgentId) == msg.sender,
                "AgentFacet: not agent owner"
            );
            // Try to get agent wallet from registry
            try IERC8004Identity(cs.erc8004IdentityRegistry).getAgentWallet(erc8004AgentId) returns (address agentWallet) {
                if (agentWallet != address(0)) {
                    wallet = agentWallet;
                }
            } catch {}
        }

        // ETH stake
        require(msg.value >= cs.agentStakeRequirement, "AgentFacet: insufficient stake");

        as_.agents[msg.sender] = AgentData({
            erc8004AgentId: erc8004AgentId,
            owner: msg.sender,
            wallet: wallet,
            reputationScore: 0,
            totalJobsCompleted: 0,
            totalJobsFailed: 0,
            stakedAmount: msg.value,
            isActive: true,
            contextURI: contextURI
        });

        if (erc8004AgentId != 0) {
            as_.erc8004ToWallet[erc8004AgentId] = msg.sender;
        }

        emit AgentRegistered(erc8004AgentId, msg.sender, wallet, contextURI);
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

    function getAgentByErc8004Id(uint256 erc8004AgentId) external view returns (AgentData memory) {
        address wallet = LibAgent.store().erc8004ToWallet[erc8004AgentId];
        return LibAgent.store().agents[wallet];
    }

    function isRegistered(address wallet) external view returns (bool) {
        return LibAgent.store().agents[wallet].owner != address(0);
    }
}
