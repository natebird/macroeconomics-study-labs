# Macroeconomics Study Labs

Interactive study pages for **AP Macroeconomics Unit 5: Long-Run Consequences of Stabilization Policies**. Each topic gets its own lab with movable graphs, a live explanation of what changed and why, a reference table, FRQ graphing tips, common mistakes, and eight AP-style practice questions.

| Topic | Lab |
| --- | --- |
| 5.1 | [Fiscal & Monetary Policy Actions in the Short Run](labs/5-1-policy-actions-short-run.html) |
| 5.2 | [The Phillips Curve](labs/5-2-phillips-curve.html) |
| 5.3 | [Money Growth and Inflation](labs/5-3-money-growth-inflation.html) |
| 5.4 | [Government Deficits and the National Debt](labs/5-4-deficits-national-debt.html) |
| 5.5 | [Crowding Out](labs/5-5-crowding-out.html) |
| 5.6 | [Economic Growth](labs/5-6-economic-growth.html) |
| 5.7 | [Public Policy and Economic Growth](labs/5-7-public-policy-growth.html) |

## Terminology guides

A searchable glossary of every key term in the course, with flashcards (progress saved in the browser) and a self-quiz.

- [Master guide: all six units](terms/index.html)
- Unit guides: [1](terms/unit-1.html) · [2](terms/unit-2.html) · [3](terms/unit-3.html) · [4](terms/unit-4.html) · [5](terms/unit-5.html) · [6](terms/unit-6.html)
- Each Unit 5 lab ends with a Key terms section for its own topic.

Terms live in `assets/glossary/unit-N.js`. Each term is stored once, in the topic where the course introduces it, and an `also` list places it in later topics that reuse it.

## Using it

Open `index.html` in any browser, or visit the GitHub Pages site for this repo. There is no build step and nothing to install. Every page is plain HTML, CSS, and JavaScript.

## Layout

```
index.html          Landing page linking every lab
assets/lab.css      Shared styles (light and dark themes)
assets/lab.js       Shared helpers: SVG charts, quiz builder, page navigation
assets/glossary.js  Glossary viewer: term list, flashcards, quiz
assets/glossary/    Term data, one file per unit
labs/               One page per Unit 5 topic
terms/              Master glossary and one page per unit
```

## A note on the numbers

The graphs run on simplified teaching models. The direction of every shift and movement follows the AP Macroeconomics course framework, but the specific values are illustrative, not real economic data.
