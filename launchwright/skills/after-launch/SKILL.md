---
name: after-launch
description: Looks after an app once it's in the stores or live on the web. Use when the first release is approved and live, when the user reports a problem or a bad review, when they want a change or a new feature, and when they ask to undo a release. Gives an after-launch plan of what to watch and when, rolls back with the user's tap where the platform allows it (and says plainly where it doesn't), and takes every update through the same path as the first version.
---

# After launch

The app is out. Now the job is to notice problems early, fix them fast, and keep every change as safe as the first version was (brief F13; spec screen 18).

Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message, and its section 5 on what's always the user's. Every line the user sees is written below as a quoted line; adapt the words, keep the shape.

In a project, this skill lives in the kit: read this file at launchwright/skills/after-launch/SKILL.md. What Apple, Google and Expo say about rolling back and updating, with sources and dates, is in the launch-prep skill's sources (`skills/launch-prep/sources.md`, "Rolling back and updating").

## The rules

1. **A rollback is a production step,** so it's always the user's tap, even in a hurry. Claude prepares it so the tap is the only thing left.
2. **Say plainly what can't be undone.** A version people installed from a store can't be pulled back; the fix is a new version (section 3).
3. **Every change goes the same way as version 1:** description, mockup, sweep, plan, build, checkpoint, send (section 4). Small fixes take the short form of each step, never none of them.
4. **Claude can't see the stores' consoles or Expo's pages.** Reviews, crash reports and store statuses come from the user's screenshots or the stores' emails. Ask for exactly the screen needed.

## 1. When it opens

| When | What |
| --- | --- |
| **The first release is live** (launch-prep, section 6, ends) | Section 2: the after-launch plan, screen 18 |
| **A check-in's day** from that plan | Section 2: the check-in |
| **The user reports a problem** ("it crashes when…", a bad review, a screenshot) | Section 3 first if the last release broke something; otherwise section 4 |
| **The user wants a change or a new feature** | Section 4 |
| **"Undo it", "go back"** | Section 3 |

## 2. The after-launch plan (screen 18)

Write it to the project folder's plan notes, under "After launch", and show it in one message:
> Usewell is live. Here's how I'll look after it:
> • Tomorrow, then day 3, then weekly for a month: a 5-minute look at reviews and crashes with you
> • Anything broken gets a fix the same day, ready for your tap
> • If a release ever goes wrong, I'll undo it for your tap where the platform allows it
> • New ideas: tell me any time; they go through the same steps as version 1
>
> • Sounds good *(recommended)*
> • Change the check-ins

**The check-ins** are tasks of the user's (the status script's ask command, at the do-by level, each with its date in the user's review window). Each one, one screen at a time:
> Five-minute check on Usewell. Send me a screenshot of each:
> **Where:** App Store Connect on the web, your app, then Ratings and Reviews. Then Play Console, your app, Monitor and improve, Ratings and reviews.
> **You'll see:** the newest reviews at the top.

and, for crashes:
> **Where:** Play Console, your app, Monitor and improve, Android vitals. Then TestFlight in App Store Connect, Crashes, if there are any.
> **You'll see:** a crash rate, or "no data yet".

Claude reads the screenshots, says in three lines what people like and what's wrong, and offers a fix for anything broken (section 4), recommended first. A web app has no store reviews: ask instead what the user has heard, and look at the site at the production address.

Read the store pages named here on the day before giving these steps, and correct the taps if a page changed; say so in the project's lessons file.

**The tip, only now:** planning with a stronger model and building with a lighter one can stretch the user's Claude plan for updates (spec, F18). Offer it once, at the end of the first check-in:
> A tip for updates: I can plan each change on my strongest model and build it on a lighter one. It uses less of your Claude plan, and the checks stay the same.
> • Yes, do that *(recommended)*
> • Keep it as it is

On "Yes", record it in the project's decisions; the build relay's model presets read it.

## 3. Rolling back

Find out what went wrong first, from the user's words and screenshots, then say which of these it is. Never more than the platform can do.

**A web app (Expo Hosting).** Every version that went live is kept. Claude makes the last good version the newest commit on the working branch (undoing the bad change in a new commit, never rewriting history), with "[release-web]" in the message, and pushes. The release workflow puts it at the release link and waits for the user's tap, as at launch:
> The last change broke sign-in. I've got the version from Tuesday ready to put back.
> **Where:** expo.dev, your app's project, Workflows, the newest "release-web" run.
> **Do:** open the release link first and check sign-in works. Then tap the job "Put this version live?" and tap Approve.
> **You'll see:** your site is back to Tuesday's version within a minute or two.

(Expo can also move the production address straight back to an older version, but only with its command-line tool, which the guard keeps from Claude. The run above does the same with one tap.)

**A phone app, with Expo's over-the-air updates.** Only if the app was built with Expo's update service (the starter doesn't include it; adding it is a plan piece, and the README lists it). Then the fix is the same: Claude puts the last good version back as a new commit, and the update reaches phones only through a workflow that waits for the user's Approve tap, the way the store and web workflows do. A workflow that publishes updates must come with the kit, behind an approval; until the kit has one, say so in the report and use the store route below.

**A phone app from the stores.** A version people already installed can't be taken back. Say so:
> I can't take back a version people already have: Apple and Google don't allow it. What I can do is send a fixed version. I've got one ready, built on the last good one.
> • Send the fix *(recommended)*
> • Let me look first

Then it's launch-prep's section 6 for the new version, with "What's New" in the store answers (Apple requires it after the first version), and Apple's review. While Apple reviews, if the user released with "I'll release it myself" and the bad version isn't out yet, they can hold it: give Where / Do / You'll see for App Store Connect from its help pages, read that day.

## 4. Updates

Every change takes the same path as version 1, at its own size (spec screen 18):
1. **What changes,** in the user's words, confirmed with "Here's what I heard" (idea intake's confirm step, `skills/idea-intake/SKILL.md`), and added to the description under a new version.
2. **A before-and-after mockup** of each screen that changes (`skills/mockup/SKILL.md`), with comment boxes. A fix that changes no screen skips it, and says so.
3. **The sweep's questions,** only the new ones (`skills/question-sweep/SKILL.md`). A change that adds a service brings the rules check for it.
4. **A plan** for the update, with its own baseline and checkpoint (`skills/build-plan/SKILL.md`).
5. **The build and its checkpoint,** as before (`skills/build-relay/SKILL.md`, `skills/checkpoint/SKILL.md`).
6. **Sending:** launch-prep's section 6, with the new version number.

**Version numbers,** the one the stores show: a fix adds to the last part (1.0.0, then 1.0.1); new features add to the middle (1.1.0); a big change is the user's call (2.0.0). Expo counts the build numbers by itself.

**Rules:** before each store version, the rules check runs its before-launch round again (`skills/rules-check/SKILL.md`, section 7), so a rule that changed since launch is caught.

## 5. Saving

- **The plan notes** keep "After launch": the check-in dates, and each release with its date and what changed.
- **Lessons:** each problem found after launch, and what would have caught it sooner, in the project's lessons file; lessons for every app go under "For Launchwright".
- **Commit and push** to the working branch after each step. Only the commit that's meant to start a release carries a release word ("[store-ios]", "[store-android]", "[release-web]").
- **The status:** check-ins are do-by asks; a rollback or a release is a blocking ask until the user taps.
