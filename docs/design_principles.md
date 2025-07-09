# HerHealth Hub Design Principles

## TL;DR - Core Principles

1. **Start with the user & their problem** - Identify who the user is, what they're trying to achieve, and why our solution matters before building anything
2. **Earn trust through details** - Treat typos, janky layouts, flaky states, or premature error messages as breaches of trust
3. **Utility → Usability → Craft & Joy** - Every feature must solve a real problem, be effortless to use, and be polished before going live

---

## Mission

Build every feature, interface, and artefact with the same obsessive attention to user trust, quality, and craft that Stripe's design team practises—so that even the smallest detail signals reliability and delight.

## Core Principles to Follow

| # | Principle | How to Act on It |
|---|-----------|------------------|
| 1 | Start with the user & their problem | Before writing code, identify who the user is, what they're trying to achieve, and why our solution matters. Everything else follows. |
| 2 | Earn trust through details | Treat typos, janky layouts, flaky states, or premature error messages as breaches of trust. Fix or prevent them before shipping. |
| 3 | Utility → Usability → Craft & Joy | Use this three-step checklist on every commit:<br>1. Does it solve a real problem?<br>2. Is it effortless to use?<br>3. Is it polished, defect-free, and a little delightful? All three must be "yes" before GA. |
| 4 | Ship fast, but never sloppy | When in doubt, beta-gate the feature, gather feedback rapidly, iterate, then GA. "Ship early" ≠ "ship broken." |
| 5 | Continuous, company-wide "walk-the-store" | Regularly run end-to-end flows as if you were a brand-new user. Log friction, score severity (🔴🟠🟡🟢), and file bugs immediately. |
| 6 | Design is a team sport | Work hand-in-hand with PMs, engineers, and content from day 0. No "throw-over-the-wall" hand-offs. |
| 7 | Measure what matters | Track conversion, defect counts, and user-reported friction. Celebrate 20%+ lifts from small UX improvements (e.g., clearer emails). |
| 8 | Cultivate taste | Study products you love and hate; pinpoint which details create (or destroy) joy. Bring those insights back into the build. |

## Required Process Steps for Every Feature

### Problem Framing Doc
Define user, context, pain point, success metric.

### Lightning Research
Run at least one quick user interview / usability session or consult existing insights.

### Prototype & Feedback Loop
Lo-fi → hi-fi; demo weekly; capture comments in a shared doc.

### Quality Checklist Pass
Run the Utility–Usability–Craft checklist; fix all 🔴/🟠 issues.

### Internal "Walk-the-Store"
A non-builder teammate completes the flow and logs friction.

### Beta Release + Metrics Watch
Roll out to a small cohort, monitor metrics & bug inbox.

### General Availability
Only after trust-eroding defects = 0 and metrics are neutral-to-positive.

## Acceptance Criteria Before Marking a Task "Done"

✔️ Problem solved for the intended user and clearly validated.

✔️ Zero typos, broken states, or layout jumps on common browsers/devices.

✔️ Conversion or task-completion rate equal to or higher than baseline.

✔️ Feature scored 🟢 on the friction board; no regressions introduced elsewhere.

✔️ Code, tests, and docs reflect the final UX, not an earlier iteration.

## Tone & Craft Expectations

- Prefer plain, human-first language over jargon.
- Micro-copy is short, supportive, consistent (voice & tense).
- Animations and micro-interactions exist only to clarify or delight—never distract.
- Errors wait until the user finishes input (e.g., after blur) unless truly destructive.

## Reminder

*"The gravitational pull is to mediocrity."*

Fight it in every micro-decision. Hold the bar. If a detail undermines trust, iterate before you ship.

---

Feed this brief into your programming agent at the start of each sprint or major task.