# Security Scanning & Supply Chain Security

> How Kids Learning Fun protects its dependency chain, detects vulnerabilities, and maintains license compliance.

---

## Table of Contents

1. [Overview](#overview)
2. [Automated Security Pipeline](#automated-security-pipeline)
3. [Dependency Audit](#dependency-audit)
4. [Lockfile Integrity](#lockfile-integrity)
5. [Secret Scanning](#secret-scanning)
6. [License Compliance](#license-compliance)
7. [Supply Chain Security](#supply-chain-security)
8. [Vulnerability Response Process](#vulnerability-response-process)
9. [Developer Guidelines](#developer-guidelines)
10. [Monitoring and Alerts](#monitoring-and-alerts)
11. [COPPA Compliance Considerations](#coppa-compliance-considerations)

---

## Overview

Kids Learning Fun handles sensitive data for children and families. Our security scanning strategy covers four pillars:

1. **Dependency Audit**: Detect known vulnerabilities (CVEs) in npm packages
2. **Lockfile Integrity**: Prevent supply chain tampering via lockfile manipulation
3. **Secret Scanning**: Prevent accidental commit of credentials, API keys, and tokens
4. **License Compliance**: Ensure all dependencies have compatible licenses

These checks run automatically via GitHub Actions (`.github/workflows/security.yml`) on:
- Every push to `main` and `develop`
- Every pull request
- Weekly scheduled scan (Monday 06:00 UTC)

---

## Automated Security Pipeline

### Workflow: `.github/workflows/security.yml`

```
security.yml
  |
  +-- dependency-audit (matrix: root, backend, admin)
  |     Run npm audit against each package
  |     Fail on critical vulnerabilities
  |     Warn on high vulnerabilities
  |
  +-- lockfile-integrity
  |     Verify lockfiles match package.json
  |     Check for non-npm registry sources
  |     Detect lockfile tampering
  |
  +-- secret-scan
  |     Scan for AWS keys, API keys, tokens
  |     Check for committed .env files
  |     Check for private key files
  |
  +-- license-check
  |     Verify no copyleft licenses in production deps
  |     Generate license report artifact
  |
  +-- supply-chain (PRs only)
  |     Analyze dependency changes
  |     Check for lifecycle scripts
  |     Verify critical package provenance
  |
  +-- security-status (gate)
        Aggregate results
        Hard fail on: secrets, critical CVEs, lockfile issues
        Soft warn on: high CVEs, license edge cases
```

### Trigger Rules

| Event | When | What Runs |
|---|---|---|
| Push to main/develop | Every push | Full pipeline |
| Pull request | Every PR | Full pipeline + supply chain |
| Schedule | Monday 06:00 UTC | Full pipeline (catches new CVEs) |
| Manual | workflow_dispatch | Full pipeline |

### Failure Behavior

| Check | Failure = Block PR? | Rationale |
|---|---|---|
| Critical CVE | Yes | Known exploits must be fixed |
| High CVE | No (warning) | May require upstream fix; tracked |
| Lockfile out of sync | Yes | Could indicate tampering |
| Secret detected | Yes | Must never reach production |
| Copyleft license | No (warning) | May be false positive; reviewed |
| Supply chain anomaly | No (warning) | Informational for reviewer |

---

## Dependency Audit

### What It Checks

The `npm audit` command checks installed packages against the npm advisory database for known vulnerabilities (CVEs, GHSA advisories).

### Three Package Ecosystems

| Ecosystem | Location | Critical Paths |
|---|---|---|
| Root (Frontend) | `./package.json` | React, Vite, Framer Motion, Dexie |
| Backend | `./backend/package.json` | Express, Prisma, BullMQ, jsonwebtoken |
| Admin | `./admin/package.json` | React, Vite, admin components |

### Severity Levels

| Severity | npm audit level | Our policy |
|---|---|---|
| Critical | `critical` | Must fix immediately. Blocks PRs and releases. |
| High | `high` | Fix within 1 week. Warning in CI. |
| Moderate | `moderate` | Fix in next release cycle. Tracked in backlog. |
| Low | `low` | Fix when convenient. No alert. |

### Responding to Audit Findings

```bash
# View current vulnerabilities
npm audit

# View in JSON (for scripting)
npm audit --json

# Attempt automatic fix (safe: only updates within semver range)
npm audit fix

# Force fix (may include breaking changes -- review carefully)
npm audit fix --force

# If a fix is not available upstream, check if the vulnerable code path
# is actually used in our application
npm audit --json | node -e "
  const data = JSON.parse(require('fs').readFileSync('/dev/stdin','utf8'));
  // Review each advisory to determine if it affects our usage
"
```

### Suppressing False Positives

If a vulnerability does not affect our usage (e.g., it is in a dev dependency or an unused code path), document the exception:

```json
// In package.json or .nsprc (npm audit exceptions)
{
  "overrides": {
    "vulnerable-package": ">=patched-version"
  }
}
```

Always document the rationale in a PR comment and link to the advisory.

---

## Lockfile Integrity

### What It Checks

1. **Sync verification**: `npm ci` succeeds without modifying the lockfile
2. **Registry validation**: All packages resolve to `registry.npmjs.org` (not third-party registries)
3. **Divergence detection**: No uncommitted lockfile changes after `npm ci`

### Why Lockfile Integrity Matters

Lockfile manipulation is a known supply chain attack vector:
- **Dependency confusion**: Attacker publishes a package with the same name to a public registry
- **Registry hijacking**: Lockfile edited to point to a malicious registry
- **Version pinning bypass**: Lockfile modified to resolve to a compromised version

### Prevention

- Always run `npm ci` (not `npm install`) in CI to enforce lockfile exactness
- Review lockfile diffs in PRs that add/update dependencies
- Verify `resolved` URLs in lockfile point to official npm registry
- Never commit lockfile changes from `npm install` without reviewing the diff

---

## Secret Scanning

### Patterns Detected

| Pattern | Example | Why It Matters |
|---|---|---|
| AWS Access Key | `AKIA...` (20 chars) | Full AWS account access |
| OpenAI API Key | `sk-...` (48+ chars) | API billing, data access |
| Anthropic API Key | `sk-ant-...` | API billing, data access |
| GitHub PAT | `ghp_...` (36 chars) | Repository access |
| GitHub OAuth | `gho_...` (36 chars) | Organization access |
| Slack Token | `xoxb-...` | Workspace access |
| Stripe Key | `sk_live_...` | Payment access |
| Private Keys | `-----BEGIN PRIVATE KEY-----` | TLS/signing compromise |
| .env files | `.env`, `.env.local`, `.env.production` | Credential bundles |

### What To Do If Secrets Are Found

1. **Do NOT merge the PR**
2. Remove the secret from the code
3. If it was ever pushed (even to a branch), consider the secret compromised
4. Rotate the compromised credential immediately
5. See [disaster-recovery.md](./disaster-recovery.md#runbook-secrets-leak) for the full rotation runbook

### Pre-commit Protection

For local development, consider adding a pre-commit hook:

```bash
# .husky/pre-commit (if using husky)
#!/bin/sh
# Scan staged files for secrets before committing

PATTERNS=(
  'AKIA[0-9A-Z]{16}'
  'sk-[0-9a-zA-Z]{48}'
  'ghp_[0-9a-zA-Z]{36}'
)

for pattern in "${PATTERNS[@]}"; do
  if git diff --cached --name-only | xargs grep -lE "$pattern" 2>/dev/null; then
    echo "ERROR: Possible secret found in staged files matching: $pattern"
    echo "Remove the secret and try again."
    exit 1
  fi
done
```

### .gitignore Requirements

The following must always be in `.gitignore`:

```
.env
.env.local
.env.production
.env.*.local
*.pem
*.key
*.p12
*.pfx
credentials.json
service-account.json
```

---

## License Compliance

### Allowed Licenses

| License | Status | Notes |
|---|---|---|
| MIT | Allowed | Most npm packages |
| ISC | Allowed | npm default |
| BSD-2-Clause | Allowed | Permissive |
| BSD-3-Clause | Allowed | Permissive |
| Apache-2.0 | Allowed | Permissive with patent grant |
| 0BSD | Allowed | Public domain equivalent |
| Unlicense | Allowed | Public domain |
| CC0-1.0 | Allowed | Public domain |
| CC-BY-4.0 | Allowed | Attribution only |

### Restricted Licenses

| License | Status | Reason |
|---|---|---|
| GPL-2.0 | Review Required | Copyleft; may require source disclosure |
| GPL-3.0 | Blocked | Strong copyleft |
| AGPL-3.0 | Blocked | Network copyleft; affects SaaS |
| SSPL-1.0 | Blocked | Server-side copyleft |
| EUPL-1.1/1.2 | Blocked | European copyleft |
| CC-BY-NC-* | Blocked | Non-commercial restriction |
| CC-BY-ND-* | Blocked | No derivatives restriction |

### Handling License Issues

1. If a dependency has a restricted license, check if it is a **dev dependency only** (dev dependencies do not affect the distributed product)
2. If it is a production dependency, look for an alternative package with a permissive license
3. If no alternative exists, consult with legal about obtaining a commercial license exception
4. Document all license exceptions in this file

### Current License Exceptions

*None at this time.*

---

## Supply Chain Security

### Principles

1. **Minimal dependencies**: Only add packages that provide significant value
2. **Verified publishers**: Prefer packages from verified npm publishers
3. **Active maintenance**: Avoid packages that have not been updated in 2+ years
4. **Lockfile review**: Always review lockfile changes in dependency PRs
5. **No lifecycle scripts**: Be cautious of packages with `postinstall` scripts

### Adding a New Dependency

Before adding any new npm package, verify:

- [ ] Package has >1000 weekly downloads (or is from a known publisher)
- [ ] Package is actively maintained (commit within last 6 months)
- [ ] Package has no known critical vulnerabilities
- [ ] Package license is in the allowed list
- [ ] Package does not have suspicious `postinstall` or `preinstall` scripts
- [ ] The functionality cannot be achieved with existing dependencies or stdlib

```bash
# Check package info before installing
npm info <package-name>

# Check download stats
npm info <package-name> downloads

# Check for known vulnerabilities
npm audit <package-name>

# Review the package on npm
open "https://www.npmjs.com/package/<package-name>"

# Check the source code on GitHub
open "https://github.com/<owner>/<repo>"
```

### Dependency Update Policy

| Update Type | Frequency | Process |
|---|---|---|
| Patch (x.x.PATCH) | Weekly (automated) | Auto-merge if CI passes |
| Minor (x.MINOR.x) | Biweekly | Review changelog, merge if CI passes |
| Major (MAJOR.x.x) | Manual | Full review, test, document breaking changes |
| Security patches | Immediate | Expedited review and merge |

---

## Vulnerability Response Process

### Severity-Based Response Times

| Severity | Response SLA | Fix SLA | Notification |
|---|---|---|---|
| Critical (CVSS 9.0-10.0) | 4 hours | 24 hours | Immediate team alert |
| High (CVSS 7.0-8.9) | 1 business day | 1 week | Weekly security review |
| Moderate (CVSS 4.0-6.9) | 1 week | Next release | Backlog ticket |
| Low (CVSS 0.1-3.9) | Best effort | Opportunistic | No alert |

### Response Workflow

```
1. CVE Detected (via weekly scan or PR check)
   |
   +-- Is it in a production dependency?
   |     |
   |     +-- No (devDependency only) --> Low priority, fix in next update cycle
   |     |
   |     +-- Yes --> Is the vulnerable code path reachable in our app?
   |                   |
   |                   +-- No --> Document exception, suppress warning
   |                   |
   |                   +-- Yes --> Is a patched version available?
   |                                 |
   |                                 +-- Yes --> Update immediately
   |                                 |
   |                                 +-- No --> Implement workaround or replace package
   |
2. Update/fix applied
3. CI passes
4. Deploy via standard release process (or hotfix for critical)
5. Verify fix in production
6. Close the advisory tracking ticket
```

---

## Developer Guidelines

### Do

- Run `npm audit` locally before pushing dependency changes
- Review lockfile diffs when adding or updating packages
- Use exact versions for critical security packages (e.g., `jsonwebtoken`, `bcryptjs`)
- Keep `.gitignore` up to date with all secret file patterns
- Report any suspicious package behavior to the security team

### Do Not

- Do not ignore `npm audit` warnings without documenting the reason
- Do not add packages from unknown or unverified publishers
- Do not commit `.env` files, API keys, or credentials under any circumstances
- Do not use `npm install` in CI (always use `npm ci`)
- Do not override lockfile registry URLs
- Do not use `--ignore-scripts` in production builds
- Do not disable security workflow checks without team approval

### Local Security Tools

```bash
# Run a full local security check
npm audit && cd backend && npm audit && cd ../admin && npm audit

# Check for secrets in staged files
git diff --cached --name-only | xargs grep -lE 'AKIA|sk-[a-zA-Z0-9]{20}|ghp_'

# Verify .gitignore coverage
git ls-files --cached | grep -E '\.env|\.pem|\.key|credentials'
# (Should return nothing)
```

---

## Monitoring and Alerts

### GitHub Dependabot

If enabled, GitHub Dependabot provides:
- Automated security advisories for vulnerable dependencies
- Pull requests to update vulnerable packages
- Weekly dependency update PRs (configurable)

### Weekly Security Review

Every Monday, the scheduled security scan runs and produces:
- Audit reports for all three package ecosystems (artifacts in GitHub Actions)
- License compliance reports
- Secret scanning results

Review these results in the Monday team standup.

### Alert Channels

| Alert Source | Destination | Urgency |
|---|---|---|
| Critical CVE in CI | PR check failure + Slack #security | Immediate |
| High CVE in scheduled scan | Slack #security | Within 1 business day |
| Secret detected in CI | PR check failure + Slack #security | Immediate |
| Dependabot advisory | GitHub notification | Within response SLA |

---

## COPPA Compliance Considerations

As a children's education app, Kids Learning Fun is subject to COPPA (Children's Online Privacy Protection Act). Security scanning supports COPPA compliance by:

1. **Preventing data leaks**: Secret scanning ensures credentials are never exposed, protecting child data
2. **Dependency vetting**: Vulnerable dependencies could be exploited to access child data
3. **License compliance**: Ensures we can legally distribute the app and handle data as described in our privacy policy
4. **Supply chain security**: Prevents malicious code injection that could collect unauthorized data from children

### Regular COPPA Security Review

Quarterly, as part of the major release cycle:
- [ ] Review all third-party packages that handle or transmit user data
- [ ] Verify no analytics packages send data to unauthorized third parties
- [ ] Confirm all data processing packages have appropriate privacy controls
- [ ] Review any new dependencies added since last review for data practices
- [ ] Update privacy policy if dependency data practices have changed
