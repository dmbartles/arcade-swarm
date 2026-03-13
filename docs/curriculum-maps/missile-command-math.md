# Missile Command Math — Curriculum Alignment Map

**Version:** 1.0
**Game:** Missile Command Math
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Source GDD:** `docs/gdds/missile-command-math.md` (v1.0)
**Standards Framework:** Common Core State Standards for Mathematics (CCSS-M)
**Target Grades:** 3–5 (ages 8–11)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Skill Type Registry (API Contract)](#2-skill-type-registry-api-contract)
3. [Grade 3 Alignment](#3-grade-3-alignment)
4. [Grade 4 Alignment](#4-grade-4-alignment)
5. [Grade 5 Alignment](#5-grade-5-alignment)
6. [Supporting Standards (Grade 2 Foundations)](#6-supporting-standards-grade-2-foundations)
7. [Level-by-Level Skill Activation Map](#7-level-by-level-skill-activation-map)
8. [Difficulty Ranges & Operand Constraints](#8-difficulty-ranges--operand-constraints)
9. [Problem Distribution Rules](#9-problem-distribution-rules)
10. [MIRV & Bomber Problem Constraints](#10-mirv--bomber-problem-constraints)
11. [Answer Format Rules](#11-answer-format-rules)

---

## 1. Overview

Missile Command Math covers 18 distinct math skill types spanning CCSS-M grades 2–5. Skills are introduced progressively across 10 game levels. The game's difficulty selector (Easy / Normal / Hard) affects only missile descent speed — it does **not** alter math content, problem count, or operand ranges. This ensures curriculum alignment is consistent regardless of the player's chosen difficulty, enabling predictable use in classroom settings.

All `skillType` values defined in this document are the **API contract** for `shared/math-engine/`. The math engine must be able to generate problems and validated answers for every `skillType` listed here, within the operand ranges and constraints specified.

---

## 2. Skill Type Registry (API Contract)

These are the canonical `skillType` identifiers (kebab-case) that the math engine must implement. Each `skillType` is a unique string used to request problem generation.

| # | `skillType` | Short Description | Answer Type | Level Introduced |
|---|-------------|-------------------|-------------|------------------|
| 1 | `single-digit-addition` | Add two numbers, sum ≤ 20 | Integer | 1 |
| 2 | `single-digit-subtraction` | Subtract within 20, result ≥ 0 | Integer | 1 |
| 3 | `two-digit-addition-no-regroup` | Add two 2-digit numbers, no carrying | Integer | 2 |
| 4 | `multiplication-intro` | Multiply by 2, 5, or 10 | Integer | 2 |
| 5 | `multiplication-full` | Full 12×12 multiplication table | Integer | 3 |
| 6 | `two-digit-addition-regroup` | Add two 2-digit numbers with carrying | Integer | 3 |
| 7 | `two-digit-subtraction` | Subtract two 2-digit numbers | Integer | 3 |
| 8 | `three-digit-addition` | Add two 3-digit numbers | Integer | 4 |
| 9 | `three-digit-subtraction` | Subtract two 3-digit numbers | Integer | 4 |
| 10 | `division-basic` | Divide evenly within 100 | Integer | 4 |
| 11 | `division-with-remainders` | Divide with non-zero remainder | Remainder format (`Q R_R`) | 5 |
| 12 | `unit-fractions` | Find a unit fraction of a whole number | Integer | 5 |
| 13 | `equivalent-fractions` | Multiply a non-unit fraction by a whole number | Integer | 6 |
| 14 | `multi-step-problems` | Two operations with parentheses | Integer | 7 |
| 15 | `four-digit-addition` | Add two numbers in the thousands | Integer | 7 |
| 16 | `four-digit-subtraction` | Subtract two numbers in the thousands | Integer | 7 |
| 17 | `square-roots` | Square root of a perfect square (1–144) | Integer | 8 |
| 18 | `mixed-operation-challenge` | 2–3 operations, may include √ and parentheses | Integer | 9 |

---

## 3. Grade 3 Alignment

Grade 3 is the primary entry point. Players at this level are expected to play Levels 1–5 comfortably on Easy difficulty (0.7× speed).

### 3.1 CCSS Standards Covered

#### 3.OA.C.7 — Fluently multiply and divide within 100

> *Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `multiplication-intro` | 2 | `6 × 5 = ?` | `30` |
| `multiplication-full` | 3 | `8 × 7 = ?` | `56` |
| `division-basic` | 4 | `56 ÷ 7 = ?` | `8` |

**Difficulty range:** Operands 1–12 (multiplication); dividend 4–100, divisor 2–12 (division). Division problems must divide evenly (no remainder).

**Example problem formats:**
- `A × B = ?` where A ∈ [1, 10], B ∈ {2, 5, 10} (intro)
- `A × B = ?` where A ∈ [2, 12], B ∈ [2, 12] (full)
- `A ÷ B = ?` where A ∈ [4, 100], B ∈ [2, 12], A mod B = 0

---

#### 3.NBT.A.2 — Fluently add and subtract within 1000

> *Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `two-digit-addition-regroup` | 3 | `47 + 38 = ?` | `85` |
| `two-digit-subtraction` | 3 | `82 − 47 = ?` | `35` |

**Difficulty range:** Operands for addition: 15–89 (at least one column requires carrying); subtraction: minuend 20–99, subtrahend 10–89, result > 0.

**Example problem formats:**
- `A + B = ?` where A ∈ [15, 89], B ∈ [15, 89], at least one column carries
- `A − B = ?` where A ∈ [20, 99], B ∈ [10, 89], A > B

---

#### 3.NF.A.1 — Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts

> *Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `unit-fractions` | 5 | `½ of 16 = ?` | `8` |

**Difficulty range:** Fractions ∈ {½, ⅓, ¼}. Whole number operand ∈ [4, 24]. The whole number must be evenly divisible by the fraction's denominator. Answer is always a whole integer.

**Example problem formats:**
- `½ of B = ?` where B is even, B ∈ [4, 24]
- `⅓ of B = ?` where B is divisible by 3, B ∈ [6, 24]
- `¼ of B = ?` where B is divisible by 4, B ∈ [4, 24]

---

### 3.2 Grade 3 Summary

| CCSS Code | Standard Short Name | Skill Types | Levels Active |
|-----------|---------------------|-------------|---------------|
| 3.OA.C.7 | Multiply and divide within 100 | `multiplication-intro`, `multiplication-full`, `division-basic` | 2–10 |
| 3.NBT.A.2 | Add and subtract within 1000 | `two-digit-addition-regroup`, `two-digit-subtraction` | 3–10 |
| 3.NF.A.1 | Understand unit fractions | `unit-fractions` | 5–10 |

---

## 4. Grade 4 Alignment

Grade 4 is the core target grade. Players at this level are expected to engage with Levels 1–7 on Normal difficulty (1.0× speed).

### 4.1 CCSS Standards Covered

#### 4.OA.A.3 — Solve multistep word problems; interpret remainders

> *Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `division-with-remainders` | 5 | `29 ÷ 4 = ?` | `7 R1` |
| `multi-step-problems` | 7 | `(6 × 4) − 9 = ?` | `15` |

**Difficulty range for `division-with-remainders`:** Dividend ∈ [10, 99], divisor ∈ [2, 9], must produce a non-zero remainder (R ∈ [1, 8]), quotient ∈ [2, 49].

**Difficulty range for `multi-step-problems`:** Two operations, one set of parentheses, all intermediate and final results are positive integers ≤ 100. Operations drawn from {+, −, ×, ÷}. Division within multi-step must divide evenly.

**Example problem formats:**
- `A ÷ B = ?` where A mod B ≠ 0, answer displayed as `Q R_R`
- `(A × B) − C = ?` where result > 0
- `(A + B) × C = ?`
- `A × (B − C) = ?`

---

#### 4.NBT.B.4 — Fluently add and subtract multi-digit whole numbers

> *Fluently add and subtract multi-digit whole numbers using the standard algorithm.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `three-digit-addition` | 4 | `256 + 178 = ?` | `434` |
| `three-digit-subtraction` | 4 | `504 − 238 = ?` | `266` |
| `four-digit-addition` | 7 | `1,247 + 856 = ?` | `2,103` |
| `four-digit-subtraction` | 7 | `3,402 − 1,587 = ?` | `1,815` |

**Difficulty ranges:**
- 3-digit addition: A ∈ [100, 599], B ∈ [100, 499], sum ∈ [200, 999]
- 3-digit subtraction: A ∈ [200, 999], B ∈ [100, 499], result > 0
- 4-digit addition: A ∈ [1,000–5,000], B ∈ [500–4,999], sum ∈ [1,500–9,999]
- 4-digit subtraction: A ∈ [1,500–9,999], B ∈ [500–4,999], result > 0, A > B

**Example problem formats:**
- `256 + 178 = ?`
- `504 − 238 = ?`
- `1,247 + 856 = ?`
- `3,402 − 1,587 = ?`

---

#### 4.NF.A.1 — Explain why a fraction a/b is equivalent to (n×a)/(n×b); generate equivalent fractions

> *Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models. Use this principle to recognize and generate equivalent fractions.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `equivalent-fractions` | 6 | `¾ × 12 = ?` | `9` |

**Difficulty range:** Fraction ∈ {⅔, ¾, ⅗, ⅘, ⅜}. Whole number operand ∈ [8, 30]. The product must be a whole number (operand must be divisible by the denominator). Answer ∈ [3, 24].

**Example problem formats:**
- `¾ × 12 = ?` → `9`
- `⅔ × 18 = ?` → `12`
- `⅗ × 20 = ?` → `12`
- `⅜ × 24 = ?` → `9`

---

### 4.2 Grade 4 Summary

| CCSS Code | Standard Short Name | Skill Types | Levels Active |
|-----------|---------------------|-------------|---------------|
| 4.OA.A.3 | Multistep problems; interpret remainders | `division-with-remainders`, `multi-step-problems` | 5–10 |
| 4.NBT.B.4 | Add and subtract multi-digit numbers | `three-digit-addition`, `three-digit-subtraction`, `four-digit-addition`, `four-digit-subtraction` | 4–10 |
| 4.NF.A.1 | Equivalent fractions | `equivalent-fractions` | 6–10 |

---

## 5. Grade 5 Alignment

Grade 5 represents the upper end of the target range. Players at this level are expected to complete all 10 levels on Normal or Hard difficulty.

### 5.1 CCSS Standards Covered

#### 5.OA.A.1 — Use parentheses, brackets, or braces in numerical expressions and evaluate them

> *Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `mixed-operation-challenge` | 9 | `(√64) + (7 × 3) = ?` | `29` |

**Difficulty range:** 2–3 operations drawn from {+, −, ×, ÷, √}. Parentheses required. May include a square root sub-expression. All intermediate and final results are positive integers ≤ 100.

**Example problem formats:**
- `(√64) + (7 × 3) = ?` → `29`
- `(8 × 5) − (√49) = ?` → `33`
- `(36 ÷ 4) + (3 × 7) = ?` → `30`
- `(√121) × 3 − 9 = ?` → `24`

---

#### 5.NBT (Enrichment) — Understand the place value system

> *Note: `square-roots` is classified as enrichment/extension content. It does not map to a single specific 5th-grade standard but extends place-value and number-sense understanding. Perfect squares ≤ 144 are used as an accessible entry point to the concept.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `square-roots` | 8 | `√81 = ?` | `9` |

**Difficulty range:** Operand ∈ {1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144} (all perfect squares with integer roots 1–12). Answer ∈ [1, 12].

**Example problem formats:**
- `√81 = ?` → `9`
- `√144 = ?` → `12`
- `√25 = ?` → `5`
- `√1 = ?` → `1`

---

### 5.2 Grade 5 Summary

| CCSS Code | Standard Short Name | Skill Types | Levels Active |
|-----------|---------------------|-------------|---------------|
| 5.OA.A.1 | Evaluate expressions with parentheses | `mixed-operation-challenge` | 9–10 |
| 5.NBT (enrichment) | Place value / number sense extension | `square-roots` | 8–10 |

---

## 6. Supporting Standards (Grade 2 Foundations)

Levels 1–2 include foundational skills aligned to Grade 2 standards. These serve as warm-up content for Grade 3 students and remain present as reinforcement throughout all 10 levels.

### 6.1 CCSS Standards Covered

#### 2.OA.B.2 — Fluently add and subtract within 20

> *Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `single-digit-addition` | 1 | `7 + 8 = ?` | `15` |
| `single-digit-subtraction` | 1 | `15 − 6 = ?` | `9` |

**Difficulty range:** Addition operands ∈ [1, 12], sum ≤ 20. Subtraction minuend ∈ [2, 20], subtrahend ∈ [1, 12], result ≥ 0, minuend > subtrahend.

**Example problem formats:**
- `7 + 8 = ?` → `15`
- `3 + 9 = ?` → `12`
- `15 − 6 = ?` → `9`
- `11 − 4 = ?` → `7`

---

#### 2.NBT.B.5 — Fluently add and subtract within 100

> *Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction.*

**Skill types serving this standard:**

| `skillType` | Level Introduced | Example Problem | Example Answer |
|-------------|------------------|-----------------|----------------|
| `two-digit-addition-no-regroup` | 2 | `34 + 25 = ?` | `59` |

**Difficulty range:** Operands A ∈ [10, 59], B ∈ [10, 49]. No carrying required (ones digits sum ≤ 9, tens digits sum ≤ 9). Sum ∈ [20, 99].

**Example problem formats:**
- `34 + 25 = ?` → `59`
- `41 + 32 = ?` → `73`
- `53 + 16 = ?` → `69`

---

### 6.2 Grade 2 (Foundations) Summary

| CCSS Code | Standard Short Name | Skill Types | Levels Active |
|-----------|---------------------|-------------|---------------|
| 2.OA.B.2 | Add and subtract within 20 | `single-digit-addition`, `single-digit-subtraction` | 1–10 |
| 2.NBT.B.5 | Add and subtract within 100 | `two-digit-addition-no-regroup` | 2–10 |

---

## 7. Level-by-Level Skill Activation Map

This table defines exactly which `skillType` values are active (available for problem generation) at each level. The math engine must use this map to build wave problem sets.

| Level | Year | Newly Introduced Skill Types | All Active Skill Types |
|-------|------|------------------------------|------------------------|
| 1 | 1981 | `single-digit-addition`, `single-digit-subtraction` | `single-digit-addition`, `single-digit-subtraction` |
| 2 | 1982 | `two-digit-addition-no-regroup`, `multiplication-intro` | + `two-digit-addition-no-regroup`, `multiplication-intro` |
| 3 | 1982 | `multiplication-full`, `two-digit-addition-regroup`, `two-digit-subtraction` | + `multiplication-full`, `two-digit-addition-regroup`, `two-digit-subtraction` |
| 4 | 1983 | `three-digit-addition`, `three-digit-subtraction`, `division-basic` | + `three-digit-addition`, `three-digit-subtraction`, `division-basic` |
| 5 | 1984 | `division-with-remainders`, `unit-fractions` | + `division-with-remainders`, `unit-fractions` |
| 6 | 1984 | `equivalent-fractions` | + `equivalent-fractions` |
| 7 | 1984 | `multi-step-problems`, `four-digit-addition`, `four-digit-subtraction` | + `multi-step-problems`, `four-digit-addition`, `four-digit-subtraction` |
| 8 | 1985 | `square-roots` | + `square-roots` |
| 9 | 1985 | `mixed-operation-challenge` | + `mixed-operation-challenge` (all 18 active) |
| 10 | 1986 | *(none — all 18 already active)* | All 18 skill types |

### 7.1 Problems Per Wave

| Level | Total Problems in Wave |
|-------|----------------------|
| 1 | 10 |
| 2 | 12 |
| 3 | 14 |
| 4 | 16 |
| 5 | 18 |
| 6 | 20 |
| 7 | 22 |
| 8 | 24 |
| 9 | 26 |
| 10 | 28 |

---

## 8. Difficulty Ranges & Operand Constraints

The following table defines the complete operand constraints for each `skillType`. The math engine must enforce these ranges during problem generation.

| `skillType` | Operand A Range | Operand B Range | Answer Range | Constraints |
|-------------|----------------|----------------|--------------|-------------|
| `single-digit-addition` | 1–12 | 1–12 | 2–20 | Sum ≤ 20 |
| `single-digit-subtraction` | 2–20 | 1–12 | 0–19 | A > B; result ≥ 0 |
| `two-digit-addition-no-regroup` | 10–59 | 10–49 | 20–99 | No carrying in any column; sum ≤ 99 |
| `multiplication-intro` | 1–10 | {2, 5, 10} | 2–100 | B restricted to exactly 2, 5, or 10 |
| `multiplication-full` | 2–12 | 2–12 | 4–144 | Full table |
| `two-digit-addition-regroup` | 15–89 | 15–89 | 30–178 | At least one column requires carrying |
| `two-digit-subtraction` | 20–99 | 10–89 | 1–89 | A > B; result > 0 |
| `three-digit-addition` | 100–599 | 100–499 | 200–999 | Sum ≤ 999 |
| `three-digit-subtraction` | 200–999 | 100–499 | 1–899 | A > B; result > 0 |
| `division-basic` | 4–100 | 2–12 | 1–12 | A mod B = 0 (divides evenly) |
| `division-with-remainders` | 10–99 | 2–9 | Q: 2–49, R: 1–8 | A mod B ≠ 0 (must have non-zero remainder) |
| `unit-fractions` | {½, ⅓, ¼} (fraction) | 4–24 (whole number) | 1–12 | Whole number must be evenly divisible by denominator |
| `equivalent-fractions` | {⅔, ¾, ⅗, ⅘, ⅜} (fraction) | 8–30 (whole number) | 3–24 | Product must be a whole number |
| `multi-step-problems` | Varies | Varies | 1–100 | 2 operations; 1 set of parentheses; ops from {+, −, ×, ÷}; division must divide evenly; all intermediates and final answer are positive integers |
| `four-digit-addition` | 1,000–5,000 | 500–4,999 | 1,500–9,999 | — |
| `four-digit-subtraction` | 1,500–9,999 | 500–4,999 | 1–9,499 | A > B; result > 0 |
| `square-roots` | {1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144} | n/a | 1–12 | Perfect squares only |
| `mixed-operation-challenge` | Varies | Varies | 1–100 | 2–3 operations; ops from {+, −, ×, ÷, √}; parentheses required; may include √ sub-expression; all intermediates and final answer are positive integers |

---

## 9. Problem Distribution Rules

These rules govern how the math engine should compose each wave's problem set.

### 9.1 New vs. Reinforcement Ratio

- **Newly introduced skill types** (introduced at the current level): **25–40%** of the wave's total problems.
- **Previously mastered skill types** (introduced at earlier levels): **60–75%** of the wave's total problems (reinforcement).

### 9.2 Level 10 Distribution

- Level 10 distributes problems approximately evenly across all 18 skill types.
- Slight weighting (1.5×) toward the most recently introduced types (`square-roots`, `mixed-operation-challenge`).

### 9.3 Fractions Pacing Rule

When a level introduces a new `skillType`:
1. The max simultaneous threat count is held at the **same value** as the previous level (never increased on the same level that introduces new math).
2. The first 2–3 problems of the new type appear on the **slowest missiles** in the wave.
3. New skill type problems appear **one at a time** in the early portion of the wave, not simultaneously with other problems of the same new type.

### 9.4 Answer Uniqueness

- All answers within a single wave must be **unique** wherever possible.
- **Critical rule:** Duplicate answers must **never** appear on simultaneously visible missiles. If two problems yield the same answer, they must be scheduled with sufficient temporal separation.

### 9.5 Pre-Generation Requirement

The entire problem set and shuffled answer queue for a wave is generated **before** the wave starts. No problems are generated mid-wave. The wave is always 100% solvable if the player fires answers in the correct sequence.

---

## 10. MIRV & Bomber Problem Constraints

### 10.1 MIRV Child Problems

- MIRV child warhead problems must be drawn from skill types introduced **at least 2 levels before** the current level.
- Child problems should be **simpler** than the parent missile's problem (lower operand ranges within the same skill type, or a skill type from an earlier level).
- This rewards early interception while ensuring that if the split occurs, children are manageable.

**Example:** On Level 8, the parent MIRV may carry a `square-roots` problem (`√81 = ?`). If it splits, the 3 child warheads carry problems from skill types introduced at Level 6 or earlier (e.g., `single-digit-addition`, `multiplication-full`, `two-digit-subtraction`).

### 10.2 Bomber Fuselage Problems

- The bomber's fuselage problem answer must match one of the **next 3 positions** in the answer queue (enabling the player to plan ahead).
- Bomber problems may be drawn from any active skill type for the current level.
- There is no operand restriction beyond the standard constraints for the chosen skill type.

---

## 11. Answer Format Rules

These rules define how answers are displayed in the answer queue and how the math engine should format returned values.

| `skillType` | Display Format | Example |
|-------------|---------------|---------|
| All integer-answer types | Plain integer | `56`, `434`, `9` |
| Integers ≥ 1,000 | Comma-separated | `2,103` |
| `division-with-remainders` | `Q R_R` format (quotient, space, "R", remainder) | `7 R1` |
| `square-roots` | Problem displays `√N`; answer is plain integer | Problem: `√81`, Answer: `9` |
| `unit-fractions` | Problem displays `½ of N` or `⅓ of N`; answer is plain integer | Problem: `½ of 16`, Answer: `8` |
| `equivalent-fractions` | Problem displays `¾ × N`; answer is plain integer | Problem: `¾ × 12`, Answer: `9` |
| `multi-step-problems` | Problem displays full expression with parentheses; answer is plain integer | Problem: `(6 × 4) − 9`, Answer: `15` |
| `mixed-operation-challenge` | Problem displays full expression with parentheses and any √; answer is plain integer | Problem: `(√64) + (7 × 3)`, Answer: `29` |

### 11.1 Fraction Rendering

- On missile bodies where space permits, fractions are rendered in **stacked notation** (numerator over denominator with a horizontal bar).
- Fallback for limited space: **inline notation** (e.g., `3/4 × 12`).
- The math engine returns fractions in inline string format; the rendering layer handles visual presentation.

---

## Appendix A: Full CCSS Standard Cross-Reference

| CCSS Code | Full Standard Text (Abbreviated) | Skill Types | Grade |
|-----------|----------------------------------|-------------|-------|
| 2.OA.B.2 | Fluently add and subtract within 20 using mental strategies | `single-digit-addition`, `single-digit-subtraction` | 2 |
| 2.NBT.B.5 | Fluently add and subtract within 100 | `two-digit-addition-no-regroup` | 2 |
| 3.OA.C.7 | Fluently multiply and divide within 100 | `multiplication-intro`, `multiplication-full`, `division-basic` | 3 |
| 3.NBT.A.2 | Fluently add and subtract within 1000 | `two-digit-addition-regroup`, `two-digit-subtraction` | 3 |
| 3.NF.A.1 | Understand unit fractions (1/b) | `unit-fractions` | 3 |
| 4.OA.A.3 | Solve multistep problems; interpret remainders | `division-with-remainders`, `multi-step-problems` | 4 |
| 4.NBT.B.4 | Fluently add and subtract multi-digit whole numbers | `three-digit-addition`, `three-digit-subtraction`, `four-digit-addition`, `four-digit-subtraction` | 4 |
| 4.NF.A.1 | Equivalent fractions | `equivalent-fractions` | 4 |
| 5.OA.A.1 | Evaluate expressions with parentheses, brackets, or braces | `mixed-operation-challenge` | 5 |
| 5.NBT (enrichment) | Understand the place value system (extension) | `square-roots` | 5 |

---

## Appendix B: Grade-Level Play Expectations

This appendix maps expected comfortable play ranges by grade level to help teachers assign appropriate starting points.

| Grade | Comfortable Levels | Recommended Difficulty | Key Standards Practiced |
|-------|-------------------|----------------------|------------------------|
| 3 | Levels 1–5 | Easy (0.7×) | 2.OA.B.2, 2.NBT.B.5, 3.OA.C.7, 3.NBT.A.2, 3.NF.A.1 |
| 4 | Levels 1–7 | Normal (1.0×) | All Grade 3 standards + 4.OA.A.3, 4.NBT.B.4, 4.NF.A.1 |
| 5 | Levels 1–10 | Normal or Hard (1.0×–1.3×) | All standards including 5.OA.A.1, 5.NBT (enrichment) |

**Note:** Difficulty selector affects missile descent speed only. Math content is identical across Easy, Normal, and Hard for any given level. Teachers can confidently assign the same level to students at different difficulties knowing the curriculum content is unchanged.

---

*End of Curriculum Alignment Map — Missile Command Math v1.0*
