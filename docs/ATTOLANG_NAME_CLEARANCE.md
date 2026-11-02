# AttoLang naming-clearance evidence and release gates

**Working candidate:** AttoLang (not standalone Atto)  
**Audit date:** 2026-11-01  
**Disposition:** **PROVISIONAL — NOT GLOBALLY CLEARED**

This public evidence file is a research and decision ledger, **not** a trademark search opinion, an authorization to use the name in every jurisdiction, a legal conclusion, or proof that a domain/handle/package is available. The machine-readable source is [attolang-name-clearance.json](./attolang-name-clearance.json). Legal advice and official trademark results must be obtained outside this repository before claiming clearance.

## Evidence independently rechecked

| Finding | Evidence | Limits |
| --- | --- | --- |
| Italian `atto` means an act/deed and can mean fit/suitable | [Cambridge](https://dictionary.cambridge.org/us/dictionary/italian-english/atto) | Dictionary meaning does not clear dialect slang or trademarks |
| A functional programming language is already called Atto | [zesterer/atto](https://github.com/zesterer/atto) | Not necessarily an enforceable trademark |
| An actor-backed Go agent runtime uses Atto | [Go documentation](https://pkg.go.dev/github.com/tochemey/atto) | Different category and implementation; confusion needs separate evaluation |
| ATTO Technology claims registered ATTO marks for hardware/software | [Owner's trademark statement](https://www.atto.com/about-atto-technology/compliance/trademark-information/) | Specific goods and services matter; no blanket ban |
| U.S. registration 2680135 is associated with ATTO Technology | [Third-party record](https://trademarks.justia.com/763/12/atto-76312586.html) | Re-verify current status and goods directly in USPTO/TSDR |
| U.S. registration 2680136 is associated with ATTO Technology | [Third-party record](https://uspto.report/TM/76312590) | Re-verify current status and goods directly in USPTO/TSDR |

The [USPTO's confusion guidance](https://www.uspto.gov/trademarks/search/likelihood-confusion) says similarity and related offerings matter. Neither the presence of an ATTO mark nor appending “Lang” establishes a legal yes/no answer.

## Corrections to preliminary screening claims

- A list of 37 languages is a **target review roster**, not 37 completed native-speaker screenings. Native-speaker status is `pending` for every language; do not infer safety from lack of indexed search hits.
- Searches for `AttoLang` did not establish worldwide trademark availability, an available GitHub organization, or ownership of an existing similarly named organization.
- Unresponsive domains and missing package result pages are **not** registration-availability evidence. Treat exact-domain and package results as `unverified`.
- External aggregators identify U.S. ATTO registrations, but an official current-status search and a confusion assessment are still missing.
- The existing names **Atto** and **AttoLang** are not interchangeable. Assess both exact and phonetic variations.

## Launch decision checklist

1. Counsel reviews USPTO live marks, TSDR registration IDs **2680135/2680136**, confusingly similar marks, common-law usage, and intended goods/services (initially Nice Classes 9 and 42; evaluate others as needed).
2. Review EUIPO, UKIPO, WIPO Madrid and priority country registers through appropriate manual/authorized methods. WIPO [restricts automated querying](https://www.wipo.int/en/web/global-brand-database/terms_and_conditions) and its database is not a legal opinion.
3. Obtain qualified native-speaker screening of all 37 target languages, including dialect, slang, pronunciation, and near-homophones; record reviewers and dates without exposing personal information.
4. Verify domains with registrar/RDAP and GitHub/package handles with authoritative authenticated reservation checks; do not claim availability from 404s.
5. Receive recorded owner approval **after** supporting evidence and counsel's recommendation. Until then, branding is provisional.

## CI and source-handling policy

`npm test` validates ledger integrity and **fail-closed status only**: no CI run can certify trademark freedom or linguistic safety. All legal/registry gates remain pending.

Use the existing source-repository Actions first. A job with `steps=[]`/`null` is a runner-admission failure, not a pass or fail of code. Only if source Actions admission fails, evaluate an **authorized private** destination with funded Actions minutes; mirror the exact permitted Git tree without cross-org tokens, verify source/destination tree identity and submodules/LFS, and execute the destination's own workflow with minimal read permissions. Never mirror private code into a public repository and never add secrets or unreviewed workflows. That fallback is unnecessary for this public naming-only change if the source CI executes.
