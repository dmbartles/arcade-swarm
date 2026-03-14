# Curriculum Map — Missile Command Math

## Skill Types (API Contract)
<!-- Master list of skillType values this game uses. These are the exact strings
     passed to generateProblem({ skillType }). Do not change these after the
     Math Engine agent has started work. -->
| skillType (kebab-case) | Grade | CCSS Code | Description |
|------------------------|-------|-----------|-------------|
| single-digit-addition | 3 | 2.OA.B.2 | Add two single-digit numbers fluently |
| single-digit-subtraction | 3 | 2.OA.B.2 | Subtract single-digit numbers fluently (minuend ≤ 18) |
| two-digit-addition-no-regroup | 3 | 2.NBT.B.5 | Add two 2-digit numbers, no regrouping required |
| two-digit-addition-regroup | 3 | 3.NBT.A.2 | Add two 2-digit numbers with regrouping |
| two-digit-subtraction | 3 | 3.NBT.A.2 | Subtract 2-digit numbers with and without regrouping |
| multiplication-partial | 3 | 3.OA.C.7 | Multiply using ×2, ×5, ×10 facts only |
| multiplication-full | 4 | 3.OA.C.7 | Multiply any two factors within the 12×12 table |
| division-basic | 4 | 3.OA.C.7 | Divide using basic fact families (no remainder) |
| three-digit-addition | 4 | 4.NBT.B.4 | Add two 3-digit numbers with regrouping |
| three-digit-subtraction | 4 | 4.NBT.B.4 | Subtract 3-digit numbers with regrouping and zeros |
| division-with-remainder | 4 | 4.OA.A.3 | Divide with a whole-number remainder; express as quotient R remainder |
| unit-fraction-of-whole | 4 | 3.NF.A.1 | Find a unit fraction of a whole number (e.g. ½ of N) |
| fraction-of-whole | 4 | 4.NF.A.1 | Multiply a non-unit fraction by a whole number (e.g. ¾ × N) |
| four-digit-addition | 4 | 4.NBT.B.4 | Add two 4-digit numbers with regrouping |
| four-digit-subtraction | 4 | 4.NBT.B.4 | Subtract two 4-digit numbers with regrouping and zeros |
| multi-step-expression | 4 | 4.OA.A.3 | Evaluate a two-operation parenthesised expression |
| perfect-square-root | 5 | 5.NBT.A.2 | Find the square root of a perfect square ≤ 144 |
| mixed-operations | 5 | 5.OA.A.1 | Evaluate a multi-operation expression combining ≥ 2 skill families |

## Grade-Level Skill Table
<!-- One row per grade × skillType combination -->
| Grade | skillType | Difficulty Min | Difficulty Max | Problem Format | Distractor Strategy |
|-------|-----------|----------------|----------------|----------------|---------------------|
| 3 | single-digit-addition | 1 | 2 | `A + B = ?`, A∈[1,9], B∈[1,9] | near-miss (±1 sum) |
| 3 | single-digit-subtraction | 1 | 2 | `A - B = ?`, A∈[6,18], B∈[1,9], A≥B | near-miss (±1 difference) |
| 3 | two-digit-addition-no-regroup | 1 | 2 | `AB + CD = ?`, ones digits sum ≤ 9 | swap tens/ones digit of answer |
| 3 | two-digit-addition-regroup | 2 | 3 | `AB + CD = ?`, ones digits sum ≥ 10 | omit-carry error (off by 10) |
| 3 | two-digit-subtraction | 2 | 3 | `AB - CD = ?`, AB∈[20,99], CD∈[10,89] | borrow-error (off by 10) |
| 3 | multiplication-partial | 1 | 2 | `A × B = ?`, A∈{2,5,10}, B∈[1,10] | adjacent-multiple (±1×factor) |
| 4 | multiplication-full | 2 | 3 | `A × B = ?`, A∈[2,12], B∈[2,12] | near-miss (±product of 1 step) |
| 4 | division-basic | 2 | 3 | `A ÷ B = ?`, A = B×Q, B∈[2,10], Q∈[2,10] | adjacent-quotient (Q±1) |
| 4 | three-digit-addition | 2 | 3 | `ABC + DEF = ?`, both∈[100,699] | omit-carry (off by 100 or 10) |
| 4 | three-digit-subtraction | 2 | 3 | `ABC - DEF = ?`, ABC∈[200,999], DEF < ABC | borrow-error (off by 100) |
| 4 | division-with-remainder | 2 | 3 | `A ÷ B = ?` expressed as `Q R r`, A∈[13,99], B∈[2,9] | wrong remainder (r±1) or wrong quotient (Q±1) |
| 4 | unit-fraction-of-whole | 2 | 3 | `1/D of W = ?`, D∈{2,3,4,5,8}, W = D×K, K∈[2,12] | wrong divisor applied (adjacent unit fraction result) |
| 4 | fraction-of-whole | 3 | 4 | `N/D × W = ?`, N/D∈{¾,⅔,¾,⅗}, W = D×K, K∈[2,10] | unit-fraction-only answer (omit numerator multiply) |
| 4 | four-digit-addition | 3 | 4 | `ABCD + EFGH = ?`, both∈[1000,4999] | omit-carry (off by 1000 or 100) |
| 4 | four-digit-subtraction | 3 | 4 | `ABCD - EFGH = ?`, ABCD∈[2000,9999], EFGH < ABCD | borrow-error (off by 1000) |
| 4 | multi-step-expression | 3 | 4 | `(A × B) ± C = ?`, A∈[2,9], B∈[2,9], C∈[1,20] | order-of-operations swap (compute without parens) |
| 5 | perfect-square-root | 3 | 4 | `√P = ?`, P∈{4,9,16,25,36,49,64,81,100,121,144} | adjacent perfect square root (±1) |
| 5 | mixed-operations | 4 | 5 | `(√P) OP (A × B) = ?`, OP∈{+,−}, P perfect square, A∈[2,9], B∈[2,9] | component-error (wrong sub-result for one operand) |

