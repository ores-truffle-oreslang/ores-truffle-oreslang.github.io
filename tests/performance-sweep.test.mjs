import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const read = (path) => readFileSync(new URL(path, import.meta.url), "utf8");
const receipt=JSON.parse(read("../src/data/http-sweep-2026-10-12.json"));
const baseline=JSON.parse(read("../src/data/http-wrk2-2026-10-12.json"));
const excerpt=read("../public/performance/oreslang-http-sweep-2026-10-12.txt");
const page=read("../src/pages/performance.astro");

function verify(s) {
  assert.equal(s.schema,"oreslang-http-offered-load-sweep.v1");
  assert.equal(s.execution_profile,"jvm-jit");
  assert.equal(s.body_bytes,64);
  assert.equal(s.source_blob_count_verified,403);
  assert.equal(s.source_mirror_tree_sha,baseline.source_mirror_tree_sha);
  assert.equal(s.wrk2_commit_sha,baseline.wrk2_upstream_commit_sha);
  for(const name of ["runner_commit_sha","source_mirror_commit_sha","source_mirror_tree_sha","wrk2_commit_sha"])
    assert.match(s[name],/^[0-9a-f]{40}$/);
  assert.equal(s.runner_repository_visibility,"private");
  assert.equal(s.independent_jvm_per_rate,true);
  assert.equal(s.strict_wrong_body_negative_control_passed,true);
  assert.equal(s.connections,128);
  assert.equal(s.threads,4);
  assert.equal(s.duration_seconds_per_rate,60);
  assert.deepEqual(s.measurements.map(m=>m.offered_rps),[500,1000,2000]);
  const run=s.run_url.match(/^https:\/\/github\.com\/zed-pkg-test\/formal-methods-cross-check\/actions\/runs\/(\d+)$/);
  const artifact=s.artifact_url.match(/^https:\/\/github\.com\/zed-pkg-test\/formal-methods-cross-check\/actions\/runs\/(\d+)\/artifacts\/(\d+)$/);
  assert.ok(run && artifact,"CI URLs must point to the intended private runner");
  assert.equal(run[1],artifact[1],"artifact and run must share exact ID");
  assert.equal(s.public_excerpt_url,"/performance/oreslang-http-sweep-2026-10-12.txt");
  assert.match(s.limitations,/did not find saturation/);
  assert.match(s.limitations,/one machine/);
  for(const m of s.measurements) {
    assert.ok(Number.isInteger(m.completed_requests) && m.completed_requests>100);
    assert.ok(Number.isInteger(m.histogram_sample_count) && m.histogram_sample_count>100);
    assert.ok(m.histogram_sample_count<=m.completed_requests);
    assert.ok(m.achieved_rps>0 && m.achieved_rps <= m.offered_rps*1.10);
    assert.ok(m.p50_ms>0 && m.p50_ms<=m.p99_ms && m.p99_ms<=m.p999_ms);
    assert.equal(m.errors,0);
    assert.ok(Math.abs(m.completed_requests/m.duration_seconds_per_rate - m.achieved_rps)<1);
    assert.ok(excerpt.includes("R"+m.offered_rps));
    assert.ok(excerpt.includes("Requests/sec:") && excerpt.includes(m.achieved_rps.toFixed(2)));
    assert.ok(excerpt.includes(m.completed_requests+" requests in 1.00m"));
    assert.ok(excerpt.includes("Total count    =        "+m.histogram_sample_count));
  }
}
test("private HTTP sweep observations validate provenance and raw public excerpts",()=>verify(receipt));
test("tampered throughput or forged artifact identity fails",()=>{
  let obj=structuredClone(receipt);
  obj.measurements[1].achieved_rps=9000;
  assert.throws(()=>verify(obj));
  obj=structuredClone(receipt);
  obj.artifact_url=obj.artifact_url.replace("38199979586","111111");
  assert.throws(()=>verify(obj));
});
test("published page separates sweep observations and non-saturation disclaimer",()=>{
  assert.ok(page.includes('import httpSweep from "../data/http-sweep-2026-10-12.json"'));
  assert.ok(page.includes('id="ci-plaintext-private-rate-sweep"'));
  assert.ok(page.includes("The saturation point has not been measured"));
  assert.ok(page.includes("access required"));
});
