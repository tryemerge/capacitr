import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { IdeasPanel } from './components/IdeasPanel';
import { TradePanel } from './components/TradePanel';
import { JobsPanel } from './components/JobsPanel';
import { WorkPanel } from './components/WorkPanel';
import { PollsPanel } from './components/PollsPanel';
import { RedeemPanel } from './components/RedeemPanel';
import { AgentPanel } from './components/AgentPanel';

function App() {
  const [tab, setTab] = useState('ideas');
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  const tabs = ['ideas', 'trade', 'agent', 'jobs', 'work', 'polls', 'redeem'];

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: 20, fontFamily: 'monospace' }}>
      <h1>Idea Marketplace</h1>

      {/* Wallet */}
      <div style={{ marginBottom: 20, padding: 12, background: '#f5f5f5', borderRadius: 8 }}>
        {isConnected ? (
          <div>
            <span>Connected: {address?.slice(0, 6)}...{address?.slice(-4)}</span>
            <button onClick={() => disconnect()} style={{ marginLeft: 12 }}>Disconnect</button>
          </div>
        ) : (
          <div>
            {connectors.map((connector) => (
              <button key={connector.uid} onClick={() => connect({ connector })}>
                Connect {connector.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {tabs.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 16px',
              background: tab === t ? '#333' : '#eee',
              color: tab === t ? '#fff' : '#333',
              border: 'none',
              borderRadius: 4,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* Panels */}
      {tab === 'ideas' && <IdeasPanel />}
      {tab === 'trade' && <TradePanel />}
      {tab === 'agent' && <AgentPanel />}
      {tab === 'jobs' && <JobsPanel />}
      {tab === 'work' && <WorkPanel />}
      {tab === 'polls' && <PollsPanel />}
      {tab === 'redeem' && <RedeemPanel />}
    </div>
  );
}

export default App;
