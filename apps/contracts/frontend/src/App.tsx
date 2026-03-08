import { useState } from 'react';
import { useAccount, useConnect, useDisconnect } from 'wagmi';
import { IdeasPanel } from './components/IdeasPanel';
import { TradePanel } from './components/TradePanel';
import { ContextPanel } from './components/ContextPanel';
import { ModulesPanel } from './components/ModulesPanel';
import { AgentPanel } from './components/AgentPanel';
import { JobsPanel } from './components/JobsPanel';
import { WorkPanel } from './components/WorkPanel';
import { PollsPanel } from './components/PollsPanel';
import { RedeemPanel } from './components/RedeemPanel';

type Tab = 'ideas' | 'trade' | 'context' | 'modules' | 'agent' | 'jobs' | 'work' | 'polls' | 'redeem';

const coreTabs: Tab[] = ['ideas', 'trade', 'context', 'modules'];
const moduleTabs: Tab[] = ['agent', 'jobs', 'work', 'polls', 'redeem'];

function App() {
  const [tab, setTab] = useState<Tab>('ideas');
  const { address, isConnected } = useAccount();
  const { connect, connectors } = useConnect();
  const { disconnect } = useDisconnect();

  function renderTab(t: Tab, active: Tab) {
    return (
      <button
        key={t}
        onClick={() => setTab(t)}
        style={{
          padding: '8px 16px',
          background: active === t ? '#333' : '#eee',
          color: active === t ? '#fff' : '#333',
          border: 'none',
          borderRadius: 4,
          cursor: 'pointer',
          textTransform: 'capitalize',
        }}
      >
        {t}
      </button>
    );
  }

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

      {/* Core Tabs */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Core</span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 12, flexWrap: 'wrap' }}>
        {coreTabs.map((t) => renderTab(t, tab))}
      </div>

      {/* Module Tabs */}
      <div style={{ marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: '#999', textTransform: 'uppercase', letterSpacing: 1 }}>Modules</span>
      </div>
      <div style={{ display: 'flex', gap: 4, marginBottom: 20, flexWrap: 'wrap' }}>
        {moduleTabs.map((t) => renderTab(t, tab))}
      </div>

      {/* Panels */}
      {tab === 'ideas' && <IdeasPanel />}
      {tab === 'trade' && <TradePanel />}
      {tab === 'context' && <ContextPanel />}
      {tab === 'modules' && <ModulesPanel />}
      {tab === 'agent' && <AgentPanel />}
      {tab === 'jobs' && <JobsPanel />}
      {tab === 'work' && <WorkPanel />}
      {tab === 'polls' && <PollsPanel />}
      {tab === 'redeem' && <RedeemPanel />}
    </div>
  );
}

export default App;
