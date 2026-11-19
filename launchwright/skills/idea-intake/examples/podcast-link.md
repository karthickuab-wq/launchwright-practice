# Dry run: a Spotify podcast link, read from the show's own website (start A)

A dry run of the idea-intake skill on the walkthrough's sample idea, done on Nov 18, 2026. The podcast, its website, the people and the app are made up, as in the walkthrough. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## What the user gave

The user, in the home project: *"New app idea"*, then a tap on "Paste a podcast or YouTube link", then the link `https://open.spotify.com/episode/0kTf48example`.

Spotify pages are never opened (the skill's "Which pages Claude may open"), so Claude doesn't fetch the link. Its address doesn't spell the show's name.

## The conversation

**Screen A1, a podcast link.**

> I don't open podcast app pages myself, so I'll look for the show's own website instead.
> What's the show called, and which episode? The title or number is enough.
> • I'll type it *(recommended: then I can find the show's notes)*
> • I'd rather tell you the idea myself

The user types: *Kitchen Table Founders, the leftovers one, 48 I think.*

**Finding the show's own page.** A web search for "Kitchen Table Founders podcast" lists (made up):

```text
Kitchen Table Founders · ktfounders.example
Kitchen Table Founders | Podcast on Spotify · open.spotify.com
Kitchen Table Founders on Apple Podcasts · podcasts.apple.com
```

Claude opens only the first, the show's own website. Its episode list has "48 · The app I wish existed for leftovers", so it's the same show and episode. The Spotify and Apple Podcasts results aren't opened.

> Reading the episode's notes on the show's own website now: the description, show notes and any transcript posted there.
> I can't hear audio, so I only use what's written there.

## What the show's page held

This is the whole of what the fetch of `https://ktfounders.example/48` returned (made up):

```text
Kitchen Table Founders · Episode 48
"The app I wish existed for leftovers"
Published Nov 3, 2026 · 41 minutes

This week Dee and Marcus talk about food waste at home. Dee's family bins about a
third of the food they buy, mostly because nobody notices it's going off until it's
too late. They sketch the app they wish existed.

Show notes
- 03:10 Why we throw away a third of our shopping
- 09:45 The app: tell me tonight what's about to go off, and what I can make with it
- 16:20 Recipes have to be quick: 15 minutes, or nobody cooks them on a weeknight
- 22:05 A nudge the evening before, not a wall of notifications
- 27:40 Why we both gave up on the apps we tried: typing in the shopping is a chore
- 33:15 Who it's for: busy households who buy good food and waste it
- 38:30 Would people pay? Marcus: "a few dollars a month, if it actually saves food"

Transcript (posted by the show)
[09:45] Dee: What I want is simple. Tonight, tell me what's about to go off, and give
me something I can make with it...
[27:40] Marcus: I tried two of them. Both wanted me to type in every item. I lasted a
week.
```

*Enough?* Yes: the notes say what the app does (09:45) and who it's for (33:15). One idea only.

**Screen A2b.**

> Here's what the episode says:
> • **The idea:** an app that tells you what to cook tonight from food that's about to go off
> • **For:** busy households who buy good food and waste it
> • **The problem:** nobody notices food is going off until it's too late
> • **What they said:** recipes of 15 minutes; a nudge the evening before
>
> **An easy win:** scan the receipt instead of typing the shopping in. Both said typing was why they gave up on other apps.
>
> • Improve it slightly *(recommended: adds the receipt scan)*
> • Build it as is
> • Dig deeper first

The user taps: Improve it slightly.

**The gaps.** Who it's for and what version 1 does come from the page. How it makes money is the user's call (Marcus's remark is a hint, not the user's answer), and the page says nothing about where it runs. Two questions:

