import { useState, useEffect } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { parseEther, formatEther, parseUnits, formatUnits, erc20Abi, maxUint256 } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

export function TradePanel() {
  const [ideaId, setIdeaId] = useState('');
  const [buyEthAmount, setBuyEthAmount] = useState('');
  const [buyMinTokens, setBuyMinTokens] = useState('');
  const [sellTokenAmount, setSellTokenAmount] = useState('');
  const [sellMinEth, setSellMinEth] = useState('');
  const [quoteBuyEth, setQuoteBuyEth] = useState('');
  const [quoteSellTokens, setQuoteSellTokens] = useState('');

  const [sellStep, setSellStep] = useState<'idle' | 'approving' | 'selling'>('idle');
  const { address } = useAccount();
  const ideaIdBigInt = ideaId ? BigInt(ideaId) : undefined;

  // Read: current price
  const {
    data: price,
    isLoading: priceLoading,
    error: priceError,
    refetch: refetchPrice,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getPrice',
    args: ideaIdBigInt !== undefined ? [ideaIdBigInt] : undefined,
    query: { enabled: ideaIdBigInt !== undefined },
  });

  // Read: buy quote
  const {
    data: buyQuote,
    isLoading: buyQuoteLoading,
    error: buyQuoteError,
    refetch: refetchBuyQuote,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getQuoteBuy',
    args:
      ideaIdBigInt !== undefined && quoteBuyEth
        ? [ideaIdBigInt, parseEther(quoteBuyEth)]
        : undefined,
    query: { enabled: ideaIdBigInt !== undefined && !!quoteBuyEth },
  });

  // Read: sell quote
  const {
    data: sellQuote,
    isLoading: sellQuoteLoading,
    error: sellQuoteError,
    refetch: refetchSellQuote,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getQuoteSell',
    args:
      ideaIdBigInt !== undefined && quoteSellTokens
        ? [ideaIdBigInt, parseUnits(quoteSellTokens, 18)]
        : undefined,
    query: { enabled: ideaIdBigInt !== undefined && !!quoteSellTokens },
  });

  // Read: curve config
  const {
    data: curveConfig,
    isLoading: curveLoading,
    error: curveError,
    refetch: refetchCurve,
  } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getCurveConfig',
    args: ideaIdBigInt !== undefined ? [ideaIdBigInt] : undefined,
    query: { enabled: false },
  });

  // Read: idea data (for token address)
  const { data: ideaData } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getIdea',
    args: ideaIdBigInt !== undefined ? [ideaIdBigInt] : undefined,
    query: { enabled: ideaIdBigInt !== undefined },
  });

  const ideaTokenAddress = (ideaData as { ideaToken: `0x${string}` })?.ideaToken as `0x${string}` | undefined;

  // Read: current allowance
  const {
    refetch: refetchAllowance,
  } = useReadContract({
    address: ideaTokenAddress,
    abi: erc20Abi,
    functionName: 'allowance',
    args: address && ideaTokenAddress ? [address, DIAMOND_ADDRESS] : undefined,
    query: { enabled: !!address && !!ideaTokenAddress },
  });

  // Write: approve
  const {
    writeContract: writeApprove,
    data: approveTxHash,
    isPending: isApproving,
    error: approveError,
  } = useWriteContract();

  const {
    isLoading: approveConfirming,
    isSuccess: approveConfirmed,
  } = useWaitForTransactionReceipt({ hash: approveTxHash });

  // Write: buy
  const {
    writeContract: writeBuy,
    data: buyTxHash,
    isPending: isBuying,
    error: buyError,
  } = useWriteContract();

  const {
    isLoading: buyConfirming,
    isSuccess: buyConfirmed,
    error: buyConfirmError,
  } = useWaitForTransactionReceipt({ hash: buyTxHash });

  // Write: sell
  const {
    writeContract: writeSell,
    data: sellTxHash,
    isPending: isSelling,
    error: sellError,
  } = useWriteContract();

  const {
    isLoading: sellConfirming,
    isSuccess: sellConfirmed,
    error: sellConfirmError,
  } = useWaitForTransactionReceipt({ hash: sellTxHash });

  function handleBuy() {
    if (ideaIdBigInt === undefined || !buyEthAmount || !buyMinTokens) return;
    writeBuy({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'buy',
      args: [ideaIdBigInt, parseUnits(buyMinTokens, 18)],
      value: parseEther(buyEthAmount),
    });
  }

  async function handleSell() {
    if (ideaIdBigInt === undefined || !sellTokenAmount || !sellMinEth || !ideaTokenAddress) return;
    const amount = parseUnits(sellTokenAmount, 18);

    // Refetch allowance to get fresh value before deciding
    const { data: freshAllowance } = await refetchAllowance();
    const currentAllowance = (freshAllowance as bigint) ?? 0n;

    if (currentAllowance >= amount) {
      // Allowance sufficient — skip approval, sell directly
      setSellStep('selling');
      writeSell({
        address: DIAMOND_ADDRESS,
        abi: IdeaMarketplaceABI,
        functionName: 'sell',
        args: [ideaIdBigInt, amount, parseEther(sellMinEth)],
      });
    } else {
      // Need approval first
      setSellStep('approving');
      writeApprove({
        address: ideaTokenAddress,
        abi: erc20Abi,
        functionName: 'approve',
        args: [DIAMOND_ADDRESS, maxUint256],
      });
    }
  }

  // After approve confirms, execute the sell
  useEffect(() => {
    if (approveConfirmed && sellStep === 'approving') {
      setSellStep('selling');
      refetchAllowance();
      if (ideaIdBigInt !== undefined && sellTokenAmount && sellMinEth) {
        writeSell({
          address: DIAMOND_ADDRESS,
          abi: IdeaMarketplaceABI,
          functionName: 'sell',
          args: [ideaIdBigInt, parseUnits(sellTokenAmount, 18), parseEther(sellMinEth)],
        });
      }
    }
  }, [approveConfirmed]);

  return (
    <div className="panel">
      <h2>Trade Panel</h2>

      {/* Idea ID selector */}
      <div className="field">
        <label>Idea ID</label>
        <input
          type="text"
          inputMode="decimal"
          value={ideaId}
          onChange={(e) => setIdeaId(e.target.value)}
          placeholder="0"
        />
      </div>

      {/* Current Price */}
      <section>
        <h3>Current Price</h3>
        <button onClick={() => refetchPrice()} disabled={priceLoading || ideaIdBigInt === undefined}>
          {priceLoading ? 'Loading...' : 'Get Price'}
        </button>
        {priceError && <div className="error">Error: {priceError.message}</div>}
        {price !== undefined && (
          <div className="result">Price: {formatEther(price as bigint)} ETH</div>
        )}
      </section>

      {/* Buy Quote */}
      <section>
        <h3>Buy Quote</h3>
        <div className="field">
          <label>ETH Amount</label>
          <input
            type="text"
            inputMode="decimal"
            value={quoteBuyEth}
            onChange={(e) => setQuoteBuyEth(e.target.value)}
            placeholder="0.1"
          />
        </div>
        <button
          onClick={() => refetchBuyQuote()}
          disabled={buyQuoteLoading || ideaIdBigInt === undefined || !quoteBuyEth}
        >
          {buyQuoteLoading ? 'Loading...' : 'Get Buy Quote'}
        </button>
        {buyQuoteError && <div className="error">Error: {buyQuoteError.message}</div>}
        {buyQuote !== undefined && (
          <div className="result">Expected tokens: {formatUnits(buyQuote as bigint, 18)}</div>
        )}
      </section>

      {/* Sell Quote */}
      <section>
        <h3>Sell Quote</h3>
        <div className="field">
          <label>Token Amount</label>
          <input
            type="text"
            inputMode="decimal"
            value={quoteSellTokens}
            onChange={(e) => setQuoteSellTokens(e.target.value)}
            placeholder="1000"
          />
        </div>
        <button
          onClick={() => refetchSellQuote()}
          disabled={sellQuoteLoading || ideaIdBigInt === undefined || !quoteSellTokens}
        >
          {sellQuoteLoading ? 'Loading...' : 'Get Sell Quote'}
        </button>
        {sellQuoteError && <div className="error">Error: {sellQuoteError.message}</div>}
        {sellQuote !== undefined && (
          <div className="result">Expected ETH: {formatEther(sellQuote as bigint)}</div>
        )}
      </section>

      {/* Buy */}
      <section>
        <h3>Buy Tokens</h3>
        <div className="field">
          <label>ETH to Spend</label>
          <input
            type="text"
            inputMode="decimal"
            value={buyEthAmount}
            onChange={(e) => setBuyEthAmount(e.target.value)}
            placeholder="0.1"
          />
        </div>
        <div className="field">
          <label>Min Tokens Out</label>
          <input
            type="text"
            inputMode="decimal"
            value={buyMinTokens}
            onChange={(e) => setBuyMinTokens(e.target.value)}
            placeholder="0"
          />
        </div>
        <button onClick={handleBuy} disabled={isBuying || buyConfirming || ideaIdBigInt === undefined}>
          {isBuying ? 'Sending...' : buyConfirming ? 'Confirming...' : 'Buy'}
        </button>
        {buyError && <div className="error">Error: {buyError.message}</div>}
        {buyConfirmError && <div className="error">Error: {buyConfirmError.message}</div>}
        {buyTxHash && (
          <div className="result">
            Tx hash: {buyTxHash}
            {buyConfirmed && ' (confirmed)'}
          </div>
        )}
      </section>

      {/* Sell */}
      <section>
        <h3>Sell Tokens</h3>
        <div className="field">
          <label>Token Amount</label>
          <input
            type="text"
            inputMode="decimal"
            value={sellTokenAmount}
            onChange={(e) => setSellTokenAmount(e.target.value)}
            placeholder="1000"
          />
        </div>
        <div className="field">
          <label>Min ETH Out</label>
          <input
            type="text"
            inputMode="decimal"
            value={sellMinEth}
            onChange={(e) => setSellMinEth(e.target.value)}
            placeholder="0"
          />
        </div>
        <button onClick={handleSell} disabled={isApproving || approveConfirming || isSelling || sellConfirming || ideaIdBigInt === undefined}>
          {isApproving || approveConfirming ? 'Approving...' : isSelling ? 'Sending...' : sellConfirming ? 'Confirming...' : 'Sell'}
        </button>
        {approveError && <div className="error">Approve error: {approveError.message}</div>}
        {sellError && <div className="error">Error: {sellError.message}</div>}
        {sellConfirmError && <div className="error">Error: {sellConfirmError.message}</div>}
        {approveTxHash && sellStep === 'approving' && (
          <div className="result">Approve tx: {approveTxHash}</div>
        )}
        {sellTxHash && (
          <div className="result">
            Sell tx: {sellTxHash}
            {sellConfirmed && ' (confirmed)'}
          </div>
        )}
      </section>

      {/* Curve Config */}
      <section>
        <h3>Curve Config</h3>
        <button
          onClick={() => refetchCurve()}
          disabled={curveLoading || ideaIdBigInt === undefined}
        >
          {curveLoading ? 'Loading...' : 'View Curve Config'}
        </button>
        {curveError && <div className="error">Error: {curveError.message}</div>}
        {curveConfig && (
          <div className="result">
            <pre>{JSON.stringify(curveConfig, (_k, v) => (typeof v === 'bigint' ? v.toString() : v), 2)}</pre>
          </div>
        )}
      </section>
    </div>
  );
}
