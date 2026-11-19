---
name: checkpoint
description: Runs one checkpoint of a Launchwright build, the stop where the user tries what's been built so far. Use when the coordinator starts a checkpoint from the plan (C1, C2, …), when the user answers one, or when they ask to try the app now. Covers the checks before anything reaches the user, screenshots of every screen and a demanding design review, the phone-flow tests (on the web build for free, on Expo's simulated phones only with the user's yes because they cost money), the test version on the phone or at a web link, the message the user gets, their answer, and a short retrospective.
---

# Checkpoints

A checkpoint is where the user tries the app: a test version on their phone, or a web app at a link. Before it reaches them, the build checks it, takes a picture of every screen and reviews them the way a demanding designer would, and runs the phone-flow tests. After they've tried it, a short retrospective records what to keep and what to change.

It covers brief item F11 and spec screen 15. Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4): one question at a time, tap-to-answer options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat.

In a project, this skill lives in the kit: read this file at launchwright/skills/checkpoint/SKILL.md, and run the status script from the repo's top folder, as the kit's AGENTS.md shows. Its two helpers, list-screens.mjs and screens.spec.mjs, sit next to it. What Expo's runs cost (open point O9), and the other facts from Expo's docs this skill relies on, are in `skills/checkpoint/sources.md`, with sources and dates.

## 1. When it runs

- **The plan books it.** Each checkpoint in project/plan.json has an id (C1, C2, …), the pieces whose work it shows (after), what it needs from the user first (needsUser: for C1, U-first-build), the review-window slot (date, from, to) and the three or four things to try (try). The build-plan skill booked the slot at least two hours after the last piece ends, because Expo's free builds wait in a low-priority queue (`skills/build-plan/SKILL.md`, section 4).
- **The coordinator starts it** as soon as every piece in after is done and checked, and everything in needsUser is done. It runs in a thread of its own, as the piece `<id>.run` (C1.run), on the design reviewer's model and effort (top, high, in both presets: `skills/build-relay/SKILL.md`, section 7), because the design review is its main judgment. It follows the design reviewer agent's rules for that review.
- **Only the pieces that build on it wait.** A piece waits for a checkpoint only if its needsUser lists it. Everything else keeps going, before and after the user answers.
- **The user asks to try the app now.** Run sections 3 to 7 with what's done so far, under the next checkpoint's id. Don't move the plan's later checkpoints.

## 2. Start

1. **Guard check, sync and the handoff check,** as every piece does (the kit's AGENTS.md). The handoff check here: every piece in after shows as done, everything in needsUser is done, and the app's folder has its tests, its flows and its workflows.
2. **The workflows are in place.** Expo starts a workflow only from the .eas/workflows folder, which the kit fills from the app's workflows folder at setup or a kit update; agents can't write there (`skills/checkpoint/sources.md`, "Workflows"). If test-version.yml (a phone app) or web-preview.yml (a web app) isn't there, stop: block the run with the status script and report it. Nothing is pushed for a test version that can't be built.
3. **Record the start:**
   ```
   node launchwright/scripts/status.mjs start C1.run --title "Checkpoint 1: getting the test version ready" --phase <the checkpoint's phase> --model "<model, effort>"
   ```

## 3. The checks

Nothing reaches the user that hasn't passed these, run in the app's folder:

| Check | Command | For |
| --- | --- | --- |
| Tests | `npm test` | Both kinds of app |
| Type check | `npm run typecheck` | Both |
| Nothing left as a placeholder | `npm run check:ready` | Both |
| The web build | `npm run export:web` | Both: the screenshots and the web flows use it |
| Phone flows at a phone's size | `npm run flows` | Both (section 5) |

A check that fails is fixed here, as part of the run, when the fix is small and clear. If it isn't, the run fails with the status script's fail command and the coordinator starts a fix piece (`skills/build-relay/SKILL.md`, section 5). The user never gets a version that fails its own checks; the plan's slot moves to the next window, and the status page says so.

## 4. Screenshots and the design review

1. **Take a picture of every screen** at a phone's size (390 by 844), from the web build:
   - Copy list-screens.mjs and screens.spec.mjs into the app's flows folder (once; they stay there and do nothing in ordinary flow runs).
   - Run `SCREENS_DIR=../project/checkpoints/C1/screens npx playwright test flows/screens.spec.mjs --project phone` in the app's folder (adjust the path to where the app sits). It finds every screen in the web build by itself.
   - A screen whose address needs a value (a recipe, a list item) fails the run until it has a sample: add one with `SAMPLE_ROUTES="/recipe/1"`, using the app's sample data.
   - The web build must be one page per screen (`web.output` set to `static` in app.json, as in both starters). If it's one page for everything, the run says so and stops: set it to `static`, export again, then take the pictures.
   - An app without web flows gets them first (section 5).
2. **Review every picture** against the design guide (project/design.md), the approved mockup (mockup/) and the description (project/description.md), the way a demanding designer would. Read each picture; don't skim. Look for:
   - text that's cut off, overlaps, or is too faint to read (the design guide's contrast rule);
   - tap targets smaller than 44 by 44, or too close together;
   - spacing, corners, sizes and colours that don't follow the theme, or that differ between screens;
   - leftover placeholder words, sample text that reads like a developer wrote it, broken or missing pictures;
   - empty states, long names and long lists: a screen that only looks right with the perfect amount of data;
   - anything that doesn't match the approved mockup.
