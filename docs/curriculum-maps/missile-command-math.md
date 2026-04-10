# Curriculum Map — Missile Command Math

## Skill Types (API Contract)
<!-- Master list of skillType values this game uses. These are the exact strings
     passed to generateProblem({ skillType }). Do not change these after the
     Math Engine agent has started work. -->
| skillType (kebab-case) | Grade | CCSS Code | Description |
|------------------------|-------|-----------|-------------|
| `single-digit-addition` | 2 | 2.OA.B.2 | Add two single-digit numbers; sums ≤ 18 |
| `single-digit-subtraction` | 2 | 2.OA.B.2 | Subtract single-digit from number ≤ 18; non-negative result |
| `two-digit-addition-no-regroup` | 2 | 2.NBT.B.5 | Add two 2-digit numbers; no carrying required |
| `two-digit-subtraction-no-regroup` | 2 | 2.NBT.B.5 | Subtract 2-digit from 2-digit; no borrowing required |
| `two-digit-addition-regroup` | 3 | 3.NBT.A.2 | Add two 2-digit numbers; ones column carries |
| `two-digit-subtraction-regroup` | 3 | 3.NBT.A.2 | Subtract 2-digit from 2-digit; borrowing required |
| `multiplication-easy-facts` | 3 | 3.OA.C.7 | Multiply using ×2, ×5, ×10 facts only |
| `multiplication-mid-facts` | 3 | 3.OA.C.7 | Multiply using ×3, ×4, ×6 facts (includes prior easy facts) |
| `multiplication-full-facts` | 3 | 3.OA.C.7 | Full 12×12 multiplication table |
| `three-digit-addition` | 4 | 4.NBT.B.4 | Add two 3-digit numbers; carrying across columns |
| `three-digit-subtraction` | 4 | 4.NBT.B.4 | Subtract 3-digit from 3-digit; borrowing across columns |
| `division-basic-facts` | 3 | 3.OA.C.7 | Divide using basic fact families (no remainder); quotients ≤ 12 |
| `division-with-remainder` | 4 | 4.OA.A.3 | Divide with whole-number remainder; express as `Q R r` |
| `unit-fraction-of-number` | 3 | 3.NF.A.1 | Unit fraction (½, ¼, ⅓, ⅕) of a whole number |
| `fraction-of-number` | 4 | 4.NF.A.1 | Non-unit fraction (e.g. ¾) of a whole number; integer result |
| `multi-step-expression` | 4 | 4.OA.A.3 | Two-operation expression with parentheses; integer result |
| `square-root-perfect` | 5 | 5.NBT.A.2† | Square root of a perfect square ≤ 144 |
| `mixed-operations` | 5 | 5.OA.A.1 | Mixed single-expression combining ≥ 2 operation types |

## Grade-Level Skill Table
<!-- One row per grade × skillType combination; levels shown are first-introduction levels -->
| Grade | skillType | Difficulty Min | Difficulty Max | Problem Format | Distractor Strategy |
|-------|-----------|---------------|---------------|----------------|---------------------|
| 2 | `single-digit-addition` | 1 | 2 | `A + B = ?`, A∈[1,9], B∈[1,9], sum≤18 | near-miss (±1 sum) |
| 2 | `single-digit-subtraction` | 1 | 2 | `A − B = ?`, A∈[6,18], B∈[1,9], A>B | near-miss (±1 difference) |
| 2 | `two-digit-addition-no-regroup` | 2 | 3 | `AB + CD = ?`, ones digits sum ≤ 9 | swap tens/ones digit |
| 2 | `two-digit-subtraction-no-regroup` | 2 | 3 | `AB − CD = ?`, each digit of AB ≥ matching digit of CD | near-miss (±1 result) |
| 3 | `two-digit-addition-regroup` | 2 | 3 | `AB + CD = ?`, ones digits sum ≥ 10 | off-by-carry (forget carry) |
| 3 | `two-digit-subtraction-regroup` | 2 | 3 | `AB − CD = ?`, ones digit of AB < ones digit of CD | off-by-borrow (forget borrow) |
| 3 | `multiplication-easy-facts` | 2 | 3 | `A × B = ?`, A∈[2,10], B∈{2,5,10} | near-miss (±product of 1 group) |
| 3 | `multiplication-mid-facts` | 2 | 3 | `A × B = ?`, A∈[2,9], B∈{3,4,6} | adjacent-fact (A±1)×B |
| 3 | `multiplication-full-facts` | 3 | 4 | `A × B = ?`, A∈[2,12], B∈[2,12] | adjacent-fact (A±1)×B |
| 3 | `division-basic-facts` | 3 | 4 | `A ÷ B = ?`, B∈[2,9], A=B×Q, Q∈[2,12] | near-miss quotient (±1) |
| 3 | `unit-fraction-of-number` | 3 | 4 | `1/D of N = ?`, D∈{2,3,4,5}, N divisible by D, N∈[6,40] | wrong-denominator result |
| 4 | `three-digit-addition` | 3 | 4 | `ABC + DEF = ?`, operands∈[100,699] | off-by-carry (forget hundreds carry) |
| 4 | `three-digit-subtraction` | 3 | 4 | `ABC − DEF = ?`, ABC≥DEF, operands∈[100,799] | off-by-borrow (forget borrow) |
| 4 | `division-with-remainder` | 3 | 4 | `A ÷ B = ?`, B∈[2,9], A∈[10,89], remainder∈[1,B−1] | wrong remainder (±1r) |
| 4 | `fraction-of-number` | 4 | 5 | `N/D × W = ?`, N∈[2,4], D∈[3,5], W divisible by D, W∈[12,40] | divide-only (skip multiply step) |
| 4 | `multi-step-expression` | 4 | 5 | `(A × B) − C = ?` or `(A × B) + C = ?`, A∈[2,9], B∈[2,9], C∈[1,20] | wrong-order (add/subtract before multiply) |
| 5 | `square-root-perfect` | 4 | 5 | `√N = ?`, N∈{1,4,9,16,25,36,49,64,81,100,121,144} | adjacent-square (√(N±step)) |
| 5 | `mixed-operations` | 5 | 5 | `(√P) + (A × B) = ?` or similar; all component answers integer | wrong-subexpression result |

