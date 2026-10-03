/* Aureum ledger model
   Copyright (c) 2026 Shrinjoy Ghosh
   MIT License. See LICENSE in the repository root.
*/
(function (root) {
  var TIERS = ["S", "A", "B", "C", "D"];
  var CURRENCIES = ["INR", "USD", "EUR", "GBP"];

  var TIER_META = {
    S: {
      name: "S Class",
      role: "Summit",
      creed:
        "The best path. Ownership, yield, and a life that stays intact. This is how the number arrives without you selling your days.",
      write: "Write the strategy worthy of the summit.",
    },
    A: {
      name: "A Class",
      role: "Excellent",
      creed:
        "High leverage. A rare skill, equity, or a product that can fund the goal and still leave surplus to invest.",
      write: "Write a path with real leverage.",
    },
    B: {
      name: "B Class",
      role: "Sound",
      creed:
        "Honest compounding. Dignified work that protects your health and steadily feeds the portfolio.",
      write: "Write a bridge that does not break you.",
    },
    C: {
      name: "C Class",
      role: "Caution",
      creed:
        "The number, barely. Time sold for cash with little left to grow. Useful to see. Poor as a destiny.",
      write: "Write the option you should not confuse with a future.",
    },
    D: {
      name: "D Class",
      role: "Fail path",
      creed:
        "Self-destruction dressed as earning. Effort that buys the figure by spending health, dignity, and the years ahead.",
      write: "Name the trap so it cannot pose as a plan.",
    },
  };

  var LOCALES = { INR: "en-IN", USD: "en-US", EUR: "de-DE", GBP: "en-GB" };

  function formatMoney(amount, currency) {
    if (!Number.isFinite(amount)) return "—";
    var whole = Math.abs(amount % 1) < 0.001;
    return new Intl.NumberFormat(LOCALES[currency] || "en-US", {
      style: "currency",
      currency: currency,
      maximumFractionDigits: whole ? 0 : 2,
    }).format(amount);
  }

  function capitalRequired(monthly, yieldPercent) {
    if (!Number.isFinite(monthly) || monthly <= 0) return null;
    if (!Number.isFinite(yieldPercent) || yieldPercent <= 0) return null;
    return (monthly * 12) / (yieldPercent / 100);
  }

  function clarityScore(data) {
    var score = 0;
    if (data.goal.monthlyAmount > 0) score += 20;
    if (String(data.goal.intent || "").trim()) score += 8;
    var counts = {
      S: data.tiers.S.strategies.length,
      A: data.tiers.A.strategies.length,
      B: data.tiers.B.strategies.length,
      C: data.tiers.C.strategies.length,
      D: data.tiers.D.strategies.length,
    };
    score += Math.min(3, counts.S) * 14;
    score += Math.min(3, counts.A) * 8;
    score += Math.min(3, counts.B) * 4;
    score += Math.min(2, counts.C) * 2;
    if (counts.D > 0) score += 10;
    if (counts.S > 0 && counts.D > 0) score += 8;
    return Math.min(100, score);
  }

  function rankFor(score) {
    if (score >= 85) {
      return { title: "Sovereign", line: "The best path is written, and the worst is named." };
    }
    if (score >= 65) {
      return { title: "Architect", line: "Capital has a shape. Keep refining the summit." };
    }
    if (score >= 45) {
      return { title: "Steward", line: "You are choosing growth over exhaustion." };
    }
    if (score >= 25) {
      return { title: "Apprentice", line: "The ladder is open. Write the next true move." };
    }
    return { title: "Seeker", line: "Begin with the amount, then the strategy worthy of it." };
  }

  function strategyCount(data) {
    return TIERS.reduce(function (sum, id) {
      return sum + data.tiers[id].strategies.length;
    }, 0);
  }

  function strategy(id, title, body) {
    var stamp = "2026-01-01T00:00:00.000Z";
    return { id: id, title: title, body: body, createdAt: stamp, updatedAt: stamp };
  }

  function seedData() {
    return {
      version: 1,
      goal: {
        monthlyAmount: 15000,
        currency: "INR",
        intent: "Monthly income I want to receive without spending my life",
        yieldPercent: 10,
        achieved: false,
        achievedAt: null,
        dedication: "Shrinjoy",
      },
      tiers: {
        S: {
          motto: "The best way. Capital works, and your life stays intact.",
          strategies: [
            strategy(
              "seed-s-portfolio",
              "A portfolio that pays the month",
              "Target the monthly figure as dividend and distribution income, not as wages. At about 10% a year, roughly twenty lakh rupees of sound, income-producing capital can carry fifteen thousand a month. The work is to assemble that base with care: quality assets, reinvestment, and protection of principal. You do the thinking. The capital keeps the promise.",
            ),
          ],
        },
        A: {
          motto: "Excellent leverage. Build what can fund the summit.",
          strategies: [
            strategy(
              "seed-a-skill",
              "One rare skill that funds the portfolio",
              "Become unusually good at work people gladly pay for, then price it so a portion of every month buys assets. The skill is the engine. The portfolio is the destination. This stays A-class while your time is still inside the income — and it moves toward S as the assets begin to pay you back.",
            ),
          ],
        },
        B: {
          motto: "Sound, and kind to the future self.",
          strategies: [
            strategy(
              "seed-b-bridge",
              "Dignified work, automatic surplus",
              "Hold a stable role that respects your health. Live a little under the cheque. Move a fixed share, every month, into the same ownership plan. This will not feel glamorous. It will not destroy you. It is a bridge with a direction.",
            ),
          ],
        },
        C: {
          motto: "Caution. The figure arrives. Growth does not.",
          strategies: [
            strategy(
              "seed-c-ceiling",
              "Covering the number and nothing else",
              "A post that pays exactly the monthly figure and leaves no surplus meets the target on paper and starves the future. Write those options here so the ceiling is visible. Use them only as a short bridge, never as the identity of the goal.",
            ),
          ],
        },
        D: {
          motto: "The fail path. Name it so it cannot pose as ambition.",
          strategies: [
            strategy(
              "seed-d-exhaustion",
              "Exhaustion hired to imitate progress",
              "Scraping the same monthly number through crushing, low-dignity labour — the kind of grind that spends the body to buy cash — is not a capital strategy. Nothing compounds. Health, time, and self-respect are the fee. Record it in D class so it cannot disguise itself as a plan. Refuse it with a clear head.",
            ),
          ],
        },
      },
    };
  }

  function isNonEmptyString(value) {
    return typeof value === "string" && value.length > 0;
  }

  function isStrategy(value) {
    return (
      value &&
      typeof value === "object" &&
      isNonEmptyString(value.id) &&
      typeof value.title === "string" &&
      typeof value.body === "string" &&
      typeof value.createdAt === "string" &&
      typeof value.updatedAt === "string"
    );
  }

  function isTier(value) {
    return (
      value &&
      typeof value === "object" &&
      typeof value.motto === "string" &&
      Array.isArray(value.strategies) &&
      value.strategies.every(isStrategy)
    );
  }

  function isAppData(value) {
    if (!value || value.version !== 1 || !value.goal || !value.tiers) return false;
    var goal = value.goal;
    if (!Number.isFinite(goal.monthlyAmount) || goal.monthlyAmount < 0) return false;
    if (CURRENCIES.indexOf(goal.currency) === -1) return false;
    if (typeof goal.intent !== "string") return false;
    if (!Number.isFinite(goal.yieldPercent) || goal.yieldPercent < 0) return false;
    if (typeof goal.achieved !== "boolean") return false;
    if (goal.achievedAt !== null && typeof goal.achievedAt !== "string") return false;
    if (typeof goal.dedication !== "string") return false;
    for (var i = 0; i < TIERS.length; i++) {
      if (!isTier(value.tiers[TIERS[i]])) return false;
    }
    return true;
  }

  function parseBackup(input) {
    var value = input;
    if (typeof input === "string") {
      try {
        value = JSON.parse(input);
      } catch (err) {
        return { ok: false };
      }
    }
    if (value && value.state && value.state.data) value = value.state.data;
    if (!isAppData(value)) return { ok: false };
    return { ok: true, data: structuredClone(value) };
  }

  function newId() {
    if (root.crypto && typeof root.crypto.randomUUID === "function") {
      return root.crypto.randomUUID();
    }
    return "id-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  root.AureumLedger = {
    TIERS: TIERS,
    CURRENCIES: CURRENCIES,
    TIER_META: TIER_META,
    formatMoney: formatMoney,
    capitalRequired: capitalRequired,
    clarityScore: clarityScore,
    rankFor: rankFor,
    strategyCount: strategyCount,
    seedData: seedData,
    parseBackup: parseBackup,
    newId: newId,
  };
})(typeof globalThis !== "undefined" ? globalThis : this);
