import assert from "node:assert/strict";

const GATES = [
  "formal_us_search", "formal_international_search", "counsel_confusion_review",
  "native_linguist_review", "domain_registrar_review", "package_registry_review", "owner_signoff",
];
const CRITICAL = [
  "atto-language", "atto-actor-go", "atto-trademark-owner",
  "atto-us-reg-2680135", "atto-us-reg-2680136",
  "atto-us-reg-2680136-maintenance", "uspto-confusion", "uspto-clearance-method", "wipo-limits",
];
const HTTPS = /^https:\/\/[a-z0-9.-]+(?:\/|$)/iu;
const DATE = /^\d{4}-\d\d-\d\d$/u;
const DECISIONS = ["cleared_in_scope", "risk_accepted_in_scope", "not_cleared"];
const REVIEWER_ROLES = {
  formal_us_search: ["qualified_trademark_counsel", "trademark_researcher"],
  formal_international_search: ["qualified_trademark_counsel", "trademark_researcher"],
  counsel_confusion_review: ["qualified_trademark_counsel"],
  native_linguist_review: ["linguistic_reviewer_lead"],
  domain_registrar_review: ["authorized_domain_reviewer"],
  package_registry_review: ["authorized_package_reviewer"],
  owner_signoff: ["authorized_owner"],
};

function dateValid(value) {
  if (typeof value !== "string" || !DATE.test(value)) return false;
  const time = Date.parse(value + "T00:00:00Z");
  return Number.isFinite(time) && new Date(time).toISOString().slice(0, 10) === value;
}

function evidenceValid(item) {
  return item && typeof item === "object" && typeof item.url === "string" &&
    HTTPS.test(item.url) && dateValid(item.checked_on) &&
    typeof item.summary === "string" && item.summary.trim().length >= 20;
}

function domainOrPackageValid(item) {
  if (item === "unverified") return true;
  return item && typeof item === "object" &&
    ["available_checked", "occupied", "reserved_by_project"].includes(item.status) &&
    evidenceValid(item.evidence) && typeof item.scope === "string" && item.scope.length >= 3;
}

