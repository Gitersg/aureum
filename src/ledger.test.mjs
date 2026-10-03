import test from "node:test";
import assert from "node:assert/strict";
import "./ledger.js";

const {
  capitalRequired,
  clarityScore,
  rankFor,
  formatMoney,
  seedData,
  parseBackup,
  strategyCount,
} = globalThis.AureumLedger;

test("ten percent of a year turns a month into capital", () => {
  assert.equal(capitalRequired(15000, 10), 1800000);
  assert.equal(capitalRequired(0, 10), null);
  assert.equal(capitalRequired(15000, 0), null);
});

test("starter ledger is an architect, not an empty page", () => {
  const data = seedData();
  assert.equal(strategyCount(data), 5);
  assert.equal(clarityScore(data), 74);
  assert.equal(rankFor(74).title, "Architect");
  assert.match(formatMoney(15000, "INR"), /15,000/);
});

test("a backup is the ledger, or the wrapper the studio stores", () => {
  const data = seedData();
  assert.equal(parseBackup(JSON.stringify(data)).ok, true);
  assert.equal(parseBackup(JSON.stringify({ state: { data }, version: 0 })).ok, true);
  assert.equal(parseBackup("{").ok, false);
  assert.equal(parseBackup(JSON.stringify({ version: 1 })).ok, false);

  const restored = parseBackup(JSON.stringify(data)).data;
  restored.goal.monthlyAmount = 1;
  assert.equal(data.goal.monthlyAmount, 15000);
});
