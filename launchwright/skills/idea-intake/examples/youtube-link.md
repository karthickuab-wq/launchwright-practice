# Dry run: a YouTube link, worked from what the user pastes (start A)

A dry run of the idea-intake skill on the walkthrough's sample idea, done on Nov 18, 2026. The video, the people and the app are made up, as in the walkthrough. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## What the user gave

The user, in the home project, pastes `https://youtu.be/k48example` with no other words.

The first message already is the idea, so screen 2 is skipped. YouTube pages are never opened (the skill's "Which pages Claude may open"), so Claude fetches nothing and asks for the words straight away.

## The conversation

**Screen A1, a YouTube link.**

> I can't read YouTube pages or watch video, so I need the words from you.
> **Where:** the YouTube app, on this video.
> **Do:** tap "…more" under the title. Copy the description and paste it here. If there's a "Show transcript" button further down, copy the transcript too.
> **You'll see:** the video's description, and the spoken words with times beside them.
>
> • I've pasted it *(recommended: then I can work from the video itself)*
> • There's no description or transcript

The user pastes the description (made up):

```text
We sketch the leftovers app we wish existed. Subscribe for more!
```

*Enough?* No. It names a "leftovers app" but doesn't say what it would do or who it's for. Claude doesn't fill that in from the line, and asks for the transcript:

> That only says it's about a leftovers app, not enough to describe it.
> **Where:** the YouTube app, on this video.
> **Do:** under the description, tap "Show transcript". Copy it and paste it here.
> **You'll see:** the spoken words with times beside them.
>
> • I've pasted it *(recommended: then I can work from the video itself)*
> • There's no transcript

The user pastes (made up, shortened):

```text
0:12 so this week we're talking food waste
3:10 honestly we throw away about a third of what we buy
9:45 what I want is simple, tonight tell me what's about to go off and give me something I can make with it
16:20 and it has to be quick, like fifteen minutes, or nobody's cooking it on a Tuesday
22:05 maybe one nudge the evening before
33:15 it's for busy families really, people who buy good food and waste it
```

Claude reads the pasted words the same way as a page: only what's there. It says nothing about receipts, typing or money, so none of those appear as the episode's words.

**Screen A2b.**

> Here's what the episode says:
> • **The idea:** an app that tells you what to cook tonight from food that's about to go off
> • **For:** busy families who buy good food and waste it
> • **The problem:** about a third of the shopping gets thrown away
> • **What they said:** recipes of 15 minutes; one nudge the evening before
>
> • Build it as is *(recommended: the idea is clear as it stands)*
> • Improve it slightly
> • Dig deeper first

No easy win stands out from what was said, so none is offered, and "Build it as is" comes first. The user taps: Build it as is.

**The gaps.** Two questions, as in the first example: money (the user taps "Free, with a paid plan") and where it runs (the user taps "iPhone and Android").

**Screen 3.**

> Here's your app on one page.
> **Working name:** Use It Up (the final name comes later)
> **In one line:** tells you what to cook tonight from food that's about to go off
> **For:** busy families who buy good food and throw a third of it away
> **Version 1 does:** add the food you buy; shows what to use first; 15-minute recipes from what you have; one reminder the evening before
> **Later:** receipt scanning, sharing with family, weekly meal plans
> **Money:** free, with a paid plan
> **Runs on:** iPhone and Android
> **Needs:** a recipe service, the stores' in-app purchases
> **Open questions:** none
>
> • Confirm *(recommended)*
> • Change something

The user taps: Confirm. Saved, and handed on to the market check in the same message, as in the first example.

## What was saved

**description.md**, in the kit's format:

```markdown
# The app description

Confirmed on Nov 18, 2026, from a YouTube link with a pasted transcript (start A).

## Working name
Use It Up. The final name is chosen later.

## The pitch
An app that tells you what to cook tonight from the food in your kitchen that's about to go off.

## Who it's for, and the problem
Busy families who buy good food and throw about a third of it away, because nobody notices it's going off in time.

## What version 1 does
1. Add the food you buy, by typing.
2. Show what to use first, soonest to go off at the top.
3. Suggest recipes of 15 minutes or less from what's there.
4. Send one reminder the evening before something goes off.

## What waits until later
Scanning receipts, sharing a kitchen with the family, and weekly meal plans.

## How it makes money
Free to use, with a paid plan. The price is set later, at the question sweep.

## Where it runs
iPhone and Android first.

## Outside services
A recipe service, for the recipes. Apple's and Google's in-app purchases, for the paid plan.

## Open questions
None.
```

**source.md**:

```markdown
# Where this idea came from

- **Start:** a YouTube link
- **Public idea:** yes. A public video that anyone can watch.
- **What was read:** the user gave https://youtu.be/k48example, which wasn't opened (YouTube). The video's description and its transcript were pasted by the user on Nov 18, 2026.
- **Claude's suggestions the user kept:** the working name; the "later" list, receipt scanning among it; the outside services.
- **What the user said:** "Build it as is"; money: free, with a paid plan; runs on iPhone and Android first.
```

## Checked against the skill

- The YouTube link wasn't opened; the first message asked for the words at once.
- The thin description led to the transcript ask, not to a summary from one line.
- The summary uses only the pasted transcript; nothing about receipts or money is put in the episode's mouth.
- With no clear easy win, "Build it as is" was recommended.
- The description has the kit's nine headings, in order.
