"use client";

import { useState, useRef, useEffect } from "react";
import { usePrivy, useLinkAccount } from "@privy-io/react-auth";
import { useAuth } from "./AuthProvider";

type LinkingAccount =
  | "email"
  | "phone"
  | "wallet"
  | "google"
  | "discord"
  | "twitter"
  | "github"
  | "farcaster"
  | null;

type Variant = "dark" | "light";

const themes = {
  dark: {
    dialog: "bg-zinc-900 border-zinc-700 backdrop:bg-black/60",
    headerBorder: "border-zinc-800",
    title: "text-zinc-100",
    closeBtn: "text-zinc-500 hover:text-zinc-300",
    label: "text-zinc-400",
    idBadge: "text-zinc-500 bg-zinc-800",
    divider: "border-zinc-800",
    sectionTitle: "text-zinc-300",
    row: "bg-zinc-800/50 hover:bg-zinc-800",
    rowLabel: "text-zinc-500",
    rowValue: "text-zinc-200",
    copyBtn: "text-zinc-500 hover:text-zinc-300",
    copiedText: "text-emerald-400",
    unlinkBtn: "text-zinc-600 hover:text-red-400",
    linkBtn: "border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100",
    hint: "text-zinc-600",
    empty: "text-zinc-500",
    trigger: "text-zinc-500 hover:text-zinc-300",
  },
  light: {
    dialog: "bg-white border-gray-200 backdrop:bg-black/40",
    headerBorder: "border-gray-100",
    title: "text-gray-900",
    closeBtn: "text-gray-400 hover:text-gray-600",
    label: "text-gray-500",
    idBadge: "text-gray-400 bg-gray-50",
    divider: "border-gray-100",
    sectionTitle: "text-gray-700",
    row: "bg-gray-50 hover:bg-gray-100",
    rowLabel: "text-gray-400",
    rowValue: "text-gray-700",
    copyBtn: "text-gray-400 hover:text-gray-600",
    copiedText: "text-emerald-500",
    unlinkBtn: "text-gray-300 hover:text-red-400",
    linkBtn: "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-800",
    hint: "text-gray-400",
    empty: "text-gray-400",
    trigger: "text-gray-400 hover:text-gray-600",
  },
} as const;

function formatAddress(address: string) {
  if (address.length > 16) {
    return `${address.slice(0, 8)}...${address.slice(-6)}`;
  }
  return address;
}

export function AccountSettingsModal({ variant = "dark" }: { variant?: Variant }) {
  const { ready, authenticated } = useAuth();
  if (!ready || !authenticated) return null;
  return <AccountSettingsModalInner variant={variant} />;
}

