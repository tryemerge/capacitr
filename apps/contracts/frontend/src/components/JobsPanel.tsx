import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

const JOB_STATUS_LABELS: Record<number, string> = {
  0: 'OPEN',
  1: 'CLAIMED',
  2: 'SUBMITTED',
  3: 'COMPLETED',
  4: 'REJECTED',
  5: 'CANCELLED',
};

function jobStatusLabel(status: number | bigint): string {
  return JOB_STATUS_LABELS[Number(status)] ?? `UNKNOWN(${status})`;
}

interface Job {
  jobId: bigint;
  title: string;
  status: number;
  poster: string;
  claimedBy: string;
  workTokenReward: bigint;
  deliverableSpec: string;
  ideaId: bigint;
  jobType: number;
}

export function JobsPanel() {
  // Post job state
  const [postIdeaId, setPostIdeaId] = useState('');
  const [postTitle, setPostTitle] = useState('');
  const [postSpec, setPostSpec] = useState('');
  const [postJobType, setPostJobType] = useState('');
  const [postReward, setPostReward] = useState('');

  // View jobs by idea state
  const [viewIdeaId, setViewIdeaId] = useState('');
  const [viewEnabled, setViewEnabled] = useState(false);

  // View open jobs state
  const [openIdeaId, setOpenIdeaId] = useState('');
  const [openEnabled, setOpenEnabled] = useState(false);

  // Claim job state
  const [claimJobId, setClaimJobId] = useState('');

  // Cancel job state
  const [cancelJobId, setCancelJobId] = useState('');

  // Active job for agent state
  const [activeAgentAddr, setActiveAgentAddr] = useState('');
  const [activeEnabled, setActiveEnabled] = useState(false);

  // Write hooks
  const { writeContract: postJobWrite, data: postJobHash, error: postJobError } = useWriteContract();
  const { isLoading: postJobLoading } = useWaitForTransactionReceipt({ hash: postJobHash });

  const { writeContract: claimJobWrite, data: claimJobHash, error: claimJobError } = useWriteContract();
  const { isLoading: claimJobLoading } = useWaitForTransactionReceipt({ hash: claimJobHash });

  const { writeContract: cancelJobWrite, data: cancelJobHash, error: cancelJobError } = useWriteContract();
  const { isLoading: cancelJobLoading } = useWaitForTransactionReceipt({ hash: cancelJobHash });

  // Read hooks
  const { data: jobsByIdeaData, error: jobsByIdeaError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getJobsByIdea',
    args: viewIdeaId ? [BigInt(viewIdeaId)] : undefined,
    query: { enabled: viewEnabled && !!viewIdeaId },
  });

  const { data: openJobsData, error: openJobsError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getOpenJobsByIdea',
    args: openIdeaId ? [BigInt(openIdeaId)] : undefined,
    query: { enabled: openEnabled && !!openIdeaId },
  });

  const { data: activeJobData, error: activeJobError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getActiveJobForAgent',
    args: activeAgentAddr ? [activeAgentAddr as `0x${string}`] : undefined,
    query: { enabled: activeEnabled && !!activeAgentAddr },
  });

  function handlePostJob() {
    postJobWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'postJob',
      args: [
        BigInt(postIdeaId || '0'),
        postTitle,
        postSpec,
        BigInt(postJobType || '0'),
        parseUnits(postReward || '0', 18),
      ],
    });
  }

  function handleClaimJob() {
    claimJobWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'claimJob',
      args: [BigInt(claimJobId || '0')],
    });
  }

  function handleCancelJob() {
    cancelJobWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'cancelJob',
      args: [BigInt(cancelJobId || '0')],
    });
  }

  function renderJobList(jobs: Job[] | undefined) {
    if (!jobs || jobs.length === 0) return <p>No jobs found.</p>;
    return (
      <ul>
        {jobs.map((job, i) => (
          <li key={i}>
            <strong>Job #{job.jobId.toString()}</strong> &mdash; {job.title}
            <br />
            Status: {jobStatusLabel(job.status)} | Poster: {job.poster} | Claimed By: {job.claimedBy}
            <br />
            Reward: {formatUnits(job.workTokenReward, 18)} wToken
          </li>
        ))}
      </ul>
    );
  }

  const activeJob = activeJobData as Job | undefined;

  return (
    <div className="panel">
      <h2>Jobs Panel</h2>

      {/* Post a Job */}
      <h3>Post a Job</h3>
      <div className="field">
        <label>Idea ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={postIdeaId}
          onChange={(e) => setPostIdeaId(e.target.value)}
          placeholder="1"
        />
      </div>
      <div className="field">
        <label>Title</label>
        <input
          type="text"
          value={postTitle}
          onChange={(e) => setPostTitle(e.target.value)}
          placeholder="Job title"
        />
      </div>
      <div className="field">
        <label>Deliverable Spec (IPFS URI)</label>
        <input
          type="text"
          value={postSpec}
          onChange={(e) => setPostSpec(e.target.value)}
          placeholder="ipfs://..."
        />
      </div>
      <div className="field">
        <label>Job Type</label>
        <input
          type="text"
          inputMode="decimal"
          value={postJobType}
          onChange={(e) => setPostJobType(e.target.value)}
          placeholder="0"
        />
      </div>
      <div className="field">
        <label>Work Token Reward</label>
        <input
          type="text"
          inputMode="decimal"
          value={postReward}
          onChange={(e) => setPostReward(e.target.value)}
          placeholder="100"
        />
      </div>
      <button onClick={handlePostJob} disabled={postJobLoading}>
        {postJobLoading ? 'Posting...' : 'Post Job'}
      </button>
      {postJobHash && <div className="result">Tx: {postJobHash}</div>}
      {postJobError && <div className="error">{postJobError.message}</div>}

      {/* View Jobs by Idea */}
      <h3>View Jobs by Idea</h3>
      <div className="field">
        <label>Idea ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={viewIdeaId}
          onChange={(e) => { setViewIdeaId(e.target.value); setViewEnabled(false); }}
          placeholder="1"
        />
      </div>
      <button onClick={() => setViewEnabled(true)}>View Jobs</button>
      {viewEnabled && renderJobList(jobsByIdeaData as Job[] | undefined)}
      {jobsByIdeaError && <div className="error">{jobsByIdeaError.message}</div>}

      {/* View Open Jobs */}
      <h3>View Open Jobs by Idea</h3>
      <div className="field">
        <label>Idea ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={openIdeaId}
          onChange={(e) => { setOpenIdeaId(e.target.value); setOpenEnabled(false); }}
          placeholder="1"
        />
      </div>
      <button onClick={() => setOpenEnabled(true)}>View Open Jobs</button>
      {openEnabled && renderJobList(openJobsData as Job[] | undefined)}
      {openJobsError && <div className="error">{openJobsError.message}</div>}

      {/* Claim a Job */}
      <h3>Claim a Job</h3>
      <div className="field">
        <label>Job ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={claimJobId}
          onChange={(e) => setClaimJobId(e.target.value)}
          placeholder="1"
        />
      </div>
      <button onClick={handleClaimJob} disabled={claimJobLoading}>
        {claimJobLoading ? 'Claiming...' : 'Claim Job'}
      </button>
      {claimJobHash && <div className="result">Tx: {claimJobHash}</div>}
      {claimJobError && <div className="error">{claimJobError.message}</div>}

      {/* Cancel a Job */}
      <h3>Cancel a Job</h3>
      <div className="field">
        <label>Job ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={cancelJobId}
          onChange={(e) => setCancelJobId(e.target.value)}
          placeholder="1"
        />
      </div>
      <button onClick={handleCancelJob} disabled={cancelJobLoading}>
        {cancelJobLoading ? 'Cancelling...' : 'Cancel Job'}
      </button>
      {cancelJobHash && <div className="result">Tx: {cancelJobHash}</div>}
      {cancelJobError && <div className="error">{cancelJobError.message}</div>}

      {/* Active Job for Agent */}
      <h3>Active Job for Agent</h3>
      <div className="field">
        <label>Agent Wallet</label>
        <input
          type="text"
          value={activeAgentAddr}
          onChange={(e) => { setActiveAgentAddr(e.target.value); setActiveEnabled(false); }}
          placeholder="0x..."
        />
      </div>
      <button onClick={() => setActiveEnabled(true)}>View Active Job</button>
      {activeEnabled && activeJob && (
        <div className="result">
          <p><strong>Job #{activeJob.jobId.toString()}</strong> &mdash; {activeJob.title}</p>
          <p>Status: {jobStatusLabel(activeJob.status)} | Poster: {activeJob.poster} | Claimed By: {activeJob.claimedBy}</p>
          <p>Reward: {formatUnits(activeJob.workTokenReward, 18)} wToken</p>
        </div>
      )}
      {activeEnabled && !activeJob && activeJobData !== undefined && (
        <div className="result">No active job found.</div>
      )}
      {activeJobError && <div className="error">{activeJobError.message}</div>}
    </div>
  );
}
