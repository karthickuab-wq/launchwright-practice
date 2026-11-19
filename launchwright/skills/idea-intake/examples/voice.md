# Dry run: an idea told by voice (start B)

A dry run of the idea-intake skill on the walkthrough's sample idea, done on Nov 18, 2026. The message and the app are made up, as in the walkthrough. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## What the user gave

The user taps "New app idea", then "Tell me by voice".

**Screen B1.**

> Tell me about your app. Tap the microphone on your keyboard and talk for as long as you like. Two minutes is plenty.

The user talks through the keyboard's microphone. The message arrives as typed text, with the slips that speech-to-text makes:

```text
ok so the idea is basically we throw away so much food, like spinach and yogurt and
stuff, and I want an app that tells me tonight here's what's about to go off and here's
something quick you can make with it, like fifteen minutes, and it reminds me the night
before. people would pay a couple of dollars a month I think, and I hate typing in my
shopping so maybe it reads the receipt. oh and my sister has like three kids so its for
people like her too, busy families, they waste the most. not the fancy chef stuff, just
quick.
```

## The conversation

**Screen B2.** Read for meaning: "it's for busy families" and "not the fancy chef stuff" both point at quick, everyday recipes. Nothing needs saying again.

> Here's what I heard:
> • **The idea:** tells you what to cook tonight from food about to go off
> • **For:** busy families who waste the most food
> • **Main thing:** quick, 15-minute recipes from what you have
> • **Also:** a reminder the night before
> • **Money:** a couple of dollars a month
> • **You stressed:** no typing; read the receipt
>
> • That's it *(recommended)*
> • Fix something

The user taps: That's it.

**The gaps.** Who it's for and version 1 come from the user's own words. "A couple of dollars a month" says the user wants a monthly plan, but not whether there's a free version, so that's asked; where it runs isn't said at all.

> Question 1 of 2 · Holds up: the description
> Should there be a free version too, with the monthly plan on top?
> • Free, with a paid monthly plan *(recommended: people try it before they pay)*
> • Paid monthly only

The user taps: Free, with a paid monthly plan.

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
> **For:** busy families who throw away the most food
> **Version 1 does:** add food by scanning a receipt or typing; shows what to use first; 15-minute recipes from what you have; a reminder the night before
> **Later:** sharing with family, barcodes, weekly meal plans
> **Money:** free, with a paid monthly plan
> **Runs on:** iPhone and Android
> **Needs:** a recipe service, receipt reading, the stores' in-app purchases
> **Open questions:** none
>
> • Confirm *(recommended)*
> • Change something

The user taps: Confirm.

> Saved.

The same message goes on with the market check's screen 4. The idea is the user's own, not public, so the check is offered rather than on by default.

## What was saved

**description.md**, in the kit's format:

```markdown
# The app description

Confirmed on Nov 18, 2026, from an idea told by voice (start B).

## Working name
Use It Up. The final name is chosen later.

## The pitch
An app that tells you what to cook tonight from the food in your kitchen that's about to go off.

## Who it's for, and the problem
Busy families, who waste the most food: spinach, yogurt and the like go off before anyone uses them, and typing the shopping into an app is too much of a chore.

## What version 1 does
1. Add food by scanning a shopping receipt, or by typing.
2. Show what to use first, soonest to go off at the top.
3. Suggest quick, everyday recipes of 15 minutes or less from what's there.
4. Send a reminder the night before something goes off.

## What waits until later
Sharing a kitchen with the family, scanning barcodes, and weekly meal plans.

## How it makes money
Free to use, with a paid monthly plan; the user expects about a couple of dollars a month. The price is set later, at the question sweep.

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

- **Start:** told by voice
- **Public idea:** no. The user's own idea.
- **What was read:** the user's spoken message, Nov 18, 2026.
- **Claude's suggestions the user kept:** the working name; the outside services; the "later" list.
- **What the user said:** "we throw away so much food"; "something quick you can make with it, like fifteen minutes"; "people would pay a couple of dollars a month"; "I hate typing in my shopping so maybe it reads the receipt"; money: free, with a paid monthly plan; runs on iPhone and Android first.
```

## Checked against the skill

- Six "Here's what I heard" lines; nothing asked again; the speech slips weren't corrected back to the user.
- The money question asks only what the message left open, and the price waits for the question sweep.
- The description has the kit's nine headings, in order; version 1 has four things.
