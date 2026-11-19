# Dry run: a short document (start C)

A dry run of the idea-intake skill on the walkthrough's sample idea, done on Nov 18, 2026. The document and the app are made up, as in the walkthrough. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## What the user gave

The user taps "New app idea", then "Upload a document".

**Screen C1.**

> Attach it here: notes, a pitch, anything.

The user attaches "Leftovers app notes", a short PDF. Its text (made up):

```text
Leftovers app: notes

Problem: busy households buy good food and bin a lot of it. Stuff gets pushed to the
back of the fridge and nobody notices till it's off.

What it does:
- shows what to use first (what's going off soonest)
- a quick recipe for it, 15 min max
- scan the receipt so you never type the shopping in
- a reminder the night before
- maybe: share the kitchen with family, barcode scanning, meal plans for the week

Money: free app, paid plan for extras (unlimited recipes, unlimited scans).

Competitors to look at: a couple of fridge-tracking apps, a recipe-from-ingredients app.
```

## The conversation

**Screen C2.** Every line from the notes. One idea, so no "which idea" question.

> Here's what your notes say:
> • **The idea:** meals from food that's about to go off
> • **For:** busy households
> • **Main thing:** what to use first, and a quick recipe for it
> • **Also:** receipt scanning; a reminder the night before
> • **Money:** free, with a paid plan
>
> • That's it *(recommended)*
> • Fix something

The user taps: That's it.

**The gaps.** Who it's for, version 1 and money are in the notes; the "maybe" items go to later. The notes don't say where it runs, so one question:

> Question 1 of 1 · Holds up: the description
> Where should it run first?
> • iPhone and Android *(recommended: one build covers both)*
> • iPhone and Android, and the web
> • Just the web

The user taps: iPhone and Android.

**Screen 3.**

> Here's your app on one page.
> **Working name:** Use It Up (the final name comes later)
> **In one line:** tells you what to cook tonight from food that's about to go off
> **For:** busy households who bin good food because nobody notices it's going off
> **Version 1 does:** shows what to use first; a 15-minute recipe for it; add food by scanning a receipt; a reminder the night before
> **Later:** sharing with family, barcodes, weekly meal plans
> **Money:** free, with a paid plan for unlimited recipes and scans
> **Runs on:** iPhone and Android
> **Needs:** a recipe service, receipt reading, the stores' in-app purchases
> **Open questions:** none
>
> • Confirm *(recommended)*
> • Change something

The user taps: Change something, and says "call it Fridge Rescue for now".

> Here's your app on one page.
> **Working name:** Fridge Rescue (the final name comes later)
> **In one line:** tells you what to cook tonight from food that's about to go off
> **For:** busy households who bin good food because nobody notices it's going off
> **Version 1 does:** shows what to use first; a 15-minute recipe for it; add food by scanning a receipt; a reminder the night before
> **Later:** sharing with family, barcodes, weekly meal plans
> **Money:** free, with a paid plan for unlimited recipes and scans
> **Runs on:** iPhone and Android
> **Needs:** a recipe service, receipt reading, the stores' in-app purchases
> **Open questions:** none
>
> • Confirm *(recommended)*
> • Change something

The user taps: Confirm.

> Saved.

The same message goes on with the market check's screen 4. The notes are the user's own, not public, so the check is offered rather than on by default. The competitors the notes name are passed on to it in the source note.

## What was saved

In the home project, a new folder for the idea, fridge-rescue, under the ideas folder.

**description.md**, in the kit's format:

```markdown
# The app description

Confirmed on Nov 18, 2026, from an uploaded document (start C).

## Working name
Fridge Rescue. The final name is chosen later.

## The pitch
An app that tells you what to cook tonight from the food in your kitchen that's about to go off.

## Who it's for, and the problem
Busy households who buy good food and bin a lot of it: things get pushed to the back of the fridge, and nobody notices until they've gone off.

## What version 1 does
1. Show what to use first, soonest to go off at the top.
2. Suggest a quick recipe for it, 15 minutes at most.
3. Add food by scanning a shopping receipt, so the shopping is never typed in.
4. Send a reminder the night before something goes off.

## What waits until later
Sharing a kitchen with the family, scanning barcodes, and weekly meal plans.

## How it makes money
Free to use, with a paid plan for extras: unlimited recipes and unlimited receipt scans. The price is set later, at the question sweep.

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

- **Start:** a document
- **Public idea:** no. The user's own notes.
- **What was read:** "Leftovers app notes", a PDF the user attached on Nov 18, 2026, read in full.
- **Claude's suggestions the user kept:** the outside services.
- **What the user said:** working name "Fridge Rescue"; runs on iPhone and Android first.
- **For the market check:** the notes name competitors to look at: "a couple of fridge-tracking apps, a recipe-from-ingredients app".
```

## Checked against the skill

- Every summary line comes from the notes; the "maybe" items went to later, not version 1.
- Only the one gap the notes left (where it runs) was asked.
- "Change something" showed the whole page again; only Confirm saved it.
- The description has the kit's nine headings, in order; version 1 has four things.
