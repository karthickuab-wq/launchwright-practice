---
name: market-check
description: Checks demand and competition for a confirmed app idea in about 30 minutes, so the app has the best chance of making money. Use right after an idea's description is confirmed (on by default when the idea is public, such as a podcaster's; offered otherwise), or when the user asks how the market looks or wants a deeper round. Gives demand signals and the closest apps with sources and dates, a one-line verdict, and up to three suggested tweaks.
---

# The quick market check

The goal is an app that makes money, so the check weighs two things together: how many people want this (demand) and how many good apps already give it to them (competition). More demand and less competition is better. It takes about 30 minutes, runs while the user does something else, and ends with a verdict and up to three tweaks the user can take or leave. A deeper round is optional (brief F4; spec screens 4 and 5).

This is the Researcher's job (spec section 2.2; top model, medium effort). Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message. As there, every line the user sees is written below as a quoted line; adapt the words to the moment, keep the shape.

## What's in this folder

| File | What it is |
| --- | --- |
| `skills/market-check/sources.md` | Where to look, which pages may be read, and the sites the check never reads |
| `skills/market-check/examples/usewell.md` | A dry run on the walkthrough's sample idea, with real pages read on Nov 18, 2026 |

In a project, the kit keeps this folder as launchwright/skills/market-check/. The file this skill writes is the idea's market.md, next to its description.md: in the home repo's ideas folder (ideas/<idea>/market.md) while the idea has no home of its own, and project/market.md once it does. The kit starts it with its headings; this skill fills them in.

## The rules for every check

1. **Read it today.** Every number, price, rating and download count comes from a page read during this check. What you remember, an earlier check, and Launchwright's own examples are all out of date until a page confirms them.
2. **Every claim has its source and its date:** the page's name, its address, and the date you read it, in the user's time zone (the kit's settings).
3. **Never guess.** A page you couldn't read is "not read", with the reason. A figure you couldn't find is left out, not estimated.
4. **Respect each site's terms.** Never read a page on the "never read" list in `sources.md`: Spotify, YouTube, Apple's App Store pages, and sites that copy App Store listings among them. Before using any other site for the first time, check its terms for automated reading and AI use. Honour each site's robots.txt (on Google Play: an app's own listing yes; store search and the full reviews list no).
5. **Search results find things; pages prove them.** Open the page before you use a number or a feature from it, when the site allows it. A number seen only in a search result is marked "seen in search results, page not opened" and never carries the verdict on its own (`sources.md`, "Finding things").
6. **Numbers are copied exactly as the page shows them:** "50K+ downloads", "3.0 stars from 306 reviews", "$6.99 - $44.99 per item". Never round, convert or add them up.
7. **Demand and competition together.** A busy market is not bad news on its own, and an empty one is not good news on its own: say what each one means for this app.
8. **The verdict and the tweaks are Claude's view,** and are said as that. The idea, its name and its price stay the user's. A tweak may suggest a change to what version 1 does; it never sets a price.
9. **Nothing is sent anywhere.** The check only reads public pages and runs web searches. It never signs in, never fills in a form, never contacts an app's maker, and never uses a paid tool.

## 1. When it runs

| When | What happens |
| --- | --- |
| **An idea's description is confirmed** (the end of idea intake) | Screen 4 (section 2): on by default when the source note says the idea is public; offered otherwise |
| **The user asks** ("how's the market?", "is anyone doing this?", "check the competition") | Run it, for the idea they mean |
| **"Do a deeper round"** at screen 5 | Section 8a |
| **The description changes a lot later** (a new audience, a different main feature) | Offer it again, in one line, with "Skip" as an option |

## 2. Screen 4 · Ask once

Read the idea's source note (source.md). If **Public idea** is yes, the check is on by default; say why in one line, as idea intake does:

> Before we design it, I'll spend about 30 minutes on demand and competition. The goal is an app that makes money: more demand, less competition.
> This idea was on a public podcast, so others heard it too. That's why the check is on.
>
> • Run it *(recommended)*
> • Skip it

If the idea is the user's own, the check is offered, because it can fine-tune even an idea the user is sure of:

> Want a quick check on demand and competition first? About 30 minutes. Even a good idea can come out sharper.
>
> • Run it *(recommended: it can sharpen the idea)*
> • Skip it

**Run it:**

> Started. You can close this. I'll alert your phone when it's ready.

**Skip it:** write in market.md "Skipped by the user on <date>." under Verdict, and go on to the name (spec screen 6). Don't ask again unless section 1 says to.

