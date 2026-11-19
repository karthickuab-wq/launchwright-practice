---
name: mockup
description: Makes the app's clickable, phone-sized mockup page, with a note on each button, a comment box on every screen kept by the page, and a list of screens; first the main flow at final quality, then every screen, until the user approves. Also makes before-and-after mockups for an app the user already has, and is the page the design-direction skill uses to show its three style choices. Use after the design guide is saved, or when a change to an existing app needs a before-and-after.
---

# The mockup

The mockup is the first thing the user sees of their app, and it sets their trust in everything that follows. It's one page, sized for a phone, that shows the app's screens as they'll really look, with the app's real content. The user taps through it, reads what each button does, and comments on any screen. Claude applies or answers every comment and updates the page until the user approves.

Follow the phone and voice conventions in the front door (`skills/launchwright/SKILL.md`, section 4). Every line the user sees is a quoted line here.

## What's in this folder

| File | What it is |
| --- | --- |
| `skills/mockup/page.html` | The page itself, the same for every app: the phone-sized frame, taps between screens, the notes, the comment box, the list of screens, and versions of a screen side by side. Never edit it for one app |
| `skills/mockup/make-page.mjs` | Checks an app's screens file and builds the page from it |
| `skills/mockup/check-mockup.mjs` | Opens the built page on a simulated phone with the network off, checks it, and takes screenshots |
| `skills/mockup/examples/usewell/screens.html` | A new app's mockup: Usewell, the sample recipe app, nine screens |
| `skills/mockup/examples/before-after/screens.html` | An existing app's before-and-after: a groomer's booking screens, now and after |

In a project, the kit keeps this folder as launchwright/skills/mockup/, and the app's mockup lives in the project's mockup folder:
- mockup/screens.html (made by this skill): the app's screens, its theme and its settings. This is what Claude writes.
- mockup/index.html (made by this skill): the built page, which is what gets published.

## When it runs

- **A new app:** after the design guide is saved (project/design.md). It reads the confirmed description (project/description.md), the market check (project/market.md, if there is one), the design guide, and the rules list (project/rules.md): every rule whose **Who acts** names the mockup is a screen the user should see now, such as account deletion or a paid plan's terms, so plan it in section 1 (`skills/rules-check/SKILL.md`, section 4).
- **An app the user already has:** for each change in the upgrade plan, a before-and-after (section 6).
- **Design direction:** that skill shows its three style choices through this page (section 7).

## 1. Plan the screens

From the description's "Version 1 does" list, write down every screen the app needs: first open and sign-in, each main feature, settings, and the paid plan if there is one. Then pick the **main flow**: opening the app and doing its main thing, in three to five screens. For Usewell it's Today, then a recipe, then "I cooked it".

Give each screen:
- **an id** of small letters, digits and dashes, such as `today`. Not `settings`, `sidebar`, `customize`, `upgrade`, `downloads` or anything starting `comment-`: claude.ai keeps those for itself. Call a settings screen `prefs` or `account`.
- **a name** the user sees, such as "Today", and **a one-line about**, such as "What to use first".
- **a group** for the list of screens, such as "Main flow", "Your kitchen" or "Settings".

## 2. Write the screens file

The screens file is plain HTML, in this order (see `skills/mockup/examples/usewell/screens.html`):

1. **Settings,** as meta lines:
   - `mockup-app`: the app's name.
   - `mockup-title`: the page's title, such as "Usewell mockup".
   - `mockup-kind`: `new`, `before-after` or `styles`.
   - `mockup-flow`: the main flow's screen ids, in order, separated by spaces. The page opens on the first.
2. **The theme,** in one style block: the design guide's colours, corners and type sizes as the variables on `.app` (`--bg`, `--surface`, `--ink`, `--muted`, `--line`, `--accent`, `--accent-ink`, `--accent-soft`, `--warn`, `--radius`, `--title` and the rest at the end of the page's style), then any styles of the app's own. Start every class of the app's own with a short prefix (Usewell uses `uw-`), so it can't clash with the page's.
3. **One template per screen:** `<template data-screen="today" data-name="Today" data-group="Main flow" data-about="What to use first">`, holding the screen's HTML.

