# Macroeconomics Study Labs

Interactive study pages for **AP Macroeconomics**, one lab for every topic in the course's six units. Each lab has movable graphs or a hands-on calculator or sorting game, a live explanation of what changed and why, a reference table, FRQ tips, common mistakes, eight AP-style practice questions, and the key terms for that topic.

Live site: https://macro.natebird.co

### Unit 1: Basic Economic Concepts

- [1.1 Scarcity](labs/1-1-scarcity.html)
- [1.2 Opportunity Cost and the PPC](labs/1-2-opportunity-cost-ppc.html)
- [1.3 Comparative Advantage and Gains from Trade](labs/1-3-comparative-advantage.html)
- [1.4 Demand](labs/1-4-demand.html)
- [1.5 Supply](labs/1-5-supply.html)
- [1.6 Market Equilibrium and Changes in Equilibrium](labs/1-6-market-equilibrium.html)

### Unit 2: Economic Indicators and the Business Cycle

- [2.1 The Circular Flow and GDP](labs/2-1-circular-flow-gdp.html)
- [2.2 Limitations of GDP](labs/2-2-limitations-of-gdp.html)
- [2.3 Unemployment](labs/2-3-unemployment.html)
- [2.4 Price Indices and Inflation](labs/2-4-price-indices-inflation.html)
- [2.5 Costs of Inflation](labs/2-5-costs-of-inflation.html)
- [2.6 Real vs. Nominal GDP](labs/2-6-real-vs-nominal-gdp.html)
- [2.7 Business Cycles](labs/2-7-business-cycles.html)

### Unit 3: National Income and Price Determination

- [3.1 Aggregate Demand](labs/3-1-aggregate-demand.html)
- [3.2 Multipliers](labs/3-2-multipliers.html)
- [3.3 Short-Run Aggregate Supply](labs/3-3-short-run-aggregate-supply.html)
- [3.4 Long-Run Aggregate Supply](labs/3-4-long-run-aggregate-supply.html)
- [3.5 Equilibrium in the AD–AS Model](labs/3-5-ad-as-equilibrium.html)
- [3.6 Changes in the AD–AS Model in the Short Run](labs/3-6-short-run-changes-ad-as.html)
- [3.7 Long-Run Self-Adjustment](labs/3-7-long-run-self-adjustment.html)
- [3.8 Fiscal Policy](labs/3-8-fiscal-policy.html)
- [3.9 Automatic Stabilizers](labs/3-9-automatic-stabilizers.html)

### Unit 4: Financial Sector

- [4.1 Financial Assets](labs/4-1-financial-assets.html)
- [4.2 Nominal vs. Real Interest Rates](labs/4-2-nominal-vs-real-interest-rates.html)
- [4.3 Definition, Measurement, and Functions of Money](labs/4-3-money.html)
- [4.4 Banking and the Expansion of the Money Supply](labs/4-4-banking-money-supply.html)
- [4.5 The Money Market](labs/4-5-money-market.html)
- [4.6 Monetary Policy](labs/4-6-monetary-policy.html)
- [4.7 The Loanable Funds Market](labs/4-7-loanable-funds-market.html)

### Unit 5: Long-Run Consequences of Stabilization Policies

- [5.1 Fiscal & Monetary Policy in the Short Run](labs/5-1-policy-actions-short-run.html)
- [5.2 The Phillips Curve](labs/5-2-phillips-curve.html)
- [5.3 Money Growth and Inflation](labs/5-3-money-growth-inflation.html)
- [5.4 Government Deficits and the National Debt](labs/5-4-deficits-national-debt.html)
- [5.5 Crowding Out](labs/5-5-crowding-out.html)
- [5.6 Economic Growth](labs/5-6-economic-growth.html)
- [5.7 Public Policy and Economic Growth](labs/5-7-public-policy-growth.html)

### Unit 6: Open Economy—International Trade and Finance

- [6.1 Balance of Payments Accounts](labs/6-1-balance-of-payments.html)
- [6.2 Exchange Rates](labs/6-2-exchange-rates.html)
- [6.3 The Foreign Exchange Market](labs/6-3-foreign-exchange-market.html)
- [6.4 Policy and Economic Changes in the Foreign Exchange Market](labs/6-4-fx-market-shifts.html)
- [6.5 The Foreign Exchange Market and Net Exports](labs/6-5-fx-and-net-exports.html)
- [6.6 Real Interest Rates and International Capital Flows](labs/6-6-real-interest-rates-capital-flows.html)

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
assets/lab.js       Shared helpers: topic list, market and PPC graphs, SVG primitives, quiz builder, navigation
assets/glossary.js  Glossary viewer: term list, flashcards, quiz
assets/glossary/    Term data, one file per unit
labs/               One page per course topic (N-k-slug.html)
scripts/            build_index.py regenerates index.html from the topic list
terms/              Master glossary and one page per unit
```

## A note on the numbers

The graphs run on simplified teaching models. The direction of every shift and movement follows the AP Macroeconomics course framework, but the specific values are illustrative, not real economic data.