## Difficulty Parameters
<!-- Describes what difficulty 1–5 means per skill class; operand constraints tighten/loosen by level -->

**Scale: 1 = easiest (tutorial/intro), 5 = hardest (Level 20 expert)**

| Difficulty | Addition / Subtraction | Multiplication / Division | Multi-step / Fractions / Roots |
|------------|----------------------|--------------------------|-------------------------------|
| 1 | Single-digit only; sums ≤ 10 | N/A | N/A |
| 2 | Single-digit, sums ≤ 18; or 2-digit no-regroup | ×2, ×5, ×10 only; dividends ≤ 50 | N/A |
| 3 | 2-digit with regroup; or 3-digit intro | Full ×2–×6 facts; basic division facts; unit fractions | N/A |
| 4 | 3-digit with borrowing across columns | Full 12×12; division with remainder; simple fractions of numbers | Single parenthesised step; square roots ≤ 100 |
| 5 | Mixed across all addition/subtraction types | All fact families; remainders up to B−1 | Two-operation expressions; square roots ≤ 144; mixed operation combos |

**Bomb-count cap:** At difficulty 1–2 (new-operation introduction levels), `maxSimultaneousBombs` is capped at the level-minimum regardless of player difficulty preset (per GDD `newOperationBombCountCap` rule).

## Problem Format Reference
<!-- Notation used in the Grade-Level Skill Table above -->

- `A`, `B`, `C`, `D` — single-digit operand placeholders (1–9 unless range stated)
- `AB`, `CD` — two-digit number placeholders (tens digit A, ones digit B)
- `ABC`, `DEF` — three-digit number placeholders
- `N`, `W` — whole-number operands (range stated per row)
- `P` — perfect-square value (drawn from the enumerated set)
- `∈[lo, hi]` — integer drawn uniformly from the closed range
- `∈{…}` — integer drawn from the explicit set
- `Q R r` — quotient Q with remainder r (e.g. `7 R1`)
- All answers are non-negative integers (or `Q R r` strings for `division-with-remainder`)
- Distractors are always distinct from the correct answer and from each other

## Glossary — CCSS Standards Used
| Code | Full Standard Text |
|------|--------------------|
| 2.OA.B.2 | Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers. |
| 2.NBT.B.5 | Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction. |
| 3.NBT.A.2 | Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction. |
| 3.OA.C.7 | Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers. |
| 3.NF.A.1 | Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b. |
| 4.NBT.B.4 | Fluently add and subtract multi-digit whole numbers using the standard algorithm. |
| 4.OA.A.3 | Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. |
| 4.NF.A.1 | Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) by using visual fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size. *(Applied here as: compute a non-unit fraction of a whole number.)* |
| 5.NBT.A.2† | Explain patterns in the number of zeros of the product when multiplying a number by powers of 10. *(†Square roots of perfect squares are treated as enrichment content beyond strict 5.NBT scope; this skillType bridges into 8.EE.A.2 territory but is scoped here to perfect squares ≤ 144 only.)* |
| 5.OA.A.1 | Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols. |
