---
name: design-direction
description: Shows the user three style choices for their app, each as the app's main screen with real content on the mockup page, asks which one they want, and turns the choice into a short design guide (colours, type, spacing, tone of voice, do's and don'ts) that the mockup and the app follow. Use after the app's name is chosen, or when the user wants to change how their app looks.
---

# Design direction

Before the mockup, the user picks how their app should look and sound. They see three style choices, each one real screen of their own app with its real content, pick one with a tap, and that choice becomes a short design guide. The mockup, and later the app, follow the guide exactly (spec section 6, screen 8; brief F6).

Follow the phone and voice conventions in the front door (`skills/launchwright/SKILL.md`, section 4). Every line the user sees is a quoted line here; adapt the words to the moment, keep the shape.

## What's in this folder

| File | What it is |
| --- | --- |
| `skills/design-direction/check-contrast.mjs` | Checks that every style's text colours are easy to read on their backgrounds |
| `skills/design-direction/check-contrast-test.mjs` | Its tests |
| `skills/design-direction/examples/usewell/styles.html` | The dry run's style choices: Usewell's Today screen as "Calm and airy", "Bold and playful" and "Clean and serious" |
| `skills/design-direction/examples/usewell/design.md` | The design guide made from the dry run's choice, in the kit's format |

The three styles are shown through the mockup skill's page (`skills/mockup/page.html`), built and checked with its scripts. Read `skills/mockup/SKILL.md`, sections 2 to 5 and 7, before writing the styles file.

In a project, the kit keeps this folder as launchwright/skills/design-direction/, and the files this skill writes are:
- mockup/styles.html (made by this skill): the style choices, in the mockup's screens-file format.
- mockup/styles-page.html (made by this skill): the built page that's published.
- project/design.md: the design guide. The kit starts it with its headings; this skill fills it in.

## When it runs

After the user has chosen the app's name (spec screen 6), and before the mockup. It also runs when the user asks to change how the app looks; see section 7.

Read first, without saying anything to the user yet:
- the confirmed description (project/description.md): who the app is for, when and where they'll use it, and what version 1 does
- the market check (project/market.md), if there is one: how the closest apps look, so at least one choice clearly stands apart from them
- the rules list (project/rules.md), for anything that touches looks, such as a store's rule on how a paid plan is shown
- the chosen name, and any comment the user has made about looks so far, in the description or the decisions (project/decisions.md)

## 1. Pick three styles that fit this app

Three styles that are really different from each other, so the choice means something: different colours, different type, different spacing and a different tone of voice, not one look in three colours. A good spread is one calm, one lively and one plain and businesslike, as in the dry run: "Calm and airy", "Bold and playful", "Clean and serious". Name them for what they feel like, in two or three plain words, and change them when the app calls for it (an app for children might get "Bright and bouncy"; one for lawyers "Quiet and precise").

Recommend one, with one line on why it fits **the people who'll use this app**, taken from the description. For Usewell: "It suits tired people deciding dinner." Never recommend a style because it's the plainest to build.

## 2. Pick the screen

All three styles show the **same one screen**: the app's main screen, the first screen of the main flow the mockup will show (its section 1), such as Usewell's Today. It has to be a screen with real things on it: a list, a card and the one main action, so the style has something to show. Not a sign-in or an empty screen.

The content is the same in all three, real and specific, from the description and the market check: real names, real amounts, real times, real prices marked as samples. Only the words that carry the tone change (the title, the button, the small line under the title), because the tone of voice is part of each style. Never lorem ipsum or "placeholder"; the build refuses them.

## 3. Write the styles file

