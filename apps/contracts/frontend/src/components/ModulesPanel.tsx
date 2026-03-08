import { useState } from 'react';
import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { keccak256, toBytes, parseGwei } from 'viem';
import { DIAMOND_ADDRESS } from '../wagmi';
import { IdeaMarketplaceABI } from '../abi';

const KNOWN_MODULES = ['Agent', 'ReservePool', 'JobBoard', 'WorkMarketplace'];

export function ModulesPanel() {
  // Install module
  const [installAddr, setInstallAddr] = useState('');

  // Uninstall module
  const [uninstallName, setUninstallName] = useState('');

  // View module
  const [viewModuleName, setViewModuleName] = useState('');
  const [fetchModule, setFetchModule] = useState(false);

  // Check installed
  const [checkModuleName, setCheckModuleName] = useState('');
  const [fetchInstalled, setFetchInstalled] = useState(false);

  // Installer management
  const [installerAddr, setInstallerAddr] = useState('');
  const [checkInstallerAddr, setCheckInstallerAddr] = useState('');
  const [fetchInstaller, setFetchInstaller] = useState(false);

  // Install module tx
  const { writeContract: installWrite, data: installHash, error: installError } = useWriteContract();
  const { isLoading: installLoading, isSuccess: installSuccess } = useWaitForTransactionReceipt({ hash: installHash });

  // Uninstall module tx
  const { writeContract: uninstallWrite, data: uninstallHash, error: uninstallError } = useWriteContract();
  const { isLoading: uninstallLoading, isSuccess: uninstallSuccess } = useWaitForTransactionReceipt({ hash: uninstallHash });

  // Add installer tx
  const { writeContract: addInstallerWrite, data: addInstallerHash, error: addInstallerError } = useWriteContract();
  const { isLoading: addInstallerLoading } = useWaitForTransactionReceipt({ hash: addInstallerHash });

  // Remove installer tx
  const { writeContract: removeInstallerWrite, data: removeInstallerHash, error: removeInstallerError } = useWriteContract();
  const { isLoading: removeInstallerLoading } = useWaitForTransactionReceipt({ hash: removeInstallerHash });

  // Read: installed module IDs
  const [fetchIds, setFetchIds] = useState(false);
  const { data: installedIds, error: installedIdsError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getInstalledModuleIds',
    query: { enabled: fetchIds },
  });

  // Read: module details
  const { data: moduleData, error: moduleError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'getModule',
    args: fetchModule && viewModuleName ? [keccak256(toBytes(viewModuleName))] : undefined,
    query: { enabled: fetchModule && !!viewModuleName },
  });

  // Read: is module installed
  const { data: isInstalled, error: isInstalledError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'isModuleInstalled',
    args: fetchInstalled && checkModuleName ? [keccak256(toBytes(checkModuleName))] : undefined,
    query: { enabled: fetchInstalled && !!checkModuleName },
  });

  // Read: is module installer
  const { data: isInstallerData, error: isInstallerError } = useReadContract({
    address: DIAMOND_ADDRESS,
    abi: IdeaMarketplaceABI,
    functionName: 'isModuleInstaller',
    args: fetchInstaller && checkInstallerAddr ? [checkInstallerAddr as `0x${string}`] : undefined,
    query: { enabled: fetchInstaller && !!checkInstallerAddr },
  });

  function handleInstall() {
    if (!installAddr) return;
    installWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'installModule',
      args: [installAddr as `0x${string}`],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleUninstall() {
    if (!uninstallName) return;
    uninstallWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'uninstallModule',
      args: [keccak256(toBytes(uninstallName))],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleAddInstaller() {
    if (!installerAddr) return;
    addInstallerWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'addModuleInstaller',
      args: [installerAddr as `0x${string}`],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  function handleRemoveInstaller() {
    if (!installerAddr) return;
    removeInstallerWrite({
      address: DIAMOND_ADDRESS,
      abi: IdeaMarketplaceABI,
      functionName: 'removeModuleInstaller',
      args: [installerAddr as `0x${string}`],
      maxFeePerGas: parseGwei('0.1'),
      maxPriorityFeePerGas: parseGwei('0.001'),
    });
  }

  const mod = moduleData as [string, string, string, string, bigint, boolean] | undefined;

  return (
    <div className="panel">
      <h2>Modules Panel</h2>

      {/* Installed Modules */}
      <section>
        <h3>Installed Modules</h3>
        <button onClick={() => setFetchIds(true)}>Fetch Installed Module IDs</button>
        {fetchIds && installedIds && (
          <div className="result">
            {(installedIds as string[]).length === 0 ? (
              <p>No modules installed.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0 }}>
                {(installedIds as string[]).map((id, i) => (
                  <li key={i} style={{ fontSize: 12, wordBreak: 'break-all', marginBottom: 4 }}>
                    {id}
                    {KNOWN_MODULES.map((name) => keccak256(toBytes(name)) === id ? ` (${name})` : '').join('')}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
        {installedIdsError && <div className="error">{installedIdsError.message}</div>}
      </section>

      {/* Check if Module Installed */}
      <section>
        <h3>Check Module Status</h3>
        <div className="field">
          <label>Module Name</label>
          <input type="text" value={checkModuleName} onChange={(e) => { setCheckModuleName(e.target.value); setFetchInstalled(false); }} placeholder="e.g. Agent" />
        </div>
        <button onClick={() => setFetchInstalled(true)}>Check</button>
        {fetchInstalled && isInstalled !== undefined && (
          <div className="result">
            {checkModuleName}: {isInstalled ? 'Installed' : 'Not installed'}
          </div>
        )}
        {isInstalledError && <div className="error">{isInstalledError.message}</div>}
      </section>

      {/* View Module Details */}
      <section>
        <h3>View Module Details</h3>
        <div className="field">
          <label>Module Name</label>
          <input type="text" value={viewModuleName} onChange={(e) => { setViewModuleName(e.target.value); setFetchModule(false); }} placeholder="e.g. Agent" />
        </div>
        <button onClick={() => setFetchModule(true)}>Fetch</button>
        {fetchModule && mod && (
          <div className="result">
            <p><strong>Name:</strong> {mod[0]}</p>
            <p><strong>Version:</strong> {mod[1]}</p>
            <p><strong>Installer Contract:</strong> {mod[2]}</p>
            <p><strong>Installed By:</strong> {mod[3]}</p>
            <p><strong>Installed At:</strong> {new Date(Number(mod[4]) * 1000).toLocaleString()}</p>
            <p><strong>Active:</strong> {String(mod[5])}</p>
          </div>
        )}
        {moduleError && <div className="error">{moduleError.message}</div>}
      </section>

      {/* Install Module */}
      <section>
        <h3>Install Module</h3>
        <div className="field">
          <label>Module Installer Contract Address</label>
          <input type="text" value={installAddr} onChange={(e) => setInstallAddr(e.target.value)} placeholder="0x..." />
        </div>
        <button onClick={handleInstall} disabled={installLoading}>
          {installLoading ? 'Installing...' : 'Install Module'}
        </button>
        {installHash && <div className="result">Tx: {installHash}{installSuccess && ' (confirmed)'}</div>}
        {installError && <div className="error">{installError.message}</div>}
      </section>

      {/* Uninstall Module */}
      <section>
        <h3>Uninstall Module</h3>
        <div className="field">
          <label>Module Name</label>
          <input type="text" value={uninstallName} onChange={(e) => setUninstallName(e.target.value)} placeholder="e.g. Agent" />
        </div>
        <button onClick={handleUninstall} disabled={uninstallLoading}>
          {uninstallLoading ? 'Uninstalling...' : 'Uninstall Module'}
        </button>
        {uninstallHash && <div className="result">Tx: {uninstallHash}{uninstallSuccess && ' (confirmed)'}</div>}
        {uninstallError && <div className="error">{uninstallError.message}</div>}
      </section>

      {/* Installer Management */}
      <section>
        <h3>Installer Management</h3>
        <div className="field">
          <label>Installer Address</label>
          <input type="text" value={installerAddr} onChange={(e) => setInstallerAddr(e.target.value)} placeholder="0x..." />
        </div>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <button onClick={handleAddInstaller} disabled={addInstallerLoading}>
            {addInstallerLoading ? 'Adding...' : 'Add Installer'}
          </button>
          <button onClick={handleRemoveInstaller} disabled={removeInstallerLoading}>
            {removeInstallerLoading ? 'Removing...' : 'Remove Installer'}
          </button>
        </div>
        {addInstallerHash && <div className="result">Add Tx: {addInstallerHash}</div>}
        {addInstallerError && <div className="error">{addInstallerError.message}</div>}
        {removeInstallerHash && <div className="result">Remove Tx: {removeInstallerHash}</div>}
        {removeInstallerError && <div className="error">{removeInstallerError.message}</div>}

        <div className="field" style={{ marginTop: 12 }}>
          <label>Check if Address is Installer</label>
          <input type="text" value={checkInstallerAddr} onChange={(e) => { setCheckInstallerAddr(e.target.value); setFetchInstaller(false); }} placeholder="0x..." />
        </div>
        <button onClick={() => setFetchInstaller(true)}>Check</button>
        {fetchInstaller && isInstallerData !== undefined && (
          <div className="result">{isInstallerData ? 'Is an authorized installer' : 'Not an installer'}</div>
        )}
        {isInstallerError && <div className="error">{isInstallerError.message}</div>}
      </section>
    </div>
  );
}
