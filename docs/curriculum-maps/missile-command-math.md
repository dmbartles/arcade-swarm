# Missile Command Math — Curriculum Alignment Map

**Version:** 1.0
**Game:** Missile Command Math
**Source Brief:** `docs/briefs/missile-command-math.md` (v2.0)
**Source GDD:** `docs/gdds/missile-command-math.md` (v1.0)
**Target Grades:** 3–5 (ages 8–11)
**Standards Framework:** Common Core State Standards for Mathematics (CCSS-M)

---

## Table of Contents

1. [Overview](#1-overview)
2. [Grade 3 Alignment](#2-grade-3-alignment)
3. [Grade 4 Alignment](#3-grade-4-alignment)
4. [Grade 5 Alignment](#4-grade-5-alignment)
5. [Grade 2 Foundational Prerequisites](#5-grade-2-foundational-prerequisites)
6. [Skill Type API Contract](#6-skill-type-api-contract)
7. [Level-to-Skill Mapping](#7-level-to-skill-mapping)
8. [Difficulty Range by Skill Type](#8-difficulty-range-by-skill-type)
9. [Problem Format Specifications](#9-problem-format-specifications)
10. [Pacing and Sequencing Rules](#10-pacing-and-sequencing-rules)
11. [Answer Format Conventions](#11-answer-format-conventions)

---

## 1. Overview

Missile Command Math covers 17 distinct `skillType` values spanning CCSS-M standards from Grade 2 (foundational fluency) through Grade 5 (order of operations and enrichment). Each `skillType` maps to one or more CCSS standards, has a defined difficulty range, and follows a strict problem format. These `skillType` values form the API contract for `shared/math-engine/` — all code-level problem generation must reference these exact identifiers.

The game's 10 levels progressively unlock skill types across three broad grade bands:

| Grade Band | Levels | Primary Skills |
|------------|--------|----------------|
| Grade 2–3 foundations | 1–3 | Single-digit add/subtract, intro multiplication, two-digit operations |
| Grade 3–4 core | 4–6 | Multi-digit add/subtract, multiplication mastery, division, fractions |
| Grade 4–5 advanced | 7–10 | Multi-step problems, four-digit operations, square roots, mixed operations |

---

## 2. Grade 3 Alignment

### 2.1 Operations & Algebraic Thinking

#### CCSS.MATH.CONTENT.3.OA.C.7
**Standard:** Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `multiplication-intro` | Level 2 | Multiplication by 2, 5, and 10 only |
| `multiplication-full` | Level 3 | Full single-digit × single-digit (up to 12 × 12) |
| `division-basic` | Level 4 | Division facts within 100 (inverse of multiplication facts, no remainders) |

**Example Problems:**
- `multiplication-intro`: `6 × 5 = ?` → **30**; `10 × 4 = ?` → **40**; `2 × 9 = ?` → **18**
- `multiplication-full`: `8 × 7 = ?` → **56**; `9 × 6 = ?` → **54**; `12 × 11 = ?` → **132**
- `division-basic`: `56 ÷ 7 = ?` → **8**; `72 ÷ 9 = ?` → **8**; `45 ÷ 5 = ?` → **9**

---

### 2.2 Number & Operations in Base Ten

#### CCSS.MATH.CONTENT.3.NBT.A.2
**Standard:** Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `two-digit-addition-regroup` | Level 3 | Two-digit + two-digit requiring regrouping (carrying) |
| `two-digit-subtraction` | Level 3 | Two-digit − two-digit (may require borrowing) |

**Example Problems:**
- `two-digit-addition-regroup`: `47 + 38 = ?` → **85**; `59 + 26 = ?` → **85**; `68 + 47 = ?` → **115**
- `two-digit-subtraction`: `82 - 47 = ?` → **35**; `93 - 58 = ?` → **35**; `71 - 29 = ?` → **42**

---

### 2.3 Number & Operations — Fractions

#### CCSS.MATH.CONTENT.3.NF.A.1
**Standard:** Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `unit-fractions` | Level 5 | Finding a unit fraction of a whole number (½ of N, ⅓ of N, ¼ of N) where N divides evenly |

**Example Problems:**
- `unit-fractions`: `½ of 16 = ?` → **8**; `⅓ of 12 = ?` → **4**; `¼ of 20 = ?` → **5**

---

## 3. Grade 4 Alignment

### 3.1 Operations & Algebraic Thinking

#### CCSS.MATH.CONTENT.4.OA.A.3
**Standard:** Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `division-with-remainders` | Level 5 | Division with non-zero remainders; answer includes remainder |
| `multi-step-problems` | Level 7 | Expressions with two operations and parentheses |

**Example Problems:**
- `division-with-remainders`: `29 ÷ 4 = ?` → **7 R1**; `17 ÷ 3 = ?` → **5 R2**; `50 ÷ 8 = ?` → **6 R2**
- `multi-step-problems`: `(6 × 4) - 9 = ?` → **15**; `(8 + 5) × 2 = ?` → **26**; `(45 ÷ 9) + 7 = ?` → **12**

---

### 3.2 Number & Operations in Base Ten

#### CCSS.MATH.CONTENT.4.NBT.B.4
**Standard:** Fluently add and subtract multi-digit whole numbers using the standard algorithm.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `three-digit-addition` | Level 4 | Three-digit + three-digit (with or without regrouping) |
| `three-digit-subtraction` | Level 4 | Three-digit − three-digit (with or without borrowing) |
| `four-digit-addition` | Level 7 | Four-digit ± four-digit or four-digit ± three-digit |
| `four-digit-subtraction` | Level 7 | Four-digit − four-digit or four-digit − three-digit |

**Example Problems:**
- `three-digit-addition`: `256 + 178 = ?` → **434**; `305 + 497 = ?` → **802**
- `three-digit-subtraction`: `504 - 238 = ?` → **266**; `700 - 351 = ?` → **349**
- `four-digit-addition`: `1,247 + 856 = ?` → **2,103**; `3,456 + 1,789 = ?` → **5,245**
- `four-digit-subtraction`: `5,002 - 2,387 = ?` → **2,615**; `4,100 - 1,956 = ?` → **2,144**

---

### 3.3 Number & Operations — Fractions

#### CCSS.MATH.CONTENT.4.NF.A.1
**Standard:** Explain why a fraction a/b is equivalent to a fraction (n × a)/(n × b) by using visual fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `equivalent-fractions` | Level 6 | Multiplying a non-unit fraction by a whole number; identifying equivalent fraction results. Answer is always a whole number. |

**Example Problems:**
- `equivalent-fractions`: `¾ × 12 = ?` → **9**; `⅔ × 15 = ?` → **10**; `⅗ × 20 = ?` → **12**

---

## 4. Grade 5 Alignment

### 4.1 Operations & Algebraic Thinking

#### CCSS.MATH.CONTENT.5.OA.A.1
**Standard:** Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `mixed-operation-challenge` | Level 9 | Expressions combining 2–3 operations including parentheses, any of add/subtract/multiply/divide/square-root |

**Example Problems:**
- `mixed-operation-challenge`: `(√64) + (7 × 3) = ?` → **29**; `(12 ÷ 4) × (9 - 3) = ?` → **18**; `(√49) + 15 - 8 = ?` → **14**

---

### 4.2 Number & Operations in Base Ten (Enrichment)

#### CCSS.MATH.CONTENT.5.NBT (Enrichment / Extension)
**Note:** Perfect square roots are not explicitly required by CCSS Grade 5, but align with the spirit of 5.NBT (understanding the place value system) and serve as algebraic reasoning enrichment. Included in the game at Levels 8+ as an extension challenge.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `square-roots` | Level 8 | Square roots of perfect squares from 1 through 144 (√1 through √144) |

**Example Problems:**
- `square-roots`: `√81 = ?` → **9**; `√144 = ?` → **12**; `√49 = ?` → **7**; `√25 = ?` → **5**

---

## 5. Grade 2 Foundational Prerequisites

These skills are Grade 2 standards used in Levels 1–2 as warm-up / entry-level content. They provide accessibility for Grade 3 students who are still building fluency and serve as the introductory gameplay experience.

### 5.1 Operations & Algebraic Thinking

#### CCSS.MATH.CONTENT.2.OA.B.2
**Standard:** Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `single-digit-addition` | Level 1 | Addend + addend where both ≤ 12 and sum ≤ 20 |
| `single-digit-subtraction` | Level 1 | Minuend − subtrahend where minuend ≤ 20 and result ≥ 0 |

**Example Problems:**
- `single-digit-addition`: `7 + 8 = ?` → **15**; `9 + 6 = ?` → **15**; `4 + 3 = ?` → **7**
- `single-digit-subtraction`: `15 - 6 = ?` → **9**; `18 - 9 = ?` → **9**; `13 - 7 = ?` → **6**

---

### 5.2 Number & Operations in Base Ten

#### CCSS.MATH.CONTENT.2.NBT.B.5
**Standard:** Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction.

**Skill Types:**

| `skillType` | Introduced | Description |
|-------------|-----------|-------------|
| `two-digit-addition-no-regroup` | Level 2 | Two-digit + two-digit where no carrying is required |

**Example Problems:**
- `two-digit-addition-no-regroup`: `34 + 25 = ?` → **59**; `41 + 37 = ?` → **78**; `62 + 14 = ?` → **76**

---

## 6. Skill Type API Contract

The following table is the definitive list of `skillType` identifiers for `shared/math-engine/`. All values are **kebab-case**. The math engine must implement a problem generator and answer validator for each.

| # | `skillType` | CCSS Code(s) | Answer Type | Operand Count | Level Introduced |
|---|-------------|--------------|-------------|---------------|-----------------|
| 1 | `single-digit-addition` | 2.OA.B.2 | Integer | 2 | 1 |
| 2 | `single-digit-subtraction` | 2.OA.B.2 | Integer | 2 | 1 |
| 3 | `two-digit-addition-no-regroup` | 2.NBT.B.5 | Integer | 2 | 2 |
| 4 | `multiplication-intro` | 3.OA.C.7 | Integer | 2 | 2 |
| 5 | `multiplication-full` | 3.OA.C.7 | Integer | 2 | 3 |
| 6 | `two-digit-addition-regroup` | 3.NBT.A.2 | Integer | 2 | 3 |
| 7 | `two-digit-subtraction` | 3.NBT.A.2 | Integer | 2 | 3 |
| 8 | `three-digit-addition` | 4.NBT.B.4 | Integer | 2 | 4 |
| 9 | `three-digit-subtraction` | 4.NBT.B.4 | Integer | 2 | 4 |
| 10 | `division-basic` | 3.OA.C.7 | Integer | 2 | 4 |
| 11 | `division-with-remainders` | 4.OA.A.3 | Remainder | 2 | 5 |
| 12 | `unit-fractions` | 3.NF.A.1 | Integer | 2 | 5 |
| 13 | `equivalent-fractions` | 4.NF.A.1 | Integer | 2 | 6 |
| 14 | `multi-step-problems` | 4.OA.A.3 | Integer | 3 | 7 |
| 15 | `four-digit-addition` | 4.NBT.B.4 | Integer | 2 | 7 |
| 16 | `four-digit-subtraction` | 4.NBT.B.4 | Integer | 2 | 7 |
| 17 | `square-roots` | 5.NBT (enrichment) | Integer | 1 | 8 |
| 18 | `mixed-operation-challenge` | 5.OA.A.1 | Integer | 3+ | 9 |

**Answer Type Key:**
- **Integer** — A whole number. Displayed as a plain number in the answer queue.
- **Remainder** — A whole-number quotient with a remainder. Displayed as `Q R_R` format (e.g., `7 R1`) in the answer queue.

---

## 7. Level-to-Skill Mapping

This table defines exactly which `skillType` values are active in each level. The math engine draws from the level's active pool when generating the wave's problem set. Earlier levels' skill types persist into later levels to reinforce fluency.

| Level | Active `skillType` Values | New This Level | Problems in Wave |
|-------|--------------------------|----------------|-----------------|
| 1 | `single-digit-addition`, `single-digit-subtraction` | `single-digit-addition`, `single-digit-subtraction` | 10 |
| 2 | `single-digit-addition`, `single-digit-subtraction`, `two-digit-addition-no-regroup`, `multiplication-intro` | `two-digit-addition-no-regroup`, `multiplication-intro` | 12 |
| 3 | All Level 2 + `multiplication-full`, `two-digit-addition-regroup`, `two-digit-subtraction` | `multiplication-full`, `two-digit-addition-regroup`, `two-digit-subtraction` | 14 |
| 4 | All Level 3 + `three-digit-addition`, `three-digit-subtraction`, `division-basic` | `three-digit-addition`, `three-digit-subtraction`, `division-basic` | 16 |
| 5 | All Level 4 + `division-with-remainders`, `unit-fractions` | `division-with-remainders`, `unit-fractions` | 18 |
| 6 | All Level 5 + `equivalent-fractions` | `equivalent-fractions` | 20 |
| 7 | All Level 6 + `multi-step-problems`, `four-digit-addition`, `four-digit-subtraction` | `multi-step-problems`, `four-digit-addition`, `four-digit-subtraction` | 22 |
| 8 | All Level 7 + `square-roots` | `square-roots` | 24 |
| 9 | All Level 8 + `mixed-operation-challenge` | `mixed-operation-challenge` | 26 |
| 10 | All 18 skill types active | (none new — cumulative final challenge) | 28 |

**Distribution Rule:** When generating a wave's problem set, newly introduced skill types for that level should comprise **at least 25% but no more than 40%** of the wave's total problems. This ensures exposure to new content while reinforcing previously learned skills.

---

## 8. Difficulty Range by Skill Type

Each `skillType` has a defined operand range that constrains problem generation. These ranges ensure problems are age-appropriate and solvable within the time pressure of descending missiles.

| `skillType` | Operand A Range | Operand B Range | Answer Range | Constraints |
|-------------|----------------|----------------|--------------|-------------|
| `single-digit-addition` | 1–12 | 1–12 | 2–20 | Sum ≤ 20 |
| `single-digit-subtraction` | 2–20 | 1–12 | 0–19 | Result ≥ 0; minuend > subtrahend |
| `two-digit-addition-no-regroup` | 10–59 | 10–49 | 20–99 | No carrying in any column; sum ≤ 99 |
| `multiplication-intro` | 1–10 | {2, 5, 10} | 2–100 | Second operand restricted to 2, 5, or 10 |
| `multiplication-full` | 2–12 | 2–12 | 4–144 | Full multiplication table |
| `two-digit-addition-regroup` | 15–89 | 15–89 | 30–178 | At least one column requires carrying |
| `two-digit-subtraction` | 20–99 | 10–89 | 1–89 | Result > 0; minuend > subtrahend |
| `three-digit-addition` | 100–599 | 100–499 | 200–999 | — |
| `three-digit-subtraction` | 200–999 | 100–499 | 1–899 | Result > 0; minuend > subtrahend |
| `division-basic` | 4–100 | 2–12 | 1–12 | Operand A is the dividend; must divide evenly (remainder 0) |
| `division-with-remainders` | 10–99 | 2–9 | Quotient: 2–49; Remainder: 1–8 | Must have non-zero remainder |
| `unit-fractions` | {½, ⅓, ¼} | 4–24 | 1–12 | Operand B (the whole number) must divide evenly by the fraction's denominator |
| `equivalent-fractions` | {⅔, ¾, ⅗, ⅘, ⅜} | 8–30 | 3–24 | Operand B (the whole number) must produce a whole-number result |
| `multi-step-problems` | Varies per operation | Varies per operation | 1–100 | Always exactly 2 operations; one pair of parentheses; answer is always a positive integer |
| `four-digit-addition` | 1,000–5,000 | 500–4,999 | 1,500–9,999 | — |
| `four-digit-subtraction` | 1,500–9,999 | 500–4,999 | 1–9,499 | Result > 0; minuend > subtrahend |
| `square-roots` | {1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144} | n/a | 1–12 | Input is always a perfect square; answer is the root |
| `mixed-operation-challenge` | Varies | Varies | 1–100 | 2–3 operations; may include √; answer is always a positive integer; parentheses required |

---

## 9. Problem Format Specifications

All problems are **single-expression format** — no word problems, no text beyond mathematical notation. Reading skill must never gate math skill.

### 9.1 Standard Display Formats

| `skillType` | Display Format | Example |
|-------------|---------------|---------|
| `single-digit-addition` | `A + B = ?` | `7 + 8 = ?` |
| `single-digit-subtraction` | `A - B = ?` | `15 - 6 = ?` |
| `two-digit-addition-no-regroup` | `A + B = ?` | `34 + 25 = ?` |
| `multiplication-intro` | `A × B = ?` | `6 × 5 = ?` |
| `multiplication-full` | `A × B = ?` | `8 × 7 = ?` |
| `two-digit-addition-regroup` | `A + B = ?` | `47 + 38 = ?` |
| `two-digit-subtraction` | `A - B = ?` | `82 - 47 = ?` |
| `three-digit-addition` | `A + B = ?` | `256 + 178 = ?` |
| `three-digit-subtraction` | `A - B = ?` | `504 - 238 = ?` |
| `division-basic` | `A ÷ B = ?` | `56 ÷ 7 = ?` |
| `division-with-remainders` | `A ÷ B = ?` | `29 ÷ 4 = ?` |
| `unit-fractions` | `F of N = ?` | `½ of 16 = ?` |
| `equivalent-fractions` | `F × N = ?` | `¾ × 12 = ?` |
| `multi-step-problems` | `(A ○ B) ○ C = ?` | `(6 × 4) - 9 = ?` |
| `four-digit-addition` | `A + B = ?` | `1,247 + 856 = ?` |
| `four-digit-subtraction` | `A - B = ?` | `5,002 - 2,387 = ?` |
| `square-roots` | `√A = ?` | `√81 = ?` |
| `mixed-operation-challenge` | `(expr) ○ (expr) = ?` | `(√64) + (7 × 3) = ?` |

### 9.2 Fraction Display Convention

Fractions should be rendered using **stacked notation** (numerator above denominator with a horizontal bar) when screen space permits. On missile bodies where vertical space is limited, **inline notation** (e.g., `3/4 × 12`) is acceptable as a fallback. The math engine should output fractions in a structured format (numerator, denominator) and let the renderer decide display style.

### 9.3 Comma Formatting

Numbers 1,000 and above should include comma separators in the problem display (e.g., `1,247 + 856`). The math engine should output raw integers; comma formatting is a display concern.

### 9.4 MIRV Problem Constraints

When generating problems for MIRV threats:
- The **parent missile** problem should be drawn from the level's more advanced skill types.
- The **child warhead** problems (post-split) must be drawn from **simpler** skill types than the parent — specifically, from skill types introduced at least 2 levels earlier than the current level. This rewards early interception.

### 9.5 Bomber Problem Constraints

The bomber's fuselage problem may be drawn from any active skill type for the current level. Its answer must match one of the next 3 rounds visible in the answer queue, enabling strategic planning.

---

## 10. Pacing and Sequencing Rules

These rules govern how the math engine interacts with the game's difficulty progression to maintain pedagogical integrity.

### 10.1 New Skill Introduction Rule ("Fractions Rule")

When a level introduces a new `skillType`, the following constraints apply:
- The total threat count for that level is held at the **same maximum simultaneous count** as the previous level (never increased on the same level that introduces new math).
- New skill type problems are introduced **slowly**: the first 2–3 problems of the new type appear with the slowest missile speed for that level.
- New skill types should appear **one at a time** in the early portion of the wave, not simultaneously with other new-type problems.

### 10.2 Cumulative Reinforcement

Every level's problem pool includes all previously introduced skill types. The distribution should follow:
- **25–40% new skill types** (when any are introduced that level)
- **60–75% previously mastered skill types** (reinforcement)
- Level 10 (no new types): distribute evenly across all 18 skill types with slight weighting toward the most recently introduced types.

### 10.3 Answer Uniqueness

Within a single wave's answer queue, **all answers should be unique** wherever possible. If the problem count exceeds the feasible range of unique answers for active skill types, duplicates are permitted but should be minimized. Duplicate answers must never appear for simultaneously visible missiles (to prevent ambiguity about which missile to target).

### 10.4 Pre-Generation Requirement

The entire problem set and answer queue for a wave **must be generated before the wave starts**. The queue is shuffled once. No problems are generated mid-wave. The wave is always 100% solvable if the player fires in the correct sequence.

### 10.5 Difficulty Selector Independence

The Easy / Normal / Hard difficulty selector affects **missile descent speed only**. It does **not** change which skill types appear per level, the number of problems, or the operand ranges. This preserves curriculum alignment regardless of difficulty setting, enabling teachers to observe consistent math content across all students.

---

## 11. Answer Format Conventions

These conventions define how answers appear in the answer queue strip, ensuring consistency between problem generation and queue display.

| Answer Type | Queue Display | Example |
|-------------|--------------|---------|
| Integer (all standard operations) | Plain number | `56`, `434`, `2103` |
| Integer ≥ 1,000 | Number with comma | `2,103` |
| Remainder (division-with-remainders only) | `Q R_R` format | `7 R1` |

**Critical Note on Remainders:** The `division-with-remainders` skill type is the only type that produces non-integer answer displays. The queue must support this format. If this creates UX complications, an alternative is to restrict `division-with-remainders` to only produce problems where the answer presented in the queue is the **quotient only** (e.g., `7`) with a visual indicator that a remainder exists. This is flagged as an open design question in the GDD (Question #6).

---

*End of Curriculum Alignment Map — Missile Command Math v1.0*