> Question 1 of 2 · Holds up: the description
> How should it make money?
> • Free, with a paid plan *(recommended: people try it first; the hosts said they'd pay monthly)*
> • One price to download
> • Free, with ads

The user taps: Free, with a paid plan.

> Question 2 of 2 · Holds up: the description
> Where should it run first?
> • iPhone and Android *(recommended: one build covers both)*
> • iPhone and Android, and the web
> • Just the web

The user taps: iPhone and Android.

**Screen 3.**

> Here's your app on one page.
> **Working name:** Use It Up (the final name comes later)
> **In one line:** tells you what to cook tonight from food that's about to go off
> **For:** busy households who throw food away because nobody notices it's going off
> **Version 1 does:** add food by scanning a receipt or typing; shows what to use first; 15-minute recipes from what you have; a reminder the evening before
> **Later:** sharing with family, barcodes, weekly meal plans
> **Money:** free, with a paid plan
> **Runs on:** iPhone and Android
> **Needs:** a recipe service, receipt reading, the stores' in-app purchases
> **Open questions:** none
>
> • Confirm *(recommended)*
> • Change something

The user taps: Confirm.

> Saved.

The same message goes on with the market check's screen 4, on by default because the source note marks the idea public (`skills/market-check/examples/usewell.md`, section 2).

## What was saved

In the home project, a new folder for the idea, use-it-up, under the ideas folder.

**description.md**, in the kit's format:

```markdown
# The app description

Confirmed on Nov 18, 2026, from a podcast link (start A).

## Working name
Use It Up. The final name is chosen later.

## The pitch
An app that tells you what to cook tonight from the food in your kitchen that's about to go off.

## Who it's for, and the problem
Busy households who buy good food and throw a lot of it away, because nobody notices it's going off until it's too late. The apps they've tried gave up on them because typing in the shopping is a chore.

## What version 1 does
1. Add food by scanning a shopping receipt, or by typing.
2. Show what to use first, soonest to go off at the top.
3. Suggest recipes of 15 minutes or less from what's there.
4. Send one reminder the evening before something goes off.

## What waits until later
Sharing a kitchen with the family, scanning barcodes, and weekly meal plans.

## How it makes money
Free to use, with a paid plan. The price is set later, at the question sweep.

## Where it runs
iPhone and Android first.

## Outside services
A recipe service, for the recipes. Receipt reading, to turn a photo of a receipt into a list of food. Apple's and Google's in-app purchases, for the paid plan.

## Open questions
None.
```

**source.md**:

```markdown
# Where this idea came from

- **Start:** a podcast link
- **Public idea:** yes. A public podcast episode that anyone can hear.
- **What was read:** the user gave https://open.spotify.com/episode/0kTf48example, which wasn't opened (Spotify). The show's own episode page, https://ktfounders.example/48, read Nov 18, 2026: title, description, show notes and the transcript posted by the show. The show's name and episode came from the user.
- **Claude's suggestions the user kept:** the receipt scan (the easy win, from 27:40 in the episode); the working name; the "later" list; the outside services.
- **What the user said:** "Improve it slightly"; money: free, with a paid plan; runs on iPhone and Android first.
```

## Checked against the skill

- The Spotify link wasn't opened, and neither were the Spotify and Apple Podcasts search results; only the show's own page was read.
- Only the show's page and the user's taps are used; the receipt scan is named as Claude's suggestion, tied to the episode.
- Money and where it runs were asked, not taken from the hosts' remarks, and written only as far as the answers went (no "web later" the user didn't choose).
- The description has the kit's nine headings, in order; version 1 has four things.
- The source note marks the idea as public, so the market check is on by default.

## If the show had no website of its own

The same start, but the search lists only the show's Spotify and Apple Podcasts pages, neither of which is opened, and no feed of the show's own. Screen A2a:

> I couldn't find a website or feed of the show's own, so I can't read the episode's notes.
> **Where:** wherever you have the episode's show notes or transcript: the show's newsletter or blog, or notes you took.
> **Do:** copy the show notes or the transcript, and paste them here.
> **You'll see:** your pasted words here in the chat. I'll read them and sum them up.
>
> • I've pasted it *(recommended: then I can work from the episode itself)*
> • I don't have them

The user taps "I don't have them":

> No problem. Tell me the idea yourself, or send me notes about it.
> • Tell me by voice *(recommended: two minutes is plenty)*
> • Upload a document

From there it's start B or C (`voice.md` and `document.md`, in this folder). The source note still says the idea came from a public podcast, so the market check is on by default; what was read is "the user's own words; the Spotify link wasn't opened".
