import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

const POLL_STATUS: Record<number, string> = {
  0: 'ACTIVE',
  1: 'PASSED',
  2: 'FAILED',
  3: 'EXPIRED',
};

export function PollsPanel() {
  // Register as voter
  const [registerIdeaId, setRegisterIdeaId] = useState('');

  // View poll
  const [viewPollId, setViewPollId] = useState('');
  const [fetchPoll, setFetchPoll] = useState(false);

  // View poll by submission
  const [viewSubId, setViewSubId] = useState('');
  const [fetchPollBySub, setFetchPollBySub] = useState(false);

  // Cast vote
  const [votePollId, setVotePollId] = useState('');
  const [voteValue, setVoteValue] = useState(true);

  // Has voted
  const [hasVotedPollId, setHasVotedPollId] = useState('');
  const [hasVotedAddress, setHasVotedAddress] = useState('');
  const [fetchHasVoted, setFetchHasVoted] = useState(false);

  // Resolve poll
  const [resolvePollId, setResolvePollId] = useState('');

  // Register as voter tx
  const { writeContract: registerVoter, data: registerHash, error: registerError } = useWriteContract();
  const { isLoading: registerLoading, isSuccess: registerSuccess } = useWaitForTransactionReceipt({ hash: registerHash });

  // Cast vote tx
  const { writeContract: castVote, data: castVoteHash, error: castVoteError } = useWriteContract();
  const { isLoading: castVoteLoading, isSuccess: castVoteSuccess } = useWaitForTransactionReceipt({ hash: castVoteHash });

  // Resolve poll tx
  const { writeContract: resolvePoll, data: resolveHash, error: resolveError } = useWriteContract();
  const { isLoading: resolveLoading, isSuccess: resolveSuccess } = useWaitForTransactionReceipt({ hash: resolveHash });

  // Read poll
  const { data: pollData, error: pollError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getPoll',
    args: fetchPoll && viewPollId ? [BigInt(viewPollId)] : undefined,
    query: { enabled: fetchPoll && !!viewPollId },
  });

  // Read poll by submission
  const { data: pollBySubData, error: pollBySubError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getPollBySubmission',
    args: fetchPollBySub && viewSubId ? [BigInt(viewSubId)] : undefined,
    query: { enabled: fetchPollBySub && !!viewSubId },
  });

  // Has address voted
  const { data: hasVotedResult, error: hasVotedError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'hasAddressVoted',
    args: fetchHasVoted && hasVotedPollId && hasVotedAddress
      ? [BigInt(hasVotedPollId), hasVotedAddress as `0x${string}`]
      : undefined,
    query: { enabled: fetchHasVoted && !!hasVotedPollId && !!hasVotedAddress },
  });

  function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    registerVoter({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'registerAsVoter',
      args: [BigInt(registerIdeaId)],
    });
  }

  function handleCastVote(e: React.FormEvent) {
    e.preventDefault();
    castVote({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'castVote',
      args: [BigInt(votePollId), voteValue],
    });
  }

  function handleResolve(e: React.FormEvent) {
    e.preventDefault();
    resolvePoll({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'resolvePoll',
      args: [BigInt(resolvePollId)],
    });
  }

  function renderPoll(data: any) {
    if (!data) return null;
    return (
      <div className="result">
        <p><strong>pollId:</strong> {data.pollId?.toString()}</p>
        <p><strong>submissionId:</strong> {data.submissionId?.toString()}</p>
        <p><strong>ideaId:</strong> {data.ideaId?.toString()}</p>
        <p><strong>voterPool:</strong> {data.voterPool?.length ? data.voterPool.join(', ') : '(none)'}</p>
        <p><strong>yesVotes:</strong> {data.yesVotes?.toString()}</p>
        <p><strong>noVotes:</strong> {data.noVotes?.toString()}</p>
        <p><strong>quorumThreshold:</strong> {data.quorumThreshold?.toString()}</p>
        <p><strong>passThreshold:</strong> {data.passThreshold?.toString()}</p>
        <p><strong>status:</strong> {POLL_STATUS[Number(data.status)] ?? data.status?.toString()}</p>
        <p><strong>createdAt:</strong> {new Date(Number(data.createdAt) * 1000).toLocaleString()}</p>
        <p><strong>expiresAt:</strong> {new Date(Number(data.expiresAt) * 1000).toLocaleString()}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Polls Panel</h2>

      <h3>Register as Voter</h3>
      <form onSubmit={handleRegister}>
        <div className="field">
          <label>Idea ID</label>
          <input type="text" inputMode="decimal" value={registerIdeaId} onChange={(e) => setRegisterIdeaId(e.target.value)} />
        </div>
        <button type="submit" disabled={registerLoading}>
          {registerLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      {registerHash && <div className="result">Tx: {registerHash}{registerSuccess && ' (confirmed)'}</div>}
      {registerError && <div className="error">{registerError.message}</div>}

      <h3>View Poll</h3>
      <div className="field">
        <label>Poll ID</label>
        <input type="text" inputMode="decimal" value={viewPollId} onChange={(e) => { setViewPollId(e.target.value); setFetchPoll(false); }} />
      </div>
      <button onClick={() => setFetchPoll(true)}>Fetch</button>
      {pollData && renderPoll(pollData)}
      {pollError && <div className="error">{pollError.message}</div>}

      <h3>View Poll by Submission</h3>
      <div className="field">
        <label>Submission ID</label>
        <input type="text" inputMode="decimal" value={viewSubId} onChange={(e) => { setViewSubId(e.target.value); setFetchPollBySub(false); }} />
      </div>
      <button onClick={() => setFetchPollBySub(true)}>Fetch</button>
      {pollBySubData && renderPoll(pollBySubData)}
      {pollBySubError && <div className="error">{pollBySubError.message}</div>}

      <h3>Cast Vote</h3>
      <form onSubmit={handleCastVote}>
        <div className="field">
          <label>Poll ID</label>
          <input type="text" inputMode="decimal" value={votePollId} onChange={(e) => setVotePollId(e.target.value)} />
        </div>
        <div className="field">
          <label>Vote</label>
          <label>
            <input type="radio" name="vote" checked={voteValue === true} onChange={() => setVoteValue(true)} /> Yes
          </label>
          <label>
            <input type="radio" name="vote" checked={voteValue === false} onChange={() => setVoteValue(false)} /> No
          </label>
        </div>
        <button type="submit" disabled={castVoteLoading}>
          {castVoteLoading ? 'Voting...' : 'Cast Vote'}
        </button>
      </form>
      {castVoteHash && <div className="result">Tx: {castVoteHash}{castVoteSuccess && ' (confirmed)'}</div>}
      {castVoteError && <div className="error">{castVoteError.message}</div>}

      <h3>Check if Voted</h3>
      <div className="field">
        <label>Poll ID</label>
        <input type="text" inputMode="decimal" value={hasVotedPollId} onChange={(e) => { setHasVotedPollId(e.target.value); setFetchHasVoted(false); }} />
      </div>
      <div className="field">
        <label>Address</label>
        <input type="text" value={hasVotedAddress} onChange={(e) => { setHasVotedAddress(e.target.value); setFetchHasVoted(false); }} />
      </div>
      <button onClick={() => setFetchHasVoted(true)}>Check</button>
      {fetchHasVoted && hasVotedResult !== undefined && (
        <div className="result">{hasVotedResult ? 'Yes, has voted' : 'No, has not voted'}</div>
      )}
      {hasVotedError && <div className="error">{hasVotedError.message}</div>}

      <h3>Resolve Poll</h3>
      <form onSubmit={handleResolve}>
        <div className="field">
          <label>Poll ID</label>
          <input type="text" inputMode="decimal" value={resolvePollId} onChange={(e) => setResolvePollId(e.target.value)} />
        </div>
        <button type="submit" disabled={resolveLoading}>
          {resolveLoading ? 'Resolving...' : 'Resolve Poll'}
        </button>
      </form>
      {resolveHash && <div className="result">Tx: {resolveHash}{resolveSuccess && ' (confirmed)'}</div>}
      {resolveError && <div className="error">{resolveError.message}</div>}
    </div>
  );
}