## 3. Make the list of what to look for

Read, without saying anything to the user yet:
- the confirmed description: the pitch, who it's for, the problem, what version 1 does, how it makes money, where it runs
- the source note: whether the idea is public, any apps or competitors it names, and what the user said
- the kit's settings, for the user's time zone and where the app is offered first, if that's known (otherwise the user's own country, from the time zone)

Then write down, for yourself:
1. **The problem in plain words,** as a person would search for it ("food going off in the fridge", "what to cook with what I have").
2. **The job the app does,** in three or four ways people might name it ("expiry tracker", "pantry app", "recipes from ingredients", "fridge inventory").
3. **The apps to look at:** any the source note names, plus what the searches in section 5 find.

## 4. Demand: do people want this?

Look for signals, strongest first, and keep three to five that really bear on this app:

| Signal | Where | What it shows |
| --- | --- | --- |
| **Downloads and reviews of the closest apps** | Each app's Google Play listing (`sources.md`) | People already install and rate apps for this job. "1M+ downloads, 18.8K reviews" is strong; a field where every app has "10+" is weak or very new |
| **How big the problem is** | An official report or statistics page (`sources.md`, "Numbers about the problem") | How many people have the problem, or what it costs them |
| **People asking for it** | Pages people write themselves, on sites whose terms allow reading (rule 4) | The problem in their own words, and what they've tried |
| **Search interest** | A search-trends page, only if the environment can reach it and its terms allow it | Whether interest is growing, steady or seasonal |
| **What the idea's source says** | The source note: the episode, video or document | Why the hosts or the user think there's demand. It's a reason to look, not evidence |

For each signal, write: what it is, the number exactly as the page shows it, the source, and the date read. Then judge demand in one word for yourself: **strong**, **some** or **weak**, and one line on why.

## 5. Competition: who already does this?

1. **Find the closest apps.** Run three or four web searches with the job's names from section 3 (one limited to play.google.com, one open, one with "app" and the problem's words). Take the five to eight apps closest to what version 1 does; the closest are the ones a person with the problem would find first.
2. **Open each app's Google Play listing,** one at a time (`sources.md`). Note: name, maker, what it does (from its own description, in a few words), rating and number of reviews, downloads, "Contains ads", the in-app purchase range, and last updated. Read the reviews the page shows for what people complain about.
3. **Read each app's own website** for its plan's price, if the environment can reach it and its terms allow it.
4. **iPhone-only apps:** never open their App Store page (`sources.md`). Use the name and link from the search result, and the app's own website. Mark rating and price "App Store only, not read" unless the user sends a screenshot (section 9).
5. **What each one misses,** compared with this app's version 1: a feature it lacks, a step people complain about in its reviews, a price that's high for what it does. Say it only when its listing, its site or its reviews show it.

Then judge competition in one word for yourself: **crowded** (several apps with many downloads doing the same job), **busy but beatable** (many small or new apps, or big ones with clear complaints), or **open** (few apps, none doing this job well), with one line on why.

## 6. The verdict and the tweaks

**The verdict** is one line that puts demand and competition together and says where this app can win:
- strong demand, open field: the best case; say so plainly
- strong demand, busy but beatable: say what the app must be better at, from the complaints and gaps
- strong demand, crowded: say it honestly, and what would make this app stand apart, if anything
- weak demand: say so honestly, whatever the competition; suggest how the idea could reach a bigger need, if the evidence shows one

Never soften a weak verdict, and never oversell a strong one. The user decides what to do with it.

**Up to three tweaks,** each tied to a finding: a gap in the closest apps, a complaint in their reviews, or a part of the demand the idea doesn't reach yet. Each is one line saying what changes in version 1 and why. A tweak never sets a price and never adds a paid service without saying so. No tweak is better than a weak one; zero is fine.

## 7. Write market.md

Fill in the kit's headings. Save it as you go, so a check that stops part-way leaves what it found.

```markdown
# The market check

Checked on Nov 18, 2026, for Use It Up (ideas/use-it-up/description.md). Quick check, about 30 minutes. Times are America/Chicago.

## Demand
Strong. <one line why>
- <signal, with the number as the page shows it>. Source: [<page name>](<address>), read Nov 18, 2026.

## Competitors
Busy but beatable. <one line why>

| App | What it does | Price | Rating | Downloads | What it misses |
| --- | --- | --- | --- | --- | --- |
| <name> (<maker>) | <a few words> | <as shown> | <stars, reviews> | <band> | <gap, and where it shows> |

## Verdict
<one line>

## Suggested tweaks
1. <tweak>: <why, from which finding>. Taken: not yet.

## Sources
| Page | Address | Read | Notes |
| --- | --- | --- | --- |
```