The styles file is a mockup screens file (the mockup skill's section 2) with:
- `mockup-kind` set to `styles`, and `mockup-flow` naming the one screen.
- **One theme block per style:** `.app.theme-calm { … }`, `.app.theme-bold { … }`, `.app.theme-clean { … }`, each setting every one of the page's variables (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--accent-soft`, `--warn`, `--warn-soft`, `--amber`, `--amber-soft`, `--good`, `--good-soft`, `--radius`, `--title`) as `#` colours, plus any of the style's own.
- **One template per style,** all with the same `data-screen`. The first gets the name, group and about; each gets `data-variant` (the style's name, as the user will see it) and `data-theme`. **The recommended style comes first,** because the page opens on it.
- Tab bars and other controls use the mockup page's line icons (`data-icon`, the mockup skill's section 2), never emoji, so each style colours them its own way.
- Each style may lay the screen out its own way (rows, tiles or a table), with its own classes. Start every class with the app's prefix (Usewell uses `uw-`) and scope a style's changes to the page's building blocks under its theme, such as `.theme-bold .a-title`.
- Every button gets its `data-note`, as in any mockup. Only the screen itself exists, so tabs and buttons that would open other screens have a note and no `data-go`.

**Fonts:** the phone's own font in every style (San Francisco on iPhone, Roboto on Android), so the mockup shows what the app will really look like and nothing is downloaded. The styles differ by size, weight, letter spacing and capitals. A downloaded font is a later change the user can ask for, never part of a first style.

**Quality, because the user picks from these:**
- **Readable:** every text colour at least 4.5 to 1 on its background (section 4 checks it). Body text at least 16 pixels, nothing anyone reads under 13.
- **A real phone's sizes:** tap targets at least 44 pixels, nothing wider than 390 pixels.
- **Each style finished,** at the quality of the mockup's first flow. A weak second and third choice push the user toward the first; make each one something a designer would be glad to ship.
- **The most important thing visible without scrolling** in every style: the title, the list, and the start of the main action.

See `skills/design-direction/examples/usewell/styles.html`.

## 4. Build and check it

In a project:

```
node launchwright/skills/mockup/make-page.mjs mockup/styles.html mockup/styles-page.html
node launchwright/skills/mockup/check-mockup.mjs mockup/styles-page.html --shots <a folder outside the repo>
node launchwright/skills/design-direction/check-contrast.mjs mockup/styles.html
```

In the plugin, for the example, use the same scripts from `skills/` and the example's path.

The contrast check reads each theme block and checks text on the background, text and muted text on a card, links, the main button's words, and each tag's words on its tint. It refuses any pair under 4.5 to 1 and lists each with its colours, so the fix is plain: darken the text colour or lighten its background, keeping the style's feel.

If the project's guard refuses to run a script from the skills folder, build the page by hand as the mockup skill says (its section 3), check the colour pairs yourself with the same 4.5 to 1 rule, and say in your report that the guard refused, with its words.

Then **look at all three screenshots side by side** as a demanding designer would: is each style clearly itself, is anything cramped, wrapped badly or cut off, does each one look finished? Fix it and check again.

## 5. Ask the user

Publish the built page as a Claude artifact page, the first time with the title from `mockup-title` (such as "Usewell: pick a style") and the icon word "palette", and give it the comments capability, as the mockup skill's section 5 says. It's a page of its own, apart from the mockup.

**Screen 8 · Design direction.**

> Here's Usewell's main screen in three styles, with your real content. Switch between them at the top of the page.
> [link to the styles page]
>
> Which one feels like Usewell?
> • Calm and airy *(recommended: it suits tired people deciding dinner)*
> • Bold and playful
> • Clean and serious

The user may also comment on the page or say what they like in their own words ("calm, but with the bold one's big title"). Then:
- **A mix of two styles:** make it as a fourth version on the same page ("Calm, with a bigger title"), check it, republish, and ask once more with that version first and recommended:
  > I've added "Calm, with a bigger title" to the page.
  > • Use this one *(recommended: it's what you asked for)*
  > • Go back to plain Calm and airy
- **"None of these":** ask one question about what they'd like it to feel like, then make three new choices and ask again:
  > No problem. What should it feel like? A word or two is enough, like "warm", "sporty" or "like a notebook".
- **A comment that changes the app, not its look** (a new feature, a different screen): leave it for the mockup, where screens are decided, and say so in one line.

## 6. Write the design guide

When the user picks, fill in the project's design guide (project/design.md), keeping the kit's headings in their order:
- **The style chosen:** its name, the date, and one line on why it fits this app.
- **Colours:** a table of every theme variable from the chosen style, with what it's for and its value, so the mockup and the app use exactly the same colours. Say that every text colour passed the contrast check.
- **Type:** the phone's own font, and the sizes and weights for the screen title, section headings, body, second lines, tags and the main button.
- **Spacing and shapes:** the spacing steps, corner rounding, the tap-target size (at least 44), and how cards are set apart (tint, border or shadow).
- **Tone of voice:** two or three lines in the style's voice from the chosen screen, each next to what the app never says.
- **Do's and don'ts:** five to eight rules every screen follows, drawn from the chosen style: what the one strong colour is for, where the main button goes, how times are written, and what the app never does.

Keep it short: one phone screen per section at most. See `skills/design-direction/examples/usewell/design.md`.

Record the choice in the project's decisions (project/decisions.md), under "Decided by the user": the date, the style chosen, the three choices offered, and the styles page's link. Then tell the user, and go on:

> Your design guide is saved: Calm and airy, with its colours, type and tone. The mockup and the app both follow it.
> Next, the main flow of Usewell, at full quality.
> • Show me *(recommended)*
> • Not now

"Show me" opens the mockup skill (`skills/mockup/SKILL.md`), which copies the chosen style's theme block into the mockup's screens file as its `.app` block. "Not now" leaves it there; the front door offers the mockup next time.

## 7. Changing the look later

If the user asks to change how the app looks after the guide is saved, change the guide, not one screen at a time:
- **A small change** (one colour, a bigger title): make it in the guide and the mockup's theme, run the contrast check, republish the mockup, and say what changed in one line.
- **A different style:** run this skill again from section 1, with the current style as one of the three choices. If the build has started, say first what it holds up:
  > A new style means every screen built so far gets restyled, about half a night of building.
  > • Keep the current style *(recommended: the app ships sooner)*
  > • Change the style

Record either change in the project's decisions.

## What's Claude-only here

Everything in this folder is portable except publishing: the styles page is plain, self-contained HTML, and the contrast check is plain Node with no packages. Publishing it as a Claude artifact page, the comments capability and reading the comments are Claude's, as in the mockup skill. A port publishes the page its own way and reads pasted comments.
