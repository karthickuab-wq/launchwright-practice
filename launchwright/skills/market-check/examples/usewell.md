# Dry run: the market check for Use It Up

A dry run of the market-check skill on the walkthrough's sample idea, done on Nov 18, 2026, from Launchwright's own cloud build environment. The idea, its podcast and its description are made up (from idea intake's dry run, `skills/idea-intake/examples/podcast-link.md`), but the market is real: every search, page, number and date below was really read that day. The user's time zone is America/Chicago, so every date is Chicago's. Lines starting with `>` are what Claude shows the user.

**These numbers were true on Nov 18, 2026.** They are an example of the method, not facts to reuse; a real check reads every page again that day (the skill, rule 1).

## 1. What Claude read first

- **The description:** an app that tells you what to cook tonight from the food in your kitchen that's about to go off. For busy households who throw good food away. Version 1: add food by scanning a receipt or typing; show what to use first; recipes of 15 minutes or less; one reminder the evening before something goes off. Free, with a paid plan. iPhone and Android first.
- **The source note:** a public podcast episode, so the check is on by default. No competitors named.
- **The kit's settings:** time zone America/Chicago, so the US first.

## 2. Screen 4

> Before we design it, I'll spend about 30 minutes on demand and competition. The goal is an app that makes money: more demand, less competition.
> This idea was on a public podcast, so others heard it too. That's why the check is on.
>
> • Run it *(recommended)*
> • Skip it

The user tapped **Run it**.

## 3. What Claude looked for (section 3 of the skill)

- **The problem:** food going off before it's eaten; not knowing what to cook with what's there.
- **The job, four ways:** food expiry tracker; pantry or fridge inventory; recipes from the ingredients you have; receipt scanning for groceries.

## 4. What happened while reading

- **Web searches** (Nov 18, 2026): "app track food expiration dates suggest recipes from ingredients scan receipt reminder before food expires"; the same job limited to play.google.com; "NoWaste food inventory app Google Play"; "Supercook recipe generator by ingredients Google Play"; "household food waste statistics per household per year"; "EPA 2025 report wasted food household cost $728 per person", limited to epa.gov.
- **Google Play listings opened:** eleven, one at a time, all on Nov 18, 2026 (section 6 below).
- **Never opened:** every apps.apple.com page the searches returned (Apple's terms; `skills/market-check/sources.md`). Those apps are named from the search results only.
- **Couldn't be reached from the cloud:** www.epa.gov, www.apple.com, policies.google.com. The EPA figure is from search results, and marked so.
- **A search result that was out of date:** a search described "Foil: Food Expiration tracker" at com.getfoil.app; its Google Play page that day was a different app, "Nishi: My nutrition companion". It was left out. This is why the skill opens every page before using it (rule 5).

## 5. Screen 5, as the user saw it

> The market check for Use It Up is ready.
> **Demand:** strong. SuperCook, an app that finds recipes from what you have, shows 1M+ downloads.
> **Closest apps:** NoWaste (3.0 stars, 50K+ downloads) already scans receipts; its reviews say adding food is a chore.
> **Verdict:** real demand, a busy field. Win by being the easiest.
> **Tweaks:** 1. Lead with tonight's dinner. 2. Make the receipt scan fill in the dates.
>
> • Use the tweaks *(recommended: they answer what people complain about)*
> • Keep the idea as is
> • Do a deeper round

No screenshot was asked for before it: the closest iPhone-only apps are all new, and their App Store ratings wouldn't change the verdict.

## 6. market.md, as saved

```markdown
# The market check

Checked on Nov 18, 2026, for Use It Up (ideas/use-it-up/description.md). Quick check, about 30 minutes. Times are America/Chicago.

## Demand
Strong. People already install apps for this job in large numbers, and the problem costs households real money.
- SuperCook, which finds recipes from the ingredients you have, shows 1M+ downloads and 4.6 stars from 18.8K reviews on Google Play. Its listing pitches it against food going off: "How many times have you thrown away an ingredient, because you couldn't figure out how to use it before it expired?" Source: [SuperCook - Recipe Generator, Google Play](https://play.google.com/store/apps/details?id=com.supercook.app&hl=en_US&gl=US), read Nov 18, 2026.
- NoWaste, a fridge and pantry tracker, shows 50K+ downloads and 306 reviews on Google Play, and was updated Nov 16, 2026: people keep using a tracker even at 3.0 stars. Source: [NoWaste: Food Inventory Lists, Google Play](https://play.google.com/store/apps/details?id=com.khcreations.nowaste&hl=en_US&gl=US), read Nov 18, 2026.
- The US Environmental Protection Agency puts the cost of wasted food at $728 a person a year (homes and restaurants together), about 11 percent of what a person spends on food. Seen in search results, page not opened (www.epa.gov wasn't reachable from the cloud): [Estimating the Cost of Food Waste to American Consumers, EPA, April 2025](https://www.epa.gov/land-research/estimating-cost-food-waste-american-consumers), searched Nov 18, 2026.

## Competitors
Busy but beatable. One established tracker already does receipts, reminders and recipes, but is rated 3.0 with complaints about entering food; a crowd of new AI trackers do the same with few users so far.

| App | What it does | Price | Rating | Downloads | What it misses |
| --- | --- | --- | --- | --- | --- |
| NoWaste (KH Creations ApS) | Fridge, freezer and pantry lists; reminders before food goes off; scans barcodes, receipts or photos; recipes, shopping lists, meal plans | Free; in-app purchases $6.99 - $44.99 per item; no ads | 3.0 stars, 306 reviews | 50K+ | Reviews shown on its page: entering food is fiddly ("You need to add how many milligrams of lunch meat…"), wrong dates ("my butter… expires in one day"), and a lost list |
| SuperCook (SuperCook) | Recipes that use only what you have, from a pantry you pick from 2,000+ ingredients | Free; no in-app purchases or ads shown | 4.6 stars, 18.8K reviews | 1M+ | No dates and no reminders: it doesn't know what's going off. You add every ingredient by hand |
| Friio (Friio App) | "Scan groceries, track expiry dates, cook what you have"; shared household fridge | Free; in-app purchases $3.99 - $29.99 per item | no rating yet | 500+ | Too new to judge |
| Pantry·Fridge Recipes eggg.ai (Jiyoon Chang) | "AI tracks pantry & expiry. Grocery list, recipes" | Free; contains ads | no rating yet | 500+ | Ads |
| StillGood? (ezapp7) | Expiry tracker with barcode scanning | Free; contains ads | no rating yet | 500+ | No recipes in its short description; ads |
| Restokk (Restokk) | "Scan receipts, plan meals, reduce waste" | Free; in-app purchases shown | no rating yet | 100+ | Too new to judge |
| NoWaste.ai (iyio) | Pantry tracker built from receipt photos | Free; in-app purchases $3.99 - $29.99 per item | no rating yet | 100+ | Last updated Feb 22, 2026 |
| iPhone only: AI Fridge, FreshDate, Xpiry, FridgeSmart, NutriKeeper | Receipt scanning, expiry reminders and recipes, by their search results | App Store only, not read | App Store only, not read | App Store only, not read | Not read (Apple's terms) |

## Verdict
Real demand and a busy field: receipt scanning is now common, so Use It Up wins by being the easiest to keep up, not by having more features.

## Suggested tweaks
1. Open on tonight's dinner, made from what goes off first, instead of a list of food: SuperCook's 1M+ downloads show people come for "what can I cook", and no tracker leads with it. Taken: yes, Nov 18, 2026.
2. Make the receipt scan fill in the dates itself, so the user only fixes the odd one: NoWaste's reviews complain about entering details by hand and about wrong dates. Taken: yes, Nov 18, 2026.

## Sources
| Page | Address | Read | Notes |
| --- | --- | --- | --- |
| SuperCook - Recipe Generator, Google Play | https://play.google.com/store/apps/details?id=com.supercook.app&hl=en_US&gl=US | Nov 18, 2026 | Updated Oct 29, 2026 |
| NoWaste: Food Inventory Lists, Google Play | https://play.google.com/store/apps/details?id=com.khcreations.nowaste&hl=en_US&gl=US | Nov 18, 2026 | Updated Nov 16, 2026; three reviews shown on the page read |
| Friio, Google Play | https://play.google.com/store/apps/details?id=io.friio&hl=en_US&gl=US | Nov 18, 2026 | Updated Oct 30, 2026 |
| Pantry·Fridge Recipes eggg.ai, Google Play | https://play.google.com/store/apps/details?id=io.eggg&hl=en_US&gl=US | Nov 18, 2026 | Updated Oct 15, 2026 |
| StillGood?, Google Play | https://play.google.com/store/apps/details?id=com.ezapp.stillgood&hl=en_US&gl=US | Nov 18, 2026 | Updated Nov 2, 2026 |
| Restokk, Google Play | https://play.google.com/store/apps/details?id=com.restokk.app&hl=en_US&gl=US | Nov 18, 2026 | Updated Aug 28, 2026 |
| NoWaste.ai, Google Play | https://play.google.com/store/apps/details?id=com.nowaste.ai&hl=en_US&gl=US | Nov 18, 2026 | Updated Feb 22, 2026 |
| Fridgie, Tarvio, Recipa, Google Play | com.fridgie.app, com.ardify.tarvio, com.PPOONN.recipa | Nov 18, 2026 | 10+ to 50+ downloads; left out of the table as too small |
| com.getfoil.app, Google Play | https://play.google.com/store/apps/details?id=com.getfoil.app&hl=en_US&gl=US | Nov 18, 2026 | Now a different app (Nishi); its search result was out of date. Left out |
| EPA, Estimating the Cost of Food Waste to American Consumers | https://www.epa.gov/land-research/estimating-cost-food-waste-american-consumers | Not read | Site not reachable from the cloud; figure from search results |
| AI Fridge, FreshDate, Xpiry, FridgeSmart, NutriKeeper, App Store | apps.apple.com | Not read | Never read: Apple's terms (`skills/market-check/sources.md`). Names from search results |
| Web searches | Six searches, listed in the dry run | Nov 18, 2026 | |
```

## 7. Use the tweaks

The user tapped **Use the tweaks**.

> Here's what changes in the description:
> • Version 1 opens on tonight's dinner, from what goes off first
> • The receipt scan fills in the dates; you only fix the odd one
>
> • Looks right *(recommended)*
> • Change something

The user tapped **Looks right**. In description.md, "What version 1 does" became:

```markdown
1. Open on tonight's dinner: recipes of 15 minutes or less, made from what goes off first.
2. Add food by scanning a shopping receipt, with the dates filled in; or by typing.
3. Show what to use first, soonest to go off at the top.
4. Send one reminder the evening before something goes off.
```

The source note got "Market check: Nov 18, 2026; tweaks taken: 1 and 2." Then on to the name.

## Checked against the skill

- Every number is copied as its page showed it, with the page and the date; the one figure not opened is marked as from search results.
- No App Store, Spotify or YouTube page was opened; the iPhone-only apps are named from search results only.
- Google Play was read only at app listing pages, which its robots.txt allows; no store search or full reviews list.
- Demand and competition are judged together, and the verdict says where the app can win.
- Two tweaks, each tied to a finding; none sets a price.
- Screen 5 fits one phone screen, with one question and three tap options.
