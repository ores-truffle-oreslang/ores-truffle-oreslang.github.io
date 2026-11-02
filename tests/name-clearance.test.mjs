import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const load = () => JSON.parse(readFileSync(new URL("../docs/attolang-name-clearance.json", import.meta.url), "utf8"));
const requiredGates = [
  "formal_us_search", "formal_international_search", "counsel_confusion_review",
  "native_linguist_review", "domain_registrar_review", "package_registry_review", "owner_signoff",
];
const criticalEvidence = ["atto-language", "atto-actor-go", "atto-trademark-owner", "atto-us-reg-2680135", "atto-us-reg-2680136", "uspto-confusion"];

function checkLedger(data) {
  assert.equal(data.schema_version, 1);
  assert.equal(data.candidate, "AttoLang");
  assert.equal(data.status, "provisional_not_cleared", "Do not upgrade to cleared without a separate legal review and explicit gate change");
  for (const gate of requiredGates) assert.equal(data.decision_gates?.[gate], "pending", gate + " needs independent documented clearance");
  assert.ok(Array.isArray(data.languages) && data.languages.length >= 30, "explicit 30+ language roster required");
  const codes = data.languages.map((v) => v.code);
  assert.equal(new Set(codes).size, codes.length, "duplicate locale codes");
  for (const item of data.languages) {
    assert.match(item.code, /^[a-z]{2}$/u);
    assert.ok(item.name);
    assert.equal(item.native_speaker_review, "pending", "No unverified native-speaker claims");
  }
  assert.ok(Array.isArray(data.verified_public_findings));
  const sources = data.verified_public_findings;
  assert.equal(new Set(sources.map(s => s.id)).size, sources.length, "duplicate evidence IDs");
  for (const id of criticalEvidence) assert.ok(sources.some(s => s.id === id), "missing evidence: " + id);
  for (const source of sources) {
    assert.match(source.url, /^https:\/\/[a-z0-9.-]+\//iu, "HTTPS source required");
    assert.ok(source.finding?.length > 25);
  }
  assert.equal(data.software_identity?.atto_already_used, true);
  assert.equal(data.software_identity?.attolang_exact_name_uniqueness, "unverified");
  assert.equal(data.software_identity?.github_attolang_org_control, "unverified");
  for (const status of Object.values(data.identifiers?.domains ?? {})) assert.equal(status, "unverified");
  for (const status of Object.values(data.identifiers?.packages ?? {})) assert.equal(status, "unverified");
}

test("AttoLang evidence ledger stays fail closed with 30+ explicitly pending language reviews", () => checkLedger(load()));
test("forged global clearance or bypassed legal gate fails validation", () => {
  const d = load();
  assert.throws(() => checkLedger({...d, status:"globally_cleared"}));
  assert.throws(() => checkLedger({...d, decision_gates:{...d.decision_gates,counsel_confusion_review:"passed"}}));
});
test("duplicate locale and unsupported trademark evidence are rejected", () => {
  const d = load();
  assert.throws(() => checkLedger({...d, languages:[...d.languages, d.languages[0]]}));
  assert.throws(() => checkLedger({...d, verified_public_findings:d.verified_public_findings.filter(v=>v.id!=="atto-us-reg-2680136")}));
});
test("branding policy cannot imply certified global availability", () => {
  const policy = readFileSync(new URL("../docs/ATTOLANG_BRANDING.md", import.meta.url), "utf8");
  const doc = readFileSync(new URL("../docs/ATTOLANG_NAME_CLEARANCE.md", import.meta.url), "utf8");
  assert.match(policy, /provisional public display name/u);
  assert.match(doc, /PROVISIONAL — NOT GLOBALLY CLEARED/u);
  assert.match(doc, /steps=\[\].*null/u);
});
