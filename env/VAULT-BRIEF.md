# composable.env 0.4.0 — Vault Testing Brief

## What Works

### `cenv vault init`
Creates `env/.recipients` and generates an identity from the local SSH key (ed25519). Works cleanly.

### `cenv vault set <key> <value>`
Encrypts the value with age and stores it in `.env.shared` as `CENV_ENC[<base64>]`. Verified round-trip: set → stored encrypted → get returns plaintext.

### `cenv vault get <key>`
Decrypts and prints the secret. Confirmed correct output.

### `cenv vault ls`
Lists encrypted keys without decrypting. Shows count and key names.

### `cenv vault recipients`
Lists who can decrypt. Shows key type and truncated public key.

### Build integration
`cenv build --profile default` decrypts vault secrets from `.env.shared` during build. Secrets only appear in output `.cenv.*` files if referenced by a contract — correct behavior.

---

## Bug: `cenv vault add --github` crashes

### Reproduction
```bash
npx cenv vault add --github infinitedusky --comment "Sandy (project owner)"
```

### Error
```
Error [ERR_PACKAGE_PATH_NOT_EXPORTED]: Package subpath './ed25519' is not defined
by "exports" in node_modules/@noble/curves/package.json
imported from composable.env/dist/src/vault.js
```

### Root Cause
`vault.js` imports `@noble/curves/ed25519` but the installed version of `@noble/curves` doesn't export that subpath. This is likely a version mismatch — the package needs to pin `@noble/curves` to a version that exports `./ed25519`, or the import path needs to be adjusted.

### Impact
- **`vault init`** — works (uses local SSH key, doesn't hit this code path)
- **`vault set/get/ls`** — works (encryption/decryption uses age CLI or different code path)
- **`vault add --github`** — broken (SSH key conversion to age key requires ed25519 operations)
- **`vault add --key`** — untested, may also be affected
- **`vault remove`** — untested, likely works if it doesn't need key conversion

### Fix
Either:
1. Pin `@noble/curves` to `>=1.2.0` which exports `./ed25519`
2. Change import from `@noble/curves/ed25519` to the correct subpath for the installed version
3. Use `@noble/ed25519` standalone package instead

---

## Untested

- `cenv vault add --key <publicKey>` — adding a raw age/SSH public key directly
- `cenv vault remove <identifier>` — removing a recipient and re-encrypting
- Multi-recipient encryption — setting secrets when multiple recipients exist
- Team workflow — new team member cloning repo and decrypting with their key

---

## User Flow (How It Should Work)

### Project owner sets up vault
```bash
cenv vault init                                    # creates .recipients, adds own key
cenv vault add --github teammate1                  # adds teammate's SSH key from GitHub
cenv vault add --github teammate2                  # adds another
cenv vault set DATABASE_PASSWORD "s3cret"          # encrypts for all recipients
cenv vault set API_KEY "sk-123..."                 # another secret
git add env/.recipients env/.env.shared && git commit
```

### Team member clones and uses secrets
```bash
git clone <repo>
pnpm install
npx cenv build --profile default                  # decrypts secrets with their SSH key
# .cenv.default now has plaintext DATABASE_PASSWORD, API_KEY
```

### Removing a team member
```bash
cenv vault remove teammate2                        # removes key, re-encrypts all secrets
git add env/.recipients env/.env.shared && git commit
# teammate2 can no longer decrypt future commits
```

### What gets committed
| File | Committed? | Contains |
|------|-----------|----------|
| `env/.recipients` | Yes | Public keys of all authorized recipients |
| `env/.env.shared` | Yes | `CENV_ENC[...]` encrypted values + plaintext shared vars |
| `env/.env.local` | No (gitignored) | Personal overrides |
| `.cenv.*` | No (gitignored) | Decrypted output files |

### Security model
- Secrets are encrypted at rest in the repo using age encryption
- Only recipients listed in `.recipients` can decrypt
- Uses SSH keys (ed25519) that developers already have — no new key management
- GitHub integration fetches public SSH keys — no key exchange needed
- Removing a recipient re-encrypts all secrets — revoked users can't decrypt new commits
- Note: revoked users can still decrypt from git history before removal

---

## Feature Request: CODEOWNERS Integration

### Problem
The vault has no admin concept — anyone who can decrypt can also run `vault add` and `vault remove`. Access control over who can modify the recipient list relies entirely on git permissions, but nothing sets that up automatically.

### Proposed Solution
`cenv vault init` should create/patch `.github/CODEOWNERS` to lock down `env/.recipients` to the initializing user. Uses the same `cenv:start/end` marker pattern as all other managed files.

### `vault init` should:
1. Create `.github/` directory if it doesn't exist
2. Create or patch `.github/CODEOWNERS` with:
```
# cenv:start
env/.recipients @<github-username>
# cenv:end
```
3. The GitHub username can come from `--github` flag on `vault init`, or be inferred from `git config` / GitHub CLI

### `uninstall` should:
- Strip the `cenv:start/end` block from `.github/CODEOWNERS`
- Remove `.github/CODEOWNERS` entirely if empty after stripping
- Remove `.github/` directory if empty

### Why this matters
- Without CODEOWNERS, any contributor can modify `.recipients` and grant themselves or others access to secrets
- With branch protection + CODEOWNERS, only the designated owner can approve changes to the recipient list
- This is the only setup step that requires GitHub repo settings (enabling "Require review from Code Owners" in branch protection rules), but the file itself lives in the repo

### CLI UX
```bash
# During vault init
cenv vault init --github infinitedusky
# Creates env/.recipients, .github/CODEOWNERS, adds own key

# Or infer from git
cenv vault init
# Detects GitHub username from git remote / gh CLI
```
