import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt, useAccount } from 'wagmi';
import { keccak256, toHex, toBytes, parseGwei } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

interface ContextEntry {
  contentHash: string;
  author: string;
  timestamp: bigint;
}

export function ContextPanel() {
  // System context write
  const [sysKey, setSysKey] = useState('');
  const [sysHash, setSysHash] = useState('');

  // Module context write
  const [modId, setModId] = useState('');
  const [modKey, setModKey] = useState('');
  const [modHash, setModHash] = useState('');

  // System context read
  const [readSysKey, setReadSysKey] = useState('');
  const [fetchSys, setFetchSys] = useState(false);

  // Module context read
  const [readModId, setReadModId] = useState('');
  const [readModKey, setReadModKey] = useState('');
  const [fetchMod, setFetchMod] = useState(false);

  // System keys
  const [fetchSysKeys, setFetchSysKeys] = useState(false);

  // Module keys
  const [keysModId, setKeysModId] = useState('');
  const [fetchModKeys, setFetchModKeys] = useState(false);

  const { address } = useAccount();

  // Write: set system context
  const { writeContract: writeSysCtx, data: sysCtxHash, error: sysCtxError } = useWriteContract();
  const { isLoading: sysCtxLoading, isSuccess: sysCtxSuccess } = useWaitForTransactionReceipt({ hash: sysCtxHash });

  // Write: set module context
  const { writeContract: writeModCtx, data: modCtxHash, error: modCtxError } = useWriteContract();
  const { isLoading: modCtxLoading, isSuccess: modCtxSuccess } = useWaitForTransactionReceipt({ hash: modCtxHash });

  // Read: system context history
  const { data: sysHistory, error: sysHistError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getSystemContextHistory',
    args: fetchSys && readSysKey ? [keccak256(toBytes(readSysKey))] : undefined,
    query: { enabled: fetchSys && !!readSysKey },
  });

  // Read: module context history
  const { data: modHistory, error: modHistError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getModuleContextHistory',
    args: fetchMod && readModId && readModKey
      ? [BigInt(readModId), keccak256(toBytes(readModKey))]
      : undefined,
    query: { enabled: fetchMod && !!readModId && !!readModKey },
  });

  // Read: system keys
  const { data: sysKeysData, error: sysKeysError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getSystemKeys',
    query: { enabled: fetchSysKeys },
  });

  // Read: module keys
  const { data: modKeysData, error: modKeysError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getModuleKeys',
    args: fetchModKeys && keysModId ? [BigInt(keysModId)] : undefined,
    query: { enabled: fetchModKeys && !!keysModId },
  });

  function handleSetSystemContext() {
    if (!sysKey || !sysHash) return;
    writeSysCtx({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'setSystemContext',
      args: [keccak256(toBytes(sysKey)), sysHash as `0x${string}`],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleSetModuleContext() {
    if (!modId || !modKey || !modHash) return;
    writeModCtx({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'setModuleContext',
      args: [BigInt(modId), keccak256(toBytes(modKey)), modHash as `0x${string}`],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function renderHistory(entries: ContextEntry[] | undefined) {
    if (!entries || entries.length === 0) return <p>No entries.</p>;
    return (
      <ul style={{ listStyle: 'none', padding: 0 }}>
        {(entries as ContextEntry[]).map((entry, i) => (
          <li key={i} style={{ marginBottom: 8, padding: 8, background: '#f8f8f8', borderRadius: 4 }}>
            <div><strong>#{i}</strong> — {new Date(Number(entry.timestamp) * 1000).toLocaleString()}</div>
            <div style={{ fontSize: 12, color: '#666' }}>Author: {entry.author}</div>
            <div style={{ fontSize: 12, wordBreak: 'break-all' }}>Hash: {entry.contentHash}</div>
          </li>
        ))}
      </ul>
    );
  }

  return (
    <div className="panel">
      <h2>Context Panel</h2>

      {/* Set System Context */}
      <section>
        <h3>Set System Context</h3>
        <div className="field">
          <label>Key (human-readable, will be hashed)</label>
          <input type="text" value={sysKey} onChange={(e) => setSysKey(e.target.value)} placeholder="e.g. protocol-description" />
        </div>
        <div className="field">
          <label>Content Hash (bytes32)</label>
          <input type="text" value={sysHash} onChange={(e) => setSysHash(e.target.value)} placeholder="0x..." />
        </div>
        <button onClick={handleSetSystemContext} disabled={sysCtxLoading}>
          {sysCtxLoading ? 'Writing...' : 'Set System Context'}
        </button>
        {sysCtxHash && <div className="result">Tx: {sysCtxHash}{sysCtxSuccess && ' (confirmed)'}</div>}
        {sysCtxError && <div className="error">{sysCtxError.message}</div>}
      </section>

      {/* Set Module Context */}
      <section>
        <h3>Set Module Context</h3>
        <div className="field">
          <label>Module/Idea ID</label>
          <input type="text" inputMode="decimal" value={modId} onChange={(e) => setModId(e.target.value)} placeholder="1" />
        </div>
        <div className="field">
          <label>Key (human-readable, will be hashed)</label>
          <input type="text" value={modKey} onChange={(e) => setModKey(e.target.value)} placeholder="e.g. deliverable" />
        </div>
        <div className="field">
          <label>Content Hash (bytes32)</label>
          <input type="text" value={modHash} onChange={(e) => setModHash(e.target.value)} placeholder="0x..." />
        </div>
        <button onClick={handleSetModuleContext} disabled={modCtxLoading}>
          {modCtxLoading ? 'Writing...' : 'Set Module Context'}
        </button>
        {modCtxHash && <div className="result">Tx: {modCtxHash}{modCtxSuccess && ' (confirmed)'}</div>}
        {modCtxError && <div className="error">{modCtxError.message}</div>}
      </section>

      {/* Read System Context History */}
      <section>
        <h3>System Context History</h3>
        <div className="field">
          <label>Key (human-readable)</label>
          <input type="text" value={readSysKey} onChange={(e) => { setReadSysKey(e.target.value); setFetchSys(false); }} placeholder="e.g. protocol-description" />
        </div>
        <button onClick={() => setFetchSys(true)}>Fetch History</button>
        {fetchSys && renderHistory(sysHistory as ContextEntry[] | undefined)}
        {sysHistError && <div className="error">{sysHistError.message}</div>}
      </section>

      {/* Read Module Context History */}
      <section>
        <h3>Module Context History</h3>
        <div className="field">
          <label>Module/Idea ID</label>
          <input type="text" inputMode="decimal" value={readModId} onChange={(e) => { setReadModId(e.target.value); setFetchMod(false); }} placeholder="1" />
        </div>
        <div className="field">
          <label>Key (human-readable)</label>
          <input type="text" value={readModKey} onChange={(e) => { setReadModKey(e.target.value); setFetchMod(false); }} placeholder="e.g. deliverable" />
        </div>
        <button onClick={() => setFetchMod(true)}>Fetch History</button>
        {fetchMod && renderHistory(modHistory as ContextEntry[] | undefined)}
        {modHistError && <div className="error">{modHistError.message}</div>}
      </section>

      {/* System Keys */}
      <section>
        <h3>System Keys</h3>
        <button onClick={() => setFetchSysKeys(true)}>Fetch System Keys</button>
        {fetchSysKeys && sysKeysData && (
          <div className="result">
            {(sysKeysData as string[]).length === 0
              ? 'No system keys.'
              : (sysKeysData as string[]).map((k, i) => <div key={i} style={{ fontSize: 12, wordBreak: 'break-all' }}>{k}</div>)}
          </div>
        )}
        {sysKeysError && <div className="error">{sysKeysError.message}</div>}
      </section>

      {/* Module Keys */}
      <section>
        <h3>Module Keys</h3>
        <div className="field">
          <label>Module/Idea ID</label>
          <input type="text" inputMode="decimal" value={keysModId} onChange={(e) => { setKeysModId(e.target.value); setFetchModKeys(false); }} placeholder="1" />
        </div>
        <button onClick={() => setFetchModKeys(true)}>Fetch Module Keys</button>
        {fetchModKeys && modKeysData && (
          <div className="result">
            {(modKeysData as string[]).length === 0
              ? 'No module keys.'
              : (modKeysData as string[]).map((k, i) => <div key={i} style={{ fontSize: 12, wordBreak: 'break-all' }}>{k}</div>)}
          </div>
        )}
        {modKeysError && <div className="error">{modKeysError.message}</div>}
      </section>
    </div>
  );
}
