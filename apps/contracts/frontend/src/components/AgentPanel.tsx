import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

export function AgentPanel() {
  // Register agent state
  const [regAgentId, setRegAgentId] = useState('');
  const [regContextURI, setRegContextURI] = useState('');
  const [regStake, setRegStake] = useState('');

  // Check registration state
  const [checkAddr, setCheckAddr] = useState('');
  const [checkEnabled, setCheckEnabled] = useState(false);

  // View agent state
  const [viewAddr, setViewAddr] = useState('');
  const [viewEnabled, setViewEnabled] = useState(false);

  // Update context URI state
  const [newContextURI, setNewContextURI] = useState('');

  // Write hooks
  const { writeContract: registerWrite, data: registerHash, error: registerError } = useWriteContract();
  const { isLoading: registerLoading } = useWaitForTransactionReceipt({ hash: registerHash });

  const { writeContract: updateURIWrite, data: updateURIHash, error: updateURIError } = useWriteContract();
  const { isLoading: updateURILoading } = useWaitForTransactionReceipt({ hash: updateURIHash });

  const { writeContract: deactivateWrite, data: deactivateHash, error: deactivateError } = useWriteContract();
  const { isLoading: deactivateLoading } = useWaitForTransactionReceipt({ hash: deactivateHash });

  const { writeContract: reactivateWrite, data: reactivateHash, error: reactivateError } = useWriteContract();
  const { isLoading: reactivateLoading } = useWaitForTransactionReceipt({ hash: reactivateHash });

  // Read hooks
  const { data: isRegisteredData, error: isRegisteredError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'isRegistered',
    args: checkAddr ? [checkAddr as `0x${string}`] : undefined,
    query: { enabled: checkEnabled && !!checkAddr },
  });

  const { data: agentData, error: agentError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getAgent',
    args: viewAddr ? [viewAddr as `0x${string}`] : undefined,
    query: { enabled: viewEnabled && !!viewAddr },
  });

  function handleRegister() {
    registerWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'registerAgent',
      args: [BigInt(regAgentId || '0'), regContextURI],
      value: regStake ? parseEther(regStake) : 0n,
    });
  }

  function handleUpdateURI() {
    updateURIWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'updateContextURI',
      args: [newContextURI],
    });
  }

  function handleDeactivate() {
    deactivateWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'deactivateAgent',
    });
  }

  function handleReactivate() {
    reactivateWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'reactivateAgent',
    });
  }

  const agent = agentData as
    | {
        owner: string;
        wallet: string;
        reputationScore: bigint;
        totalJobsCompleted: bigint;
        totalJobsFailed: bigint;
        stakedAmount: bigint;
        isActive: boolean;
        contextURI: string;
      }
    | undefined;

  return (
    <div className="panel">
      <h2>Agent Panel</h2>

      {/* Register Agent */}
      <h3>Register as Agent</h3>
      <div className="field">
        <label>ERC-8004 Agent ID (0 for wallet-only)</label>
        <input
          type="text"
          inputMode="decimal"
          value={regAgentId}
          onChange={(e) => setRegAgentId(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="field">
        <label>Context URI</label>
        <input
          type="text"
          value={regContextURI}
          onChange={(e) => setRegContextURI(e.target.value)}
          placeholder="ipfs://..."
        />
      </div>
      <div className="field">
        <label>ETH Stake Amount</label>
        <input
          type="text"
          inputMode="decimal"
          value={regStake}
          onChange={(e) => setRegStake(e.target.value)}
          placeholder="0.1"
        />
      </div>
      <button onClick={handleRegister} disabled={registerLoading}>
        {registerLoading ? 'Registering...' : 'Register Agent'}
      </button>
      {registerHash && <div className="result">Tx: {registerHash}</div>}
      {registerError && <div className="error">{registerError.message}</div>}

      {/* Check Registration */}
      <h3>Check Registration</h3>
      <div className="field">
        <label>Wallet Address</label>
        <input
          type="text"
          value={checkAddr}
          onChange={(e) => { setCheckAddr(e.target.value); setCheckEnabled(false); }}
          placeholder="0x..."
        />
      </div>
      <button onClick={() => setCheckEnabled(true)}>Check</button>
      {checkEnabled && isRegisteredData !== undefined && (
        <div className="result">Registered: {String(isRegisteredData)}</div>
      )}
      {isRegisteredError && <div className="error">{isRegisteredError.message}</div>}

      {/* View Agent Details */}
      <h3>View Agent Details</h3>
      <div className="field">
        <label>Wallet Address</label>
        <input
          type="text"
          value={viewAddr}
          onChange={(e) => { setViewAddr(e.target.value); setViewEnabled(false); }}
          placeholder="0x..."
        />
      </div>
      <button onClick={() => setViewEnabled(true)}>View Agent</button>
      {viewEnabled && agent && (
        <div className="result">
          <p><strong>Owner:</strong> {agent.owner}</p>
          <p><strong>Wallet:</strong> {agent.wallet}</p>
          <p><strong>Reputation Score:</strong> {agent.reputationScore.toString()}</p>
          <p><strong>Total Jobs Completed:</strong> {agent.totalJobsCompleted.toString()}</p>
          <p><strong>Total Jobs Failed:</strong> {agent.totalJobsFailed.toString()}</p>
          <p><strong>Staked Amount:</strong> {formatEther(agent.stakedAmount)} ETH</p>
          <p><strong>Is Active:</strong> {String(agent.isActive)}</p>
          <p><strong>Context URI:</strong> {agent.contextURI}</p>
        </div>
      )}
      {agentError && <div className="error">{agentError.message}</div>}

      {/* Update Context URI */}
      <h3>Update Context URI</h3>
      <div className="field">
        <label>New Context URI</label>
        <input
          type="text"
          value={newContextURI}
          onChange={(e) => setNewContextURI(e.target.value)}
          placeholder="ipfs://..."
        />
      </div>
      <button onClick={handleUpdateURI} disabled={updateURILoading}>
        {updateURILoading ? 'Updating...' : 'Update Context URI'}
      </button>
      {updateURIHash && <div className="result">Tx: {updateURIHash}</div>}
      {updateURIError && <div className="error">{updateURIError.message}</div>}

      {/* Deactivate / Reactivate */}
      <h3>Deactivate / Reactivate</h3>
      <button onClick={handleDeactivate} disabled={deactivateLoading}>
        {deactivateLoading ? 'Deactivating...' : 'Deactivate Agent'}
      </button>
      <button onClick={handleReactivate} disabled={reactivateLoading}>
        {reactivateLoading ? 'Reactivating...' : 'Reactivate Agent'}
      </button>
      {deactivateHash && <div className="result">Deactivate Tx: {deactivateHash}</div>}
      {deactivateError && <div className="error">{deactivateError.message}</div>}
      {reactivateHash && <div className="result">Reactivate Tx: {reactivateHash}</div>}
      {reactivateError && <div className="error">{reactivateError.message}</div>}
    </div>
  );
}