3. **Fix what's clearly a defect,** then take the pictures again and check the fix. A change to what the user approved (a layout, the words, a feature) is never fixed quietly: it goes into the checkpoint message as a question, or to the coordinator if it changes the plan.
4. **Write it down** in project/checkpoints/C1/review.md (made by the checkpoint): each finding, the screen, what was fixed, and what's left with why. Keep the pictures in the same folder; the next checkpoint compares against them.

## 5. The phone-flow tests (open point O9)

**What Expo's runs cost** (`skills/checkpoint/sources.md`, "What Expo's checkpoint runs cost", read Nov 18, 2026, from Expo's pricing page and billing docs):
- Expo's **Free plan doesn't include Maestro test jobs** at all, the jobs that run the flows on simulated phones.
- On a **paid plan** (Starter is $19 a month), each Maestro job costs $0.05 plus its workflow minutes, and the build it runs on comes out of the plan's build credit. Paid plans are billed for usage past their limits.
- The Free plan includes 15 Android and 15 iOS builds a month in a low-priority queue, and 60 minutes of workflows. It **can't run up a bill**: when the builds are used up, new ones wait until the first of the next month.

So the phone-flow tests run in two ways:

- **Always, for free: the flows on the web build at a phone's size,** in the cloud session itself (`npm run flows`). Both starters have them (the flows folder and playwright.config.ts), and a phone app's web flows mirror its Maestro flows (.maestro): when one changes, so does the other. An app whose folder has none (one set up before the starters had them) gets them the first time: a playwright.config.ts that serves the web build and opens it at 390 by 844, the Playwright test package in its dev packages, a `flows` script that runs it, and a web flow for each Maestro flow. Say in the message that these run on the web version: they catch most broken screens and taps, but not what's special to an iPhone or an Android phone.
- **Only with the user's yes, each time: the Maestro flows on Expo's simulated iPhone and Android phone** (the phone-flows workflows). Ask only if project/decisions.md shows the user is on a paid Expo plan; on the Free plan they can't run, so don't offer them. Ask before the test version goes out, one question, the free choice first:
  > I can also test the app on Expo's simulated iPhone and Android phone. It costs about $0.10 for this round, from your Expo plan.
  > • Skip it, the web tests are enough for now *(recommended)*
  > • Yes, run them this time

  The figure is two Maestro jobs at $0.05 plus their minutes; say "about" and name the plan it comes from. With a yes, the checkpoint's commit message carries `[phone-flows]` as well as `[checkpoint]`; without one, it never does. A yes covers this checkpoint only (spec K3: ask first, each time).

**Results.** The web flows' results are in front of you: count them for the message ("all 14 passed"). Expo's runs report on Expo's website, which a cloud thread can't read (it has no Expo sign-in); the message tells the user where to look, and a failed run there is fixed like any failed check.

## 6. The test version

1. **Count the builds first.** A phone app's checkpoint uses one Free-plan build per platform (two with the phone flows, which build their own). Count this month's from the status files and the plan: if this one would go past 15 on either platform, it's a money question for the user, never a quiet one. Ask, with waiting as the free choice:
  > Expo's free builds for this month are used up. The test version can wait until the 1st, or Expo's Starter plan ($19 a month) builds it now.
  > • Wait until the 1st *(recommended)*
  > • I'll upgrade Expo first