export function validateNameClearance(data) {
  assert.equal(data.schema_version, 2, "schema version must match validator");
  assert.equal(data.candidate, "AttoLang");
  assert.ok(["provisional_not_cleared", "ready_for_owner_decision"].includes(data.status),
    "A CI-validated data file cannot certify a globally cleared trademark");
  assert.ok(dateValid(data.as_of), "valid audit date required");

  const findings = data.verified_public_findings;
  assert.ok(Array.isArray(findings) && findings.length >= CRITICAL.length);
  assert.equal(new Set(findings.map(f => f.id)).size, findings.length, "duplicate public evidence ID");
  for (const id of CRITICAL) assert.ok(findings.some(f => f.id === id), "missing documented collision/source: " + id);
  for (const source of findings) {
    assert.match(source.id, /^[a-z0-9-]+$/u);
    assert.ok(["dictionary", "software", "owner_statement", "third_party_registry", "regulator_guidance"].includes(source.kind));
    assert.ok(HTTPS.test(source.url), "public evidence must have a non-empty HTTPS source");
    assert.ok(typeof source.finding === "string" && source.finding.trim().length >= 25);
  }

  assert.ok(Array.isArray(data.languages) && data.languages.length >= 30, "30+ target languages required");
  assert.equal(new Set(data.languages.map(x => x.code)).size, data.languages.length, "duplicate language");
  for (const l of data.languages) {
    assert.match(l.code, /^[a-z]{2}$/u);
    assert.ok(typeof l.name === "string" && l.name.length > 1);
    if (l.native_speaker_review === "pending") continue;
    assert.equal(l.native_speaker_review, "documented");
    assert.ok(evidenceValid(l.evidence), "independent native-speaker evidence required for " + l.code);
    assert.ok(typeof l.reviewer_id === "string" && l.reviewer_id.trim().length >= 3);
  }

  assert.equal(data.software_identity.atto_already_used, true);
  assert.equal(data.software_identity.attolang_exact_name_uniqueness, "unverified",
    "public-source search cannot establish uniqueness");
  assert.equal(data.software_identity.github_attolang_org_control, "unverified",
    "ownership requires a separate authenticated check");
  for (const key of ["attolang.com", "attolang.org", "attolang.dev"]) {
    assert.ok(domainOrPackageValid(data.identifiers.domains[key]), "invalid domain record " + key);
  }
  for (const key of ["npm", "pypi", "crates", "nuget"]) {
    assert.ok(domainOrPackageValid(data.identifiers.packages[key]), "invalid registry record " + key);
  }

  assert.deepEqual(Object.keys(data.decision_gates).sort(), [...GATES].sort(),
    "gate set cannot be removed or silently expanded");
  const documented = new Set();
  for (const [key, value] of Object.entries(data.decision_gates)) {
    assert.ok(value && typeof value === "object", "gate must have evidence-aware status");
    assert.ok(["pending", "documented"].includes(value.status), "invalid gate status " + key);
    if (value.status === "pending") {
      assert.deepEqual(value.evidence, [], "pending gate cannot carry unreviewed evidence");
      for (const field of ["reviewed_at", "reviewer_role", "reviewer_id", "scope", "conclusion"])
        assert.equal(value[field], null, "pending gate cannot imply approval: " + key + "." + field);
      continue;
    }
    documented.add(key);
    assert.ok(Array.isArray(value.evidence) && value.evidence.length > 0, "no approval without evidence: " + key);
    for (const item of value.evidence) assert.ok(evidenceValid(item), "invalid supporting document for " + key);
    assert.ok(dateValid(value.reviewed_at), "missing review date " + key);
    assert.ok(REVIEWER_ROLES[key].includes(value.reviewer_role), "wrong review role for " + key);
    assert.ok(typeof value.reviewer_id === "string" && value.reviewer_id.trim().length >= 3, "reviewer missing for " + key);
    assert.ok(typeof value.scope === "string" && value.scope.trim().length >= 5, "scope missing for " + key);
    assert.ok(DECISIONS.includes(value.conclusion), "conclusion missing for " + key);
  }
  if (documented.has("native_linguist_review")) {
    assert.ok(data.languages.every(l => l.native_speaker_review === "documented"),
      "language review gate requires each target language's evidence");
  }
  if (documented.has("domain_registrar_review")) {
    assert.ok(Object.values(data.identifiers.domains).every(x => x !== "unverified"),
      "domain gate requires all domains checked");
  }
  if (documented.has("package_registry_review")) {
    assert.ok(Object.values(data.identifiers.packages).every(x => x !== "unverified"),
      "package gate requires all registries checked");
  }
  if (documented.has("owner_signoff")) {
    assert.ok(GATES.filter(x => x !== "owner_signoff").every(x => documented.has(x)),
      "owner signoff cannot precede completed evidence/review gates");
    assert.notEqual(data.decision_gates.owner_signoff.reviewer_id,
      data.decision_gates.counsel_confusion_review.reviewer_id,
      "owner and counsel must be independently identified");
    assert.ok(data.decision_gates.owner_signoff.conclusion !== "cleared_in_scope" ||
      GATES.every(x => data.decision_gates[x].conclusion === "cleared_in_scope"),
      "owner cannot claim clearance where any gate found risk");
  }
  if (data.status === "ready_for_owner_decision") {
    assert.ok(GATES.filter(x => x !== "owner_signoff").every(x => documented.has(x)),
      "readiness must be supported by independent reviews");
    assert.ok(!documented.has("owner_signoff"), "owner-signoff workflow happens after readiness");
  }
  assert.ok(typeof data.legal_note === "string" && /cannot authenticate legal/i.test(data.legal_note),
    "legal-limit disclaimer required");
  return true;
}
