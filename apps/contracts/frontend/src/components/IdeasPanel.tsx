import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits, parseGwei } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

const STATUS_LABELS: Record<number, string> = {
  0: 'SEEDING',
  1: 'GRADUATED',
  2: 'ACTIVE',
};

interface Idea {
  ideaId: bigint;
  name: string;
  symbol: string;
  status: number;
  launcher: string;
  ideaToken: string;
  workToken: string;
}

export function IdeasPanel() {
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [totalSupply, setTotalSupply] = useState('');
  const [showIdeas, setShowIdeas] = useState(false);

  // Read: idea count
  const {
    data: ideaCount,
    isLoading: countLoading,
    error: countError,
    refetch: refetchCount,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getIdeaCount',
  });

  // Read: all ideas (only when requested)
  const {
    data: allIdeas,
    isLoading: ideasLoading,
    error: ideasError,
    refetch: refetchIdeas,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getAllIdeas',
    query: { enabled: showIdeas },
  });

  // Write: launch idea
  const {
    writeContract,
    data: txHash,
    isPending: isWriting,
    error: writeError,
  } = useWriteContract();

  const {
    isLoading: isConfirming,
    isSuccess: isConfirmed,
    error: confirmError,
  } = useWaitForTransactionReceipt({ hash: txHash });

  function handleLaunch() {
    if (!name || !symbol || !totalSupply) return;
    writeContract({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'launchIdea',
      args: [name, symbol, parseUnits(totalSupply, 18)],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleFetchIdeas() {
    setShowIdeas(true);
    refetchIdeas();
  }

  return (
    <div className="panel">
      <h2>Ideas Panel</h2>

      {/* Idea Count */}
      <section>
        <h3>Idea Count</h3>
        {countLoading && <p>Loading count...</p>}
        {countError && <div className="error">Error: {countError.message}</div>}
        {ideaCount !== undefined && (
          <p>
            Current ideas: <strong>{ideaCount.toString()}</strong>
          </p>
        )}
        <button onClick={() => refetchCount()}>Refresh Count</button>
      </section>

      {/* Launch Idea */}
      <section>
        <h3>Launch New Idea</h3>
        <div className="field">
          <label>Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Idea name"
          />
        </div>
        <div className="field">
          <label>Symbol</label>
          <input
            type="text"
            value={symbol}
            onChange={(e) => setSymbol(e.target.value)}
            placeholder="TOKEN"
          />
        </div>
        <div className="field">
          <label>Total Supply</label>
          <input
            type="text"
            inputMode="decimal"
            value={totalSupply}
            onChange={(e) => setTotalSupply(e.target.value)}
            placeholder="1000000"
          />
        </div>
        <button onClick={handleLaunch} disabled={isWriting || isConfirming}>
          {isWriting ? 'Sending...' : isConfirming ? 'Confirming...' : 'Launch Idea'}
        </button>

        {writeError && <div className="error">Error: {writeError.message}</div>}
        {confirmError && <div className="error">Error: {confirmError.message}</div>}
        {txHash && (
          <div className="result">
            Tx hash: {txHash}
            {isConfirmed && ' (confirmed)'}
          </div>
        )}
      </section>

      {/* View All Ideas */}
      <section>
        <h3>All Ideas</h3>
        <button onClick={handleFetchIdeas} disabled={ideasLoading}>
          {ideasLoading ? 'Loading...' : 'Fetch All Ideas'}
        </button>

        {ideasError && <div className="error">Error: {ideasError.message}</div>}
        {allIdeas && Array.isArray(allIdeas) && (
          <ul>
            {(allIdeas as Idea[]).map((idea, i) => (
              <li key={i}>
                <strong>#{idea.ideaId.toString()}</strong> {idea.name} ({idea.symbol})
                — Status: {STATUS_LABELS[idea.status] ?? idea.status}
                — Launcher: {idea.launcher}
                — IdeaToken: {idea.ideaToken}
                — WorkToken: {idea.workToken}
              </li>
            ))}
            {(allIdeas as Idea[]).length === 0 && <li>No ideas found.</li>}
          </ul>
        )}
      </section>
    </div>
  );
}