- **Rating** is "3.0 stars, 306 reviews", "no rating yet", or "App Store only, not read".
- **Under Sources,** every page read, every search run (its words and the date), and every page not read with the reason ("never read: Apple's terms", "site not reachable from the cloud").

## 8. Screen 5 · Tell the user

When it's done, send one alert at the fyi level through the kit's alert script: "Market check ready for <working name>." Then, when the user opens the chat, show screen 5 on one phone screen, about 60 words (the front door, section 4): a demand line, the closest one to three apps, the verdict, and the tweaks.

> The market check for Use It Up is ready.
> **Demand:** strong. SuperCook, an app that finds recipes from what you have, shows 1M+ downloads.
> **Closest apps:** NoWaste (3.0 stars, 50K+ downloads) already scans receipts; its reviews say adding food is a chore.
> **Verdict:** real demand, a busy field. Win by being the easiest.
> **Tweaks:** 1. Lead with tonight's dinner. 2. Make the receipt scan fill in the dates.
>
> • Use the tweaks *(recommended: they answer what people complain about)*
> • Keep the idea as is
> • Do a deeper round

Sources aren't shown on the first screen, so it fits on a phone. If the user asks where a number came from, give the page's name and the date read, in one line.

**Use the tweaks:** each tweak changes the description, so show what changes, in at most three lines, and confirm once:

> Here's what changes in the description:
> • Version 1 opens on tonight's dinner, from what goes off first
> • The receipt scan fills in the dates; you only fix the odd one
>
> • Looks right *(recommended)*
> • Change something

Then update description.md, mark each tweak "Taken: yes, <date>" in market.md, commit, and go on to the name. The user can take some tweaks and not others: typing "just the first one" works.

**Keep the idea as is:** mark the tweaks "Taken: no" and go on to the name.

**Do a deeper round:** section 8a.

### 8a. The deeper round (optional)

The same rules, more pages. It usually takes about an hour, in the background, and ends with the same alert and an updated screen 5:
- up to fifteen apps instead of eight, on Google Play and from search results for iPhone
- every closest app's own website, for its plan's prices and what's free
- what people complain about most in the reviews the closest apps' pages show, grouped into the top three complaints
- more demand sources: official figures for each country the app is for first, and pages where people describe the problem, on sites whose terms allow reading
- for each of the three closest apps, how it makes money (free with a paid plan, one-time price, ads), so the question sweep can show what similar apps charge

Write it under the same headings, with "Deeper round, <date>" at the top, keeping the quick check's findings and adding to them.

## 9. When a page can't be read

Carry on with the rest, then ask once, and only for what would change the verdict (usually the closest iPhone-only app's rating or price). Ask it on its own, just before screen 5, because screen 5 has its own question; once the user sends it or skips, show screen 5 with what you have. Ask only when the app runs on iPhone and the user has one (setup's step 9 puts a test app on it); otherwise leave the app's rating as "App Store only, not read".

> One thing I can't read for you: the App Store's page for AI Fridge, the closest iPhone app. Could you send a screenshot?
> **Where:** the App Store app on your iPhone. Search for "AI Fridge".
> **Do:** open its page and take a screenshot of the top, with the stars and the price.
> **You'll see:** the app's name, its stars and "Get" or a price.
>
> • Here it is
> • Skip it *(the check is complete without it)*

Save what the user sends as the source ("a screenshot the user sent, Nov 18, 2026").

If a whole site can't be reached from the cloud, say which site in the report, and that the setup's list of sites should include it; don't ask the user to change their environment in the middle of a check.

## 10. Saving

1. **market.md** is saved as you go (section 7).
2. **The source note** keeps a line: "Market check: Nov 18, 2026; tweaks taken: 1 and 2" (or "skipped").
3. **Commit and push** to the project's working branch, as the project's `AGENTS.md` says. If the project has no working branch (only the user pushes), commit and say so at the end.
4. **The status:** a market check run as its own piece starts and finishes with the kit's status script, like any piece. A screenshot waiting on the user is a status ask at level fyi, with no alert of its own.
5. **Hand-offs:** the design direction reads market.md for how the closest apps look; the mockup for real content; the question sweep for what similar apps charge. Nothing else to write.

Then go on to the name (spec screen 6).