Inside a screen:
- **Building blocks** come with the page, themed by the variables: `a-pad` (the screen's padding), `a-title`, `a-sub`, `a-eyebrow`, `a-h2`, `a-row` (a list item, with `a-ic` and `a-tag`), `a-card`, `a-btn` (also `ghost` and `dark`), `a-link`, `a-chips`, `a-steps`, `a-hero`, `a-field` with `a-input`, `a-setrow` with `a-toggle`, `a-notif` (a notification; its empty `ap` square shows a bell), `a-foot`, a bar that keeps a long screen's main button in view, and `a-tabs`, a tab bar that stays at the bottom. Use them, and add the app's own where the design needs it.
- **Icons:** in a tab bar and anywhere an icon stands for an action, use the page's line icons, `<span class="i" data-icon="home"></span>`, which take the theme's colours: `home`, `list`, `plus`, `settings`, `sun`, `calendar`, `search`, `person`, `heart`, `chat`, `bell`, `star`, `cart`, `box`. Emoji keep their own colours whatever the style, so keep them for food, pets and other things in pictures, not for controls.
- **Every button and link gets a note:** `data-note="Opens the recipe."`, one plain sentence on what it does in the real app. The notes list already shows the button's name above its note, so the note doesn't start by repeating it ("Today: what to use first" reads "Today / Today: …"); the check refuses that. A button whose words don't say what it is (an icon, a + sign) also gets an `aria-label`. If the note's label should differ from the button's words, add `data-note-label`.
- **Taps that move:** `data-go="recipe"` opens that screen, and `data-go="back"` goes back. Every tab, back button and main action goes somewhere, so the user can tap through without the list.
- **A row that scrolls sideways on purpose** (a row of days, say) gets `data-scroll-x`, so the check doesn't call it too wide.
- **Pictures:** no images from the web, because the page must open offline and as a Claude artifact page, which blocks them. Use emoji on tinted tiles, CSS shapes and gradients, or a small inline SVG.

**Quality, because this sets the user's trust:**
- **Real content only,** from the description and the market check: real food, real names, real times, real prices marked as samples. Never lorem ipsum or "placeholder"; the build refuses them.
- **The design guide, exactly:** its colours, type, spacing and tone. Its do's and don'ts are rules.
- **A real phone's sizes:** tap targets at least 44 pixels, body text at least 16 pixels, nothing wider than 390 pixels.
- **One clear action per screen,** with the main button where a thumb reaches it.
- **The first flow at final quality,** not a wireframe. Look at every screenshot (section 4) as a demanding designer would before the user sees it.

## 3. Build the page

In a project:

```
node launchwright/skills/mockup/make-page.mjs mockup/screens.html mockup/index.html
```

In the plugin, for the examples: `node skills/mockup/make-page.mjs skills/mockup/examples/usewell/screens.html <page to write>`.

It refuses, and lists each problem with its line, when a screen has no name or a bad id, a button or link has no note, a tap leads to a screen that doesn't exist, the main flow names a missing screen, anything loads from the network, there's placeholder text, or the page would pass 256 KiB.

If the project's guard refuses to run a script from the skills folder, build the page by hand instead: copy `skills/mockup/page.html` and put the screens file's whole text in place of its `<!--MOCKUP:SCREENS-->` line. Then check every rule above yourself, and say in your report that the guard refused, with its words.

## 4. Check it, with screenshots

```
node launchwright/skills/mockup/check-mockup.mjs mockup/index.html --shots <a folder outside the repo>
```

It opens the page on a simulated 390 × 844 phone with the network off, and checks that the page opens with no errors and asks nothing from the network; that every screen is reachable, by tapping through and from the list; that each tap opens the screen it names; that every version shows; that nothing is wider than the phone; that the page's own buttons are at least 44 pixels tall; that the notes match the noted buttons; that the frame never moves; and that a comment is kept. A screen reachable only from the list is a warning: fine for a first-open screen, but usually a missing tap. With `--scale 2` the screenshots are sharp enough to show a person.

It needs a browser. Claude's cloud sessions have one; it installs nothing. Where there's none, it says so: publish anyway, and say the check didn't run.

Then **look at every screenshot yourself** before the user sees the page: spacing, alignment, text that wraps badly, colours against the design guide, anything that looks like a wireframe. Fix it and check again. Screenshots aren't committed: they're images, and the user sees the page itself.

## 5. Show it to the user

Publish the built page as a Claude artifact page, the first time with the title and a short icon word such as "phone". Then give the page the comments capability, so comments typed in the page's own box are kept by the page and sent to Claude: `declare_capabilities` with `{ "comments": {} }` (the first publish warns that the page uses comments without declaring them; declaring is what clears that). On each later change, republish the same page from the file, so its link and its comments stay.

A plain cloud session may not have the tool that publishes artifact pages. If it doesn't, build and check the page, record the status as usual, and the next Project thread publishes it (spec section 2.6).

**Screen 9 · The first look.** Build only the main flow first, at final quality, and publish it:

> Here's the main flow, as it'll really look. Open it, tap through, and comment anywhere.
> [link to the mockup page]
> • Love it, show me the rest *(recommended)*
> • I've left comments

The page has a Comment button on every screen. Under it, the user types or talks with the keyboard's microphone, and taps Send to Claude. Where the page can't send (opened outside the Claude app, or the user said no to the page commenting), it keeps the comment on their phone, and its "Copy all my comments" button lets them paste every comment into the chat.

**Screen 10 · The full mockup.** Add every other screen to the same screens file, build, check, and republish the same page:

> All 9 screens are in the mockup, each with notes and a comment box. Tap Screens at the bottom to jump between them.
> [link to the mockup page]
> • Approved *(only when no comments are open)*
> • I've left comments

## 6. Comments, until it's approved

When the user says they've left comments, read them with `read_comments` on the page, each thread in full. Each comment starts with the screen it's on, and sits on that screen.

For each comment:
- **A change Claude can make** within the design guide and the description: make it in the screens file.
- **A change to the description or the plan** (a new feature, a different price, dropping a screen the plan needs): don't make it silently. Ask, one question at a time, after the others are done:
  > Adding meal plans to version 1 makes the build about a night longer.
  > • Keep it for later *(recommended: version 1 ships sooner)*
  > • Add it now
- **A question:** answer it in the comment's thread.

Then build, check, republish, and reply in each comment's thread with one line on what changed. Tell the user in the chat:

> I've made 4 of your 5 changes; the page shows them now. One needs your call: meal plans in version 1?

If the user pastes their comments into the chat instead, treat them the same way.

**Approved** only when every comment is applied or answered. Record it in the project's decisions (project/decisions.md): the date, the page's link and version, and what changed. Then the question sweep starts (`skills/question-sweep/SKILL.md`).

## 7. Versions of a screen: before-and-after, and style choices

A screen can have more than one version. Give each version its own template with the same `data-screen` id and a `data-variant` label; only the first needs the name, group and about. A version can use its own theme: `data-theme="now"` puts the class `theme-now` on the app for that version, so the screens file's `.app.theme-now` variables apply. The page shows the versions as buttons under its header.

**An app the user already has (spec screen E6).** Set `mockup-kind` to `before-after`. For each screen the change touches, one version "Now", drawn from the app as it is today (from the safety net's screenshots, so it's faithful, including what's wrong with it) with its own theme, and one "After", in the design guide. The page opens on "After". Screens the change doesn't touch can be added with one version, in a group called "Not changing", so the path makes sense. See `skills/mockup/examples/before-after/screens.html`.

> Here's the booking screen as it is and as it will be. Switch between Now and After at the top, and comment on either.
> [link to the mockup page]
> • Love the after *(recommended)*
> • I've left comments

**Style choices (design direction).** Set `mockup-kind` to `styles`, and give the one screen three versions, each named after its style ("Calm and airy", "Bold and playful", "Clean and serious") with its own theme. The design-direction skill writes the screen and asks the question; this page only shows it.

## What's Claude-only here

Everything in this folder is portable except publishing: the page is plain, self-contained HTML that opens in any browser, and its comment box keeps comments on the phone wherever the page can't send them. Publishing as a Claude artifact page, the comments capability, and reading the comments with `read_comments` are Claude's. A port publishes the page its own way and reads pasted comments.
