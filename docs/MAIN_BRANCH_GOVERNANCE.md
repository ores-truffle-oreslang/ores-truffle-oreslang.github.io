# GitHub main branch governance — administrator action required

**Status on 2026-11-02: NOT APPLIED / NOT INSTALLED.** The public marketing repository's `main` reported `protected: false`, with no active rulesets. This repository stores only a **proposed** ruleset payload at [main-ruleset.proposed.json](../.github/policies/main-ruleset.proposed.json). Committing or testing it **does not install, enable or enforce** a GitHub rule.

## Administration

An authorized GitHub repository/organization administrator must open **Settings → Rules → Rulesets → New branch ruleset**, target `main`, and set enforcement to **Active**. Use the proposed payload as a reviewable policy reference:

- Require pull request before merging with one or more authorized, independently approving reviewers. Require approval after the most recent push, dismiss stale approvals, and resolve review threads.
- Require exact GitHub Actions check **`AttoLang Site Validation`** (GitHub Actions App ID `15368`, from an observed exact-head check-run), with branches up to date before merging. Do not require ambiguous generic `build` jobs.
- Block force pushes and deletions, and leave bypass list empty unless a separately approved and audited exception process exists.
- The template restricts merges to the `merge` method; ensure this matches repo policy before applying. Do not blindly paste into a different repo.
- Ensure an actually independent human reviewer with the necessary repository access exists. GitHub reviewer identity checks cannot prove social or organizational independence.

Reference: [GitHub rulesets docs](https://docs.github.com/en/repositories/configuring-branches-and-merges-in-your-repository/managing-rulesets/creating-rulesets-for-a-repository) and [GitHub REST ruleset parameter docs](https://docs.github.com/en/rest/repos/rules).

## Proof after applying

Read back the effective ruleset and confirm the target, `enforcement: active`, GitHub Actions check source, all four rule types, and empty bypass list. Verify that the repository actually blocks an unapproved PR, stale approval, failed/pending check, unauthorized direct push, force push and deletion. Test with a safe disposable branch or API dry-run only; do not attempt destructive actions against `main`.

`scripts/verify-main-ruleset.mjs` and `tests/main-ruleset.test.mjs` validate **shape and simulated merge evidence only**. They cannot query GitHub's administrative effective policy from CI, authenticate external approvals, grant permissions, or enforce merges. Repository CI must remain read-only and no GitHub tokens or private source may be copied to test carrier repositories.

Track the live configuration and review approval in [issue #77](https://github.com/ores-truffle-oreslang/ores-truffle-oreslang.github.io/issues/77). Do not merge [PR #75](https://github.com/ores-truffle-oreslang/ores-truffle-oreslang.github.io/pull/75) until protected-branch enforcement is independently verified.
