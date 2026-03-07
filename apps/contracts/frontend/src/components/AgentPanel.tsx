import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseEther, formatEther, parseGwei } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

export function AgentPanel() {
  const [regContextURI, setRegContextURI] = useState('');
  const [regStake, setRegStake] = useState('');
  const [checkAddr, setCheckAddr] = useState('');
  const [checkEnabled, setCheckEnabled] = useState(false);
  const [viewAddr, setViewAddr] = useState('');
  const [viewEnabled, setViewEnabled] = useState(false);
  const [newContextURI, setNewContextURI] = useState('');

  const { writeContract: registerWrite, data: registerHash, error: registerError } = useWriteContract();
  const { isLoading: registerLoading } = useWaitForTransactionReceipt({ hash: registerHash });

  const { writeContract: updateURIWrite, data: updateURIHash, error: updateURIError } = useWriteContract();
  const { isLoading: updateURILoading } = useWaitForTransactionReceipt({ hash: updateURIHash });

  const { writeContract: deactivateWrite, data: deactivateHash, error: deactivateError } = useWriteContract();
  const { isLoading: deactivateLoading } = useWaitForTransactionReceipt({ hash: deactivateHash });

  const { writeContract: reactivateWrite, data: reactivateHash, error: reactivateError } = useWriteContract();
  const { isLoading: reactivateLoading } = useWaitForTransactionReceipt({ hash: reactivateHash });

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
      args: [regContextURI],
      value: regStake ? parseEther(regStake) : 0n,
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleUpdateURI() {
    updateURIWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'updateContextURI',
      args: [newContextURI],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleDeactivate() {
    deactivateWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'deactivateAgent',
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleReactivate() {
    reactivateWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'reactivateAgent',
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  const agent = agentData as
    | { owner: string; wallet: string; reputationScore: bigint; totalJobsCompleted: bigint; totalJobsFailed: bigint; stakedAmount: bigint; isActive: boolean; contextURI: string }
    | undefined;

  return (
    <div className="panel">
      <h2>Agent Module</h2>

      <section>
        <h3>Register as Agent</h3>
        <div className="field">
          <label>Context URI</label>
          <input type="text" value={regContextURI} onChange={(e) => setRegContextURI(e.target.value)} placeholder="ipfs://..." />
        </div>
        <div className="field">
          <label>ETH Stake Amount</label>
          <input type="text" inputMode="decimal" value={regStake} onChange={(e) => setRegStake(e.target.value)} placeholder="0.01" />
        </div>
        <button onClick={handleRegister} disabled={registerLoading}>
          {registerLoading ? 'Registering...' : 'Register Agent'}
        </button>
        {registerHash && <div className="result">Tx: {registerHash}</div>}
        {registerError && <div className="error">{registerError.message}</div>}
      </section>

      <section>
        <h3>Check Registration</h3>
        <div className="field">
          <label>Wallet Address</label>
          <input type="text" value={checkAddr} onChange={(e) => { setCheckAddr(e.target.value); setCheckEnabled(false); }} placeholder="0x..." />
        </div>
        <button onClick={() => setCheckEnabled(true)}>Check</button>
        {checkEnabled && isRegisteredData !== undefined && (
          <div className="result">Registered: {String(isRegisteredData)}</div>
        )}
        {isRegisteredError && <div className="error">{isRegisteredError.message}</div>}
      </section>

      <section>
        <h3>View Agent Details</h3>
        <div className="field">
          <label>Wallet Address</label>
          <input type="text" value={viewAddr} onChange={(e) => { setViewAddr(e.target.value); setViewEnabled(false); }} placeholder="0x..." />
        </div>
        <button onClick={() => setViewEnabled(true)}>View Agent</button>
        {viewEnabled && agent && (
          <div className="result">
            <p><strong>Owner:</strong> {agent.owner}</p>
            <p><strong>Wallet:</strong> {agent.wallet}</p>
            <p><strong>Reputation Score:</strong> {agent.reputationScore.toString()}</p>
            <p><strong>Jobs Completed:</strong> {agent.totalJobsCompleted.toString()}</p>
            <p><strong>Jobs Failed:</strong> {agent.totalJobsFailed.toString()}</p>
            <p><strong>Staked:</strong> {formatEther(agent.stakedAmount)} ETH</p>
            <p><strong>Active:</strong> {String(agent.isActive)}</p>
            <p><strong>Context URI:</strong> {agent.contextURI}</p>
          </div>
        )}
        {agentError && <div className="error">{agentError.message}</div>}
      </section>

      <section>
        <h3>Update Context URI</h3>
        <div className="field">
          <label>New Context URI</label>
          <input type="text" value={newContextURI} onChange={(e) => setNewContextURI(e.target.value)} placeholder="ipfs://..." />
        </div>
        <button onClick={handleUpdateURI} disabled={updateURILoading}>
          {updateURILoading ? 'Updating...' : 'Update Context URI'}
        </button>
        {updateURIHash && <div className="result">Tx: {updateURIHash}</div>}
        {updateURIError && <div className="error">{updateURIError.message}</div>}
      </section>

      <section>
        <h3>Deactivate / Reactivate</h3>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={handleDeactivate} disabled={deactivateLoading}>
            {deactivateLoading ? 'Deactivating...' : 'Deactivate'}
          </button>
          <button onClick={handleReactivate} disabled={reactivateLoading}>
            {reactivateLoading ? 'Reactivating...' : 'Reactivate'}
          </button>
        </div>
        {deactivateHash && <div className="result">Deactivate Tx: {deactivateHash}</div>}
        {deactivateError && <div className="error">{deactivateError.message}</div>}
        {reactivateHash && <div className="result">Reactivate Tx: {reactivateHash}</div>}
        {reactivateError && <div className="error">{reactivateError.message}</div>}
      </section>
    </div>
  );
}
