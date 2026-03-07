import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { parseUnits, formatUnits } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

export function RedeemPanel() {
  // View reserve pool
  const [reserveIdeaId, setReserveIdeaId] = useState('');
  const [fetchReserve, setFetchReserve] = useState(false);

  // View redemption rate
  const [rateIdeaId, setRateIdeaId] = useState('');
  const [fetchRate, setFetchRate] = useState(false);

  // Redeem
  const [redeemIdeaId, setRedeemIdeaId] = useState('');
  const [redeemAmount, setRedeemAmount] = useState('');

  // Read reserve pool
  const { data: reserveData, error: reserveError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getReservePool',
    args: fetchReserve && reserveIdeaId ? [BigInt(reserveIdeaId)] : undefined,
    query: { enabled: fetchReserve && !!reserveIdeaId },
  });

  // Read redemption rate
  const { data: rateData, error: rateError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getRedemptionRate',
    args: fetchRate && rateIdeaId ? [BigInt(rateIdeaId)] : undefined,
    query: { enabled: fetchRate && !!rateIdeaId },
  });

  // Redeem tx
  const { writeContract: redeem, data: redeemHash, error: redeemError } = useWriteContract();
  const { isLoading: redeemLoading, isSuccess: redeemSuccess } = useWaitForTransactionReceipt({ hash: redeemHash });

  function handleRedeem(e: React.FormEvent) {
    e.preventDefault();
    redeem({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'redeem',
      args: [BigInt(redeemIdeaId), parseUnits(redeemAmount, 18)],
    });
  }

  return (
    <div className="panel">
      <h2>Redeem Module</h2>

      <h3>View Derivative Pool</h3>
      <div className="field">
        <label>Idea ID</label>
        <input type="text" inputMode="decimal" value={reserveIdeaId} onChange={(e) => { setReserveIdeaId(e.target.value); setFetchReserve(false); }} />
      </div>
      <button onClick={() => setFetchReserve(true)}>Fetch</button>
      {reserveData && (
        <div className="result">
          <p><strong>ideaTokenBalance:</strong> {formatUnits((reserveData as any).ideaTokenBalance, 18)}</p>
          <p><strong>totalWorkTokensMinted:</strong> {formatUnits((reserveData as any).totalWorkTokensMinted, 18)}</p>
          <p><strong>totalRedeemed:</strong> {formatUnits((reserveData as any).totalRedeemed, 18)}</p>
        </div>
      )}
      {reserveError && <div className="error">{reserveError.message}</div>}

      <h3>View Redemption Rate</h3>
      <div className="field">
        <label>Idea ID</label>
        <input type="text" inputMode="decimal" value={rateIdeaId} onChange={(e) => { setRateIdeaId(e.target.value); setFetchRate(false); }} />
      </div>
      <button onClick={() => setFetchRate(true)}>Fetch</button>
      {rateData !== undefined && (
        <div className="result">
          {formatUnits(rateData as bigint, 18)} idea tokens per 1 work token
        </div>
      )}
      {rateError && <div className="error">{rateError.message}</div>}

      <h3>Redeem Work Tokens</h3>
      <form onSubmit={handleRedeem}>
        <div className="field">
          <label>Idea ID</label>
          <input type="text" inputMode="decimal" value={redeemIdeaId} onChange={(e) => setRedeemIdeaId(e.target.value)} />
        </div>
        <div className="field">
          <label>Work Token Amount</label>
          <input type="text" inputMode="decimal" value={redeemAmount} onChange={(e) => setRedeemAmount(e.target.value)} />
        </div>
        <button type="submit" disabled={redeemLoading}>
          {redeemLoading ? 'Redeeming...' : 'Redeem'}
        </button>
      </form>
      {redeemHash && <div className="result">Tx: {redeemHash}{redeemSuccess && ' (confirmed)'}</div>}
      {redeemError && <div className="error">{redeemError.message}</div>}
    </div>
  );
}
