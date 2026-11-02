import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { validateNameClearance } from "../scripts/name-clearance-validation.mjs";

const load = () => JSON.parse(readFileSync(new URL("../docs/attolang-name-clearance.json", import.meta.url), "utf8"));
const validEvidence = {url: "https://www.uspto.gov/trademarks/search/federal-trademark-searching",
  checked_on: "2026-11-02", summary: "Sample structural evidence only; not an authenticated legal clearance decision."};
const documentGate = (data, name, role) => {
  data.decision_gates[name] = {
    status:"documented", evidence:[validEvidence], reviewed_at:"2026-11-02",
    reviewer_role:role, reviewer_id:"test-reviewer-1", scope:"Example scoped review only",
    conclusion:"risk_accepted_in_scope",
  };
};

test("ledger is explicitly provisional with 37 language targets and independently documented collisions", () => {
  const data = load();
  assert.equal(validateNameClearance(data), true);
  assert.equal(data.languages.length, 37);
  assert.ok(data.languages.every(x => x.native_speaker_review === "pending"));
  assert.ok(Object.values(data.decision_gates).every(x => x.status === "pending"));
});

test("false global clearance, spoofed status and bypassed review are rejected", () => {
  const d = load();
  assert.throws(() => validateNameClearance({...d, status:"globally_cleared"}));
  assert.throws(() => validateNameClearance({...d, status:"ready_for_owner_decision"}));
  const copied = structuredClone(d);
  copied.decision_gates.counsel_confusion_review.status = "documented";
  assert.throws(() => validateNameClearance(copied), /approval|evidence/u);
});

test("a properly documented individual gate can advance without claiming clearance", () => {
  const d = load();
  documentGate(d, "formal_us_search", "trademark_researcher");
  assert.equal(validateNameClearance(d), true);
  assert.equal(d.status, "provisional_not_cleared");
  const bad = structuredClone(d);
  bad.decision_gates.formal_us_search.reviewer_role = "random_actor";
  assert.throws(() => validateNameClearance(bad), /review role/u);
  const noLink = structuredClone(d);
  noLink.decision_gates.formal_us_search.evidence[0].url = "http://example.com";
  assert.throws(() => validateNameClearance(noLink), /supporting document/u);
});

test("dangerous owner signoff, invented language approvals and unsupported package availability fail closed", () => {
  const d = load();
  documentGate(d, "owner_signoff", "authorized_owner");
  assert.throws(() => validateNameClearance(d), /cannot precede/u);
  const language = load();
  language.languages[0].native_speaker_review = "documented";
  assert.throws(() => validateNameClearance(language), /native-speaker evidence/u);
  const pkg = load();
  pkg.identifiers.packages.npm = "available";
  assert.throws(() => validateNameClearance(pkg), /registry record/u);
});

test("duplicate language/source IDs or removed trademark evidence are rejected", () => {
  const d = load();
  d.languages.push(structuredClone(d.languages[0]));
  assert.throws(() => validateNameClearance(d), /duplicate language/u);
  const m = load();
  m.verified_public_findings = m.verified_public_findings.filter(x => x.id !== "atto-us-reg-2680136");
  assert.throws(() => validateNameClearance(m), /missing documented collision/u);
});

test("candidate remains provisional in branding policy and audit report", () => {
  const policy = readFileSync(new URL("../docs/ATTOLANG_BRANDING.md", import.meta.url), "utf8");
  const report = readFileSync(new URL("../docs/ATTOLANG_NAME_CLEARANCE.md", import.meta.url), "utf8");
  assert.match(policy, /provisional public display name/u);
  assert.match(report, /PROVISIONAL — NOT GLOBALLY CLEARED/u);
  assert.match(report, /steps=\[\].*null/u);
  assert.match(report, /partial Section 8 cancellation/u);
});
