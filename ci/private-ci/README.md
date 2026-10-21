# Private CI external trust anchor

This public repository stores **authorization metadata only**. It must never
contain Oreslang private source, generated source archives, Git bundles,
source-bearing Actions artifacts, caches, or logs.

An authorization is valid only when it is present on this repository's
protected `main` branch after an independent pull-request review. The live
branch must require pull requests, at least one approving review, stale-review
dismissal, administrator enforcement, no review bypass actors, and disabled
force-push/deletion.

Each manifest binds one exact private source PR head and root Git tree to one
exact private carrier repository/base/workflow/test-plan. A source PR advance,
carrier `main` advance, repository delete/recreate, workflow or plan change,
expiry, visibility change, or manifest change invalidates the authorization.

The connector-mediated publisher must verify the protected anchor and all live
identities before reading or writing private source bytes; then it may create
only a fresh `ci/oreslang-<source-tree-sha>` source-bearing branch and the
matching `ci/authorized-<carrier-commit-sha>` authorization ref in the pinned
private carrier. It must verify the uploaded isolated subtree has the exact
authorized source root-tree SHA before attaching either ref.

This trust anchor is source-free by construction.