2. **Only test data goes out.** A web checkpoint link opens for anyone who has it, and a phone test version can be shared by its link, so the version carries the sample data and test keys only, never real users' data or a production key (spec section 10).
3. **Start it:** one commit whose message ends with `[checkpoint]` (and `[phone-flows]` only after a yes), pushed to the working branch as usual. Through Expo's GitHub app this starts, on Expo's servers:
   - **a phone app:** test-version.yml builds the preview profile for iPhone and Android, installed from a link (internal distribution);
   - **a web app:** web-preview.yml puts the site on the fixed checkpoint link, `https://<preview name>--checkpoint.expo.app`, never the production address.
   No other push says `[checkpoint]`, so ordinary work never uses up the free builds.
4. **Nothing here deploys to production or submits to a store.** The workflows can't, and the guard refuses both.

## 7. The message (spec screen 15)

Record the checkpoint as soon as the test version is on its way, so the relay and the status page know the build is waiting on the user for it:

```
node launchwright/scripts/status.mjs ask C1 --level blocking --text "Checkpoint 1: try the app" --holding "<the pieces whose needsUser lists C1>"
```

That alerts the user's phone. Then send the message, in the Project chat, in this shape. The try lines are the plan's try list, in the user's words, and the times are in their time zone.

For a phone app:
> The first part of Usewell is ready to try, from 9:00 PM.
> **Where:** on your iPhone, at expo.dev, in Usewell's builds.
> **Do:** open the newest iPhone build, tap Install, then open the app. Try these three things: open Today, cook the first recipe, add milk to the list.
> **You'll see:** the Today screen with your sample recipes.
> I also ran the phone-flow tests at a phone's size (all 14 passed) and reviewed every screen from screenshots (2 fixes made).
> • Looks good *(recommended)*
> • Something's wrong (tell me by voice)

For a web app, Where and Do are the link: "Where: on your phone, at this link. Do: open it and try these three things."

- **The time** is the slot's start (from), when the build has had its two hours. If the user taps before Expo has finished, the build page shows it still in the queue: add "If it says it's still building, try again in a little while."
- **The first iPhone install** may ask for Developer Mode: add the setup assistant's line for it (`skills/setup-assistant/SKILL.md`, step 9). Android may ask to allow installing from the browser.
- **Say what the tests were.** Web flows are "at a phone's size"; Expo's runs are "on simulated phones". Never say a test ran that didn't.
- **Open questions from the design review** (section 4) come after the two options, one at a time.
- **The optional Usage screenshot** (`skills/build-relay/SKILL.md`, section 8) can follow, once, and never holds anything.

## 8. The answer

- **Looks good:** record it, and the pieces that waited for it start:
  ```
  node launchwright/scripts/status.mjs answered C1 --note "<their words>"
  ```
- **Something's wrong:** let them say it by voice, in their own words, then read it back in a line or two and ask if that's right. Write each point in project/checkpoints/C1/feedback.md (made by the checkpoint): what they saw, on which screen, and what they expected. Then record answered C1 with their words. Each point becomes a fix piece; a point that changes the plan's scope, dates or checkpoints is the user's call, at this stop (`skills/build-plan/SKILL.md`, section 9). The fixes show at the next checkpoint, or in a quick extra test version if the user asks for one.
- **No answer:** the alert has done its job; don't chase. Only the pieces that wait for this checkpoint wait. The status page keeps it under "Waiting on you".

## 9. The retrospective

Short, once the user has answered. Add it to project/lessons.md under a heading with the checkpoint and the date:
- **What went well:** two or three lines.
- **What to change:** two or three lines, each with what the build does differently from now on.
- **Lessons:** each one is what happened, the whole kind of problem it belongs to, and the rule that stops it happening again (the project's lessons file says how). Mark a lesson **for every project** when it isn't about this app: it's a lesson for Launchwright itself.
- **Usage by model:** the figures from the Usage screenshot, if the user sent one, with its date.

Lessons for every project stay in the project's own file; nothing is sent anywhere. At the end of the build, the last message tells the user they're there, in one line, so they can pass them on to Launchwright if they like.

Then finish, and report to the coordinator as every piece does:
```
node launchwright/scripts/status.mjs finish C1.run --summary "<what the user tried and said, plain words>"
```

## What a checkpoint never does

- Pays for anything without the user's yes, each time: Expo's phone-flow runs, builds past the free ones, or a plan upgrade (spec K3).
- Deploys to production or submits to a store. The test version is a preview build or the checkpoint link, nothing else.
- Puts real users' data or a production key in a test version.
- Says a test ran, or passed, when it didn't; or that the app is in a store.
- Changes what the user approved without asking.
