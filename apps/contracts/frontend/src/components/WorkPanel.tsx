import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

export function WorkPanel() {
  // Submit work state
  const [submitJobId, setSubmitJobId] = useState('');
  const [deliverableURI, setDeliverableURI] = useState('');
  const [deliverableHash, setDeliverableHash] = useState('');
  const [contextProof, setContextProof] = useState('');

  // View submission by ID state
  const [viewSubmissionId, setViewSubmissionId] = useState('');
  const [fetchById, setFetchById] = useState(false);

  // View submission by job state
  const [viewJobId, setViewJobId] = useState('');
  const [fetchByJob, setFetchByJob] = useState(false);

  // Submit work
  const { writeContract: submitWork, data: submitHash, error: submitError } = useWriteContract();
  const { isLoading: submitLoading, isSuccess: submitSuccess } = useWaitForTransactionReceipt({ hash: submitHash });

  // Read submission by ID
  const { data: submissionById, error: subByIdError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getSubmission',
    args: fetchById && viewSubmissionId ? [BigInt(viewSubmissionId)] : undefined,
    query: { enabled: fetchById && !!viewSubmissionId },
  });

  // Read submission by job
  const { data: submissionByJob, error: subByJobError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getSubmissionByJob',
    args: fetchByJob && viewJobId ? [BigInt(viewJobId)] : undefined,
    query: { enabled: fetchByJob && !!viewJobId },
  });

  function handleSubmitWork(e: React.FormEvent) {
    e.preventDefault();
    submitWork({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'submitWork',
      args: [BigInt(submitJobId), deliverableURI, deliverableHash as `0x${string}`, contextProof],
    });
  }

  function renderSubmission(data: any) {
    if (!data) return null;
    return (
      <div className="result">
        <p><strong>submissionId:</strong> {data.submissionId?.toString()}</p>
        <p><strong>jobId:</strong> {data.jobId?.toString()}</p>
        <p><strong>ideaId:</strong> {data.ideaId?.toString()}</p>
        <p><strong>agent:</strong> {data.agent}</p>
        <p><strong>deliverableHash:</strong> {data.deliverableHash}</p>
        <p><strong>deliverableURI:</strong> {data.deliverableURI}</p>
        <p><strong>contextProof:</strong> {data.contextProof}</p>
        <p><strong>submittedAt:</strong> {new Date(Number(data.submittedAt) * 1000).toLocaleString()}</p>
        <p><strong>pollId:</strong> {data.pollId?.toString()}</p>
      </div>
    );
  }

  return (
    <div className="panel">
      <h2>Work Panel</h2>

      <h3>Submit Work</h3>
      <form onSubmit={handleSubmitWork}>
        <div className="field">
          <label>Job ID</label>
          <input type="text" inputMode="decimal" value={submitJobId} onChange={(e) => setSubmitJobId(e.target.value)} />
        </div>
        <div className="field">
          <label>Deliverable URI</label>
          <input type="text" value={deliverableURI} onChange={(e) => setDeliverableURI(e.target.value)} />
        </div>
        <div className="field">
          <label>Deliverable Hash (bytes32)</label>
          <input type="text" value={deliverableHash} onChange={(e) => setDeliverableHash(e.target.value)} />
        </div>
        <div className="field">
          <label>Context Proof</label>
          <input type="text" value={contextProof} onChange={(e) => setContextProof(e.target.value)} />
        </div>
        <button type="submit" disabled={submitLoading}>
          {submitLoading ? 'Submitting...' : 'Submit Work'}
        </button>
      </form>
      {submitHash && <div className="result">Tx: {submitHash}{submitSuccess && ' (confirmed)'}</div>}
      {submitError && <div className="error">{submitError.message}</div>}

      <h3>View Submission by ID</h3>
      <div className="field">
        <label>Submission ID</label>
        <input type="text" inputMode="decimal" value={viewSubmissionId} onChange={(e) => { setViewSubmissionId(e.target.value); setFetchById(false); }} />
      </div>
      <button onClick={() => setFetchById(true)}>Fetch</button>
      {submissionById && renderSubmission(submissionById)}
      {subByIdError && <div className="error">{subByIdError.message}</div>}

      <h3>View Submission by Job</h3>
      <div className="field">
        <label>Job ID</label>
        <input type="text" inputMode="decimal" value={viewJobId} onChange={(e) => { setViewJobId(e.target.value); setFetchByJob(false); }} />
      </div>
      <button onClick={() => setFetchByJob(true)}>Fetch</button>
      {submissionByJob && renderSubmission(submissionByJob)}
      {subByJobError && <div className="error">{subByJobError.message}</div>}
    </div>
  );
}