function AccountSettingsModalInner({ variant }: { variant: Variant }) {
  const t = themes[variant];

  const {
    user,
    ready,
    authenticated,
    unlinkEmail,
    unlinkPhone,
    unlinkWallet,
    unlinkGoogle,
    unlinkDiscord,
    unlinkTwitter,
    unlinkGithub,
    unlinkFarcaster,
  } = usePrivy();

  const [open, setOpen] = useState(false);
  const [linking, setLinking] = useState<LinkingAccount>(null);
  const [unlinking, setUnlinking] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);

  const {
    linkEmail,
    linkPhone,
    linkWallet,
    linkGoogle,
    linkDiscord,
    linkTwitter,
    linkGithub,
    linkFarcaster,
  } = useLinkAccount({
    onSuccess: () => setLinking(null),
    onError: (error) => {
      console.error("Failed to link account:", error);
      setLinking(null);
    },
  });

  useEffect(() => {
    if (open) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [open]);

  if (!ready || !authenticated || !user) return null;

  const linkedAccounts = user.linkedAccounts || [];
  const emails = linkedAccounts.filter((a) => a.type === "email");
  const phones = linkedAccounts.filter((a) => a.type === "phone");
  const wallets = linkedAccounts.filter(
    (a) => a.type === "wallet" || a.type === "smart_wallet",
  );
  const google = linkedAccounts.filter((a) => a.type === "google_oauth");
  const discord = linkedAccounts.filter((a) => a.type === "discord_oauth");
  const twitter = linkedAccounts.filter((a) => a.type === "twitter_oauth");
  const github = linkedAccounts.filter((a) => a.type === "github_oauth");
  const farcaster = linkedAccounts.filter((a) => a.type === "farcaster");

  function copyToClipboard(text: string, id: string) {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  }

  async function handleUnlink(accountType: string, address?: string) {
    const unlinkId = `${accountType}-${address || "default"}`;
    setUnlinking(unlinkId);
    try {
      switch (accountType) {
        case "email":
          if (address) await unlinkEmail(address);
          break;
        case "phone":
          if (address) await unlinkPhone(address);
          break;
        case "wallet":
        case "smart_wallet":
          if (address) await unlinkWallet(address);
          break;
        case "google_oauth":
          await unlinkGoogle(address || "");
          break;
        case "discord_oauth":
          await unlinkDiscord(address || "");
          break;
        case "twitter_oauth":
          await unlinkTwitter(address || "");
          break;
        case "github_oauth":
          await unlinkGithub(address || "");
          break;
        case "farcaster":
          await unlinkFarcaster(Number(address) || 0);
          break;
      }
    } catch (error) {
      console.error("Failed to unlink:", error);
    } finally {
      setUnlinking(null);
    }
  }

  function handleLink(type: LinkingAccount) {
    setLinking(type);
    switch (type) {
      case "email":
        linkEmail();
        break;
      case "phone":
        linkPhone();
        break;
      case "wallet":
        linkWallet();
        break;
      case "google":
        linkGoogle();
        break;
      case "discord":
        linkDiscord();
        break;
      case "twitter":
        linkTwitter();
        break;
      case "github":
        linkGithub();
        break;
      case "farcaster":
        linkFarcaster();
        break;
    }
  }

  function AccountRow({
    label,
    value,
    accountType,
    accountId,
  }: {
    label: string;
    value: string;
    accountType: string;
    accountId: string;
  }) {
    const unlinkId = `${accountType}-${accountId}`;
    const isUnlinking = unlinking === unlinkId;
    const isCopied = copied === accountId;

    return (
      <div className={`flex items-center justify-between py-2 px-3 rounded-lg ${t.row} transition-colors`}>
        <div className="flex flex-col min-w-0">
          <span className={`text-[9px] ${t.rowLabel} uppercase tracking-wide`}>
            {label}
          </span>
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${t.rowValue} truncate`}>
              {formatAddress(value)}
            </span>
            <button
              onClick={() => copyToClipboard(value, accountId)}
              className={`${t.copyBtn} transition-colors shrink-0`}
              title="Copy"
            >
              {isCopied ? (
                <span className={`${t.copiedText} text-[10px]`}>copied</span>
              ) : (
                <svg
                  className="w-3 h-3"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                </svg>
              )}
            </button>
          </div>
        </div>
        {linkedAccounts.length > 1 && (
          <button
            onClick={() => handleUnlink(accountType, accountId)}
            disabled={isUnlinking}
            className={`ml-2 ${t.unlinkBtn} transition-colors disabled:opacity-50 shrink-0`}
            title="Unlink"
          >
            {isUnlinking ? (
              <span className="text-[10px]">...</span>
            ) : (
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }

  function LinkButton({
    label,
    type,
    disabled = false,
  }: {
    label: string;
    type: LinkingAccount;
    disabled?: boolean;
  }) {
    const isLinking = linking === type;
    return (
      <button
        onClick={() => handleLink(type)}
        disabled={disabled || isLinking}
        className={`px-3 py-1.5 text-[10px] font-medium rounded-md border ${t.linkBtn} transition-colors disabled:opacity-40 disabled:cursor-not-allowed`}
      >
        {isLinking ? "..." : label}
      </button>
    );
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className={`${t.trigger} transition-colors`}
        title="Account settings"
      >
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.066 2.573c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.573 1.066c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.066-2.573c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.573-1.066z"
          />
          <circle cx="12" cy="12" r="3" />
        </svg>
      </button>

      <dialog
        ref={dialogRef}
        onClose={() => setOpen(false)}
        className={`${t.dialog} border rounded-xl p-0 w-full max-w-md shadow-2xl`}
      >
        <div className={`px-5 py-4 border-b ${t.headerBorder} flex items-center justify-between`}>
          <h2 className={`text-sm font-semibold ${t.title}`}>
            Account Settings
          </h2>
          <button
            onClick={() => setOpen(false)}
            className={t.closeBtn}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-5">
          {/* User ID */}
          <div className="flex items-center justify-between">
            <span className={`text-xs ${t.label}`}>User ID</span>
            <span className={`text-[10px] font-mono ${t.idBadge} px-2 py-1 rounded`}>
              {formatAddress(user.id)}
            </span>
          </div>

          <div className={`border-t ${t.divider}`} />

          {/* Linked accounts */}
          <div className="space-y-2">
            <h3 className={`text-xs font-medium ${t.sectionTitle}`}>
              Linked Accounts
            </h3>
            <div className="space-y-1.5">
              {emails.map((e) => (
                <AccountRow
                  key={(e as any).address}
                  label="Email"
                  value={(e as any).address}
                  accountType="email"
                  accountId={(e as any).address}
                />
              ))}
              {phones.map((p, i) => (
                <AccountRow
                  key={(p as any).number || `phone-${i}`}
                  label="Phone"
                  value={(p as any).number || "Unknown"}
                  accountType="phone"
                  accountId={(p as any).number || `phone-${i}`}
                />
              ))}
              {wallets.map((w) => (
                <AccountRow
                  key={(w as any).address}
                  label={
                    w.type === "smart_wallet" ? "Smart Wallet" : "Wallet"
                  }
                  value={(w as any).address}
                  accountType={w.type}
                  accountId={(w as any).address}
                />
              ))}
              {google.map((g) => (
                <AccountRow
                  key={(g as any).email}
                  label="Google"
                  value={(g as any).email || (g as any).name}
                  accountType="google_oauth"
                  accountId={(g as any).subject}
                />
              ))}
              {discord.map((d) => (
                <AccountRow
                  key={(d as any).username}
                  label="Discord"
                  value={(d as any).username}
                  accountType="discord_oauth"
                  accountId={(d as any).subject}
                />
              ))}
              {twitter.map((t_) => (
                <AccountRow
                  key={(t_ as any).username}
                  label="Twitter/X"
                  value={`@${(t_ as any).username}`}
                  accountType="twitter_oauth"
                  accountId={(t_ as any).subject}
                />
              ))}
              {github.map((gh) => (
                <AccountRow
                  key={(gh as any).username}
                  label="GitHub"
                  value={(gh as any).username}
                  accountType="github_oauth"
                  accountId={(gh as any).subject}
                />
              ))}
              {farcaster.map((fc) => (
                <AccountRow
                  key={(fc as any).fid}
                  label="Farcaster"
                  value={`@${(fc as any).username || (fc as any).fid}`}
                  accountType="farcaster"
                  accountId={String((fc as any).fid)}
                />
              ))}
              {linkedAccounts.length === 0 && (
                <p className={`text-xs ${t.empty} text-center py-3`}>
                  No linked accounts yet
                </p>
              )}
            </div>
          </div>

          <div className={`border-t ${t.divider}`} />

          {/* Link new accounts */}
          <div className="space-y-2">
            <h3 className={`text-xs font-medium ${t.sectionTitle}`}>
              Link New Account
            </h3>
            <div className="flex flex-wrap gap-1.5">
              <LinkButton
                label="Email"
                type="email"
                disabled={emails.length > 0}
              />
              <LinkButton
                label="Phone"
                type="phone"
                disabled={phones.length > 0}
              />
              <LinkButton label="Wallet" type="wallet" />
              <LinkButton
                label="Google"
                type="google"
                disabled={google.length > 0}
              />
              <LinkButton
                label="Discord"
                type="discord"
                disabled={discord.length > 0}
              />
              <LinkButton
                label="Twitter"
                type="twitter"
                disabled={twitter.length > 0}
              />
              <LinkButton
                label="GitHub"
                type="github"
                disabled={github.length > 0}
              />
              <LinkButton
                label="Farcaster"
                type="farcaster"
                disabled={farcaster.length > 0}
              />
            </div>
            <p className={`text-[9px] ${t.hint}`}>
              You can link multiple wallets but only one of each other account
              type.
            </p>
          </div>
        </div>
      </dialog>
    </>
  );
}