## Difficulty Parameters
<!-- Describes what difficulty 1–5 means per skill; expressed as operand ranges or constraint changes -->

**Scale: 1 = easiest, 5 = hardest**

| skillType | Diff 1 | Diff 2 | Diff 3 | Diff 4 | Diff 5 |
|-----------|--------|--------|--------|--------|--------|
| single-digit-addition | A+B ≤ 10 | A+B ≤ 18 | — | — | — |
| single-digit-subtraction | minuend ≤ 10 | minuend ≤ 18 | — | — | — |
| two-digit-addition-no-regroup | tens∈[1,4] | tens∈[1,8] | — | — | — |
| two-digit-addition-regroup | tens∈[1,4] | tens∈[1,7] | tens∈[1,9] | — | — |
| two-digit-subtraction | no zeros in minuend | zeros possible | regrouping across zero | — | — |
| multiplication-partial | ×2 and ×5 only | ×10 added | all ×2/×5/×10, B∈[6,10] | — | — |
| multiplication-full | A,B∈[2,6] | A,B∈[2,9] | A,B∈[2,12] | — | — |
| division-basic | B∈[2,5], Q∈[2,5] | B∈[2,9], Q∈[2,9] | B∈[2,10], Q∈[2,10] | — | — |
| three-digit-addition | no double-regroup | single regroup | double regroup | — | — |
| three-digit-subtraction | no zero in minuend | zero in ones | zero in tens and ones | — | — |
| division-with-remainder | A∈[13,40] | A∈[13,69] | A∈[13,99] | — | — |
| unit-fraction-of-whole | D∈{2,4}, K∈[2,6] | D∈{2,3,4,5}, K∈[2,9] | D∈{2,3,4,5,8}, K∈[2,12] | — | — |
| fraction-of-whole | N/D∈{½,¼} | N/D∈{¾,⅔} | N/D∈{⅗,¾,⅔}, K∈[4,10] | — | — |
| four-digit-addition | no double-regroup | single regroup | double regroup | — | — |
| four-digit-subtraction | no zeros | zeros in ones | zeros in tens/ones | — | — |
| multi-step-expression | C∈[1,9], product≤36 | C∈[1,20], product≤72 | C∈[1,20], product≤108 | — | — |
| perfect-square-root | P∈{4,9,16,25} | P∈{36,49,64} | P∈{81,100,121,144} | — | — |
| mixed-operations | one √ operand, OP=+ | both operands computed, OP=+ or − | both operands computed, OP=±, larger values | larger expression, P∈{81,100,121,144} | all values at ceiling |

## Problem Format Reference
<!-- Document notation used in the Grade-Level Skill Table above -->

- **A, B, C, D, …** — single operand values; ranges given as `∈[min,max]` (inclusive integers) or `∈{set}`.
- **AB, CD** — two-digit numbers where A/C = tens digit, B/D = ones digit; full value range stated separately.
- **ABC, DEF** — three-digit numbers; **ABCD, EFGH** — four-digit numbers; same convention.
- **P** — a perfect-square integer; always drawn from the explicit set listed.
- **K** — a multiplier integer used to guarantee the whole-number is evenly divisible by D (unit-fraction problems).
- **Q** — quotient; **r** — remainder.
- **OP** — arithmetic operator drawn from the listed set `{+, −}`.
- Range syntax `[min,max]` means uniform random integer selection within that closed interval.

## Glossary — CCSS Standards Used
<!-- Full standard text for every code referenced above -->
| Code | Full Standard Text |
|------|--------------------|
| 2.OA.B.2 | Fluently add and subtract within 20 using mental strategies. By end of Grade 2, know from memory all sums of two one-digit numbers. |
| 2.NBT.B.5 | Fluently add and subtract within 100 using strategies based on place value, properties of operations, and/or the relationship between addition and subtraction. |
| 3.NBT.A.2 | Fluently add and subtract within 1000 using strategies and algorithms based on place value, properties of operations, and/or the relationship between addition and subtraction. |
| 3.OA.C.7 | Fluently multiply and divide within 100, using strategies such as the relationship between multiplication and division or properties of operations. By the end of Grade 3, know from memory all products of two one-digit numbers. |
| 3.NF.A.1 | Understand a fraction 1/b as the quantity formed by 1 part when a whole is partitioned into b equal parts; understand a fraction a/b as the quantity formed by a parts of size 1/b. |
| 4.OA.A.3 | Solve multistep word problems posed with whole numbers and having whole-number answers using the four operations, including problems in which remainders must be interpreted. |
| 4.NBT.B.4 | Fluently add and subtract multi-digit whole numbers using the standard algorithm. |
| 4.NF.A.1 | Explain why a fraction a/b is equivalent to a fraction (n×a)/(n×b) by using visual fraction models, with attention to how the number and size of the parts differ even though the two fractions themselves are the same size. Use this principle to recognize and generate equivalent fractions. |
| 5.OA.A.1 | Use parentheses, brackets, or braces in numerical expressions, and evaluate expressions with these symbols. |
| 5.NBT.A.2 | Explain patterns in the number of zeros of the product when multiplying a number by powers of 10, and explain patterns in the placement of the decimal point when a decimal is multiplied or divided by a power of 10. (Note: `perfect-square-root` is tagged to this domain as a Grade 5 enrichment extension; no explicit CCSS square-root standard exists at this grade band.) |
