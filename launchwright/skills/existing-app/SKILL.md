---
name: existing-app
description: Improves an app the user already has. Use when the user says "improve an app I have", pastes a GitHub link to their own app, or comes back to an existing app's upgrade. Gives a plain-words health check (what it's built with, how it runs and ships, what's fragile, keys sitting in the code, out-of-date packages, what's safe to change) and an honest verdict; for Expo apps, records a safety net of tests and screenshot walkthroughs before any change, fits the kit around the code, shows each change as a before-and-after mockup, and makes an upgrade plan of small steps, each checked and easy to undo.
---

# Improving an app the user already has

The user brings an app they already have, often half-built with another tool, and wants it finished, fixed or improved. This skill checks it, says honestly what Launchwright can do with it, records how it works today before anything changes, and then takes it through the usual path in small steps the user can undo.

It covers brief item F15 and spec screens E1 to E7. Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4): one question at a time, tap-to-answer options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat.

## What's in this folder

| File | What it is |
| --- | --- |
| `skills/existing-app/SKILL.md` | This skill |
| `skills/existing-app/health-check.mjs` | Gathers the health check's facts from the app's files, without running, installing or changing anything; prints a JSON report |
| `skills/existing-app/health-check-test.mjs` | Its test, on small made-up apps |
| `skills/existing-app/sources.md` | The platform facts this skill relies on, with sources and dates |
| `skills/existing-app/examples/dry-run-launchwright.md` | The health check run on Launchwright's own repo, and the plain words it gives |

In a project, the kit keeps this folder as launchwright/skills/existing-app/. The kit's setup script (kit.mjs, in the plugin's scripts folder) is the plugin's own, not the kit's: section 5 says how to reach it.

## The rules for an app the user already has

1. **Nothing in the app changes before the safety net is recorded** (section 6) and the user has seen it.
2. **The app is live, maybe with real users.** Its main branch may put it live when anything is pushed there. Claude never pushes to a branch that deploys; reaching the live app is always the user's tap (section 5).
3. **Keys are named by kind and file, never printed,** and files named like .env are never opened, even to check them. The helper follows both rules; never repeat its search by hand.
4. **Real users' data is never read, copied or reached.** The app runs in the cloud with no keys, so it never reaches its live database; screens that need it are listed as not recorded.
5. **The verdict is honest.** Launchwright works on what its kit knows: Expo apps, for phones, the web or both. Everything else gets the health check and a verdict, and nothing more (section 4).
6. **Hard stops stay the user's** (`skills/launchwright/SKILL.md`, section 5). A live key found in the code is one: changing it affects the live app.

## 1. When it runs

| When | Start at |
| --- | --- |
| "Improve an app I have" from the front door, or a pasted GitHub link to an app | Section 2 |
| The app's own project, and the user says "set up" and the app's name | Section 5 |
| Coming back: the app's project has the kit, and its kit settings say type existing | Pick up where the project's files stop (section 10) |

It starts in the home project (or any Launchwright project): sections 2 to 4 only read the app. The work itself happens in the app's own project (sections 5 to 9).

## 2. Screen E1 · Which app?

> Which app would you like to improve? Paste its GitHub link, or tell me where it is.
> • It's on GitHub *(recommended: paste the link)*
> • It's only on my computer

**On GitHub.** Add the app's place on GitHub to this thread only, the way a cloud thread adds a repository its task needs (`skills/name-and-home/SKILL.md`, section 7, step 1). If Claude can't reach it, it's Claude's GitHub access (lesson 17: only the Configure page can add it):

> I can't see that app yet. Claude can only reach the places on GitHub you've added.
> **Where:** github.com, signed in, then your picture, Settings, Applications, Installed GitHub Apps, then Configure next to Claude.
> **Do:** under "Repository access", add the app's place to the list, and tap Save.
> **You'll see:** the app's name in the list.
>
> • Done, check again *(recommended)*
> • I'm stuck

If the link is someone else's app, say that Launchwright works only on the user's own apps, and stop.

**Only on the computer.** It goes to GitHub once, from the computer, and everything after that works from the phone. The setup assistant does it with the user, in Claude on the computer, in the app's folder (`skills/setup-assistant/SKILL.md`):

> Your app needs to be on GitHub once, so I can work on it from anywhere. We'll do it together on your computer.
> **Where:** github.com on your computer, signed in, then the plus button, then "New repository".
> **Do:** name it after your app, choose "Private", leave everything else empty, and tap "Create repository".
> **You'll see:** an empty page for it, with "Quick setup" at the top.
>
> • Done *(recommended)*
> • I'll do it later

Then, on the computer, before anything leaves it:
1. **The key check first.** Run the health check's key search on the folder (section 3, with the folder's path). A file named like .env, or a key in the code, is left out: make sure .gitignore lists .env files and node_modules, and move any key in the code into a .env file with the keys skill's help (`skills/keys/SKILL.md`). Nothing with a key goes to GitHub.
2. **Then it goes up once,** with Git in a terminal, opened in the app's folder: the setup assistant types the commands and the user watches (GitHub's steps, `skills/existing-app/sources.md`). If Git isn't installed, installing it is the user's (a hard stop): say so, with the official download page. A small app (under 100 files, none over 25 MB) can go up through the browser's "uploading an existing file" link instead.
3. **Then back to the phone:** carry on at "On GitHub" with the new link.

## 3. Screen E2 · The health check

Run the helper on the app's folder, with its history:

```
node <this skill's folder>/health-check.mjs <app's folder> --history
```

It reads the files and prints a JSON report; it never installs, runs or changes anything. Then add what only reading can't tell:

- **Read the app's own words:** its README, its package file's scripts, its app settings (the app's name, its store identity), and two or three of its main screens. They say what the app is for, which screens matter most, and how it's meant to run.
- **Keys:** for each key the report lists, look at the line (never print it) to tell a made-up sample in a test from a real key. A real key is a finding for the keys skill (`skills/keys/SKILL.md`, "Found in a file, the code or its history"). Every key in the history counts, even one removed since: once pushed, it stays in the history, and the fix is a new key at the service.
- **Packages:** the report compares the Expo family with the kit's starter. The rest can only be compared once the packages are installed, in section 6.
- **Several apps in one place:** if appFolders lists more than one, ask which app this is, one question, before anything else.

**Saving it.** Write the full report in plain words to the home project's ideas folder, as ideas/<app>/health-check.md: the five headings below, each finding with its file (for Claude, not the user), and the date. Commit and push it to the home project's working branch, as its AGENTS.md says. Section 5 moves it into the app's own project.

**The message** is short, one line per heading, the most important finding in each, in plain words; never a file path, a package name the user wouldn't know, or a key:

> Here's how Pets is doing:
> • **Built with:** Expo, for iPhone and Android, with Supabase for its data.
> • **How it runs and ships:** it builds on Expo; nothing puts it live by itself.
> • **Fragile:** no tests yet, so every change needs checking by hand.
> • **Keys in the code:** one payment key sits in a screen's code. That's the first thing to fix.
> • **Out of date:** Expo is six versions behind. It can catch up one version at a time.
> • **Safe to change:** the screens and their words. Sign-in and payments need extra care.

Then the verdict, in the same message or the next.

## 4. Screen E3 · The verdict

The report's builtWith.kind decides it.

**expo: the kit knows it.**

> I can work on this app. First I'll record how it works today, so nothing breaks without us noticing. Then you tell me what to change.
> • Let's start *(recommended)*
> • Not now

A live key in the code comes first, whatever the user picks: it's the keys skill's (`skills/keys/SKILL.md`), and it's the user's to change at the service. An Expo version far behind is fine: catching up is the upgrade plan's first steps (section 9).

**web-js, other: the kit doesn't know it.** An honest verdict, and nothing more. Say what Claude could and couldn't safely do, without running it down. Many of these apps were half-built with Lovable, Bolt or Replit, and the user may be proud of it or stuck with it; write with care:

> Your app is built with Vite and React, made in Lovable, with Supabase for its data. Launchwright's kit works on Expo apps only, so I can't safely change this one: I couldn't test it the way the kit does, or ship it to the stores.
> What I can do is build a new version on the kit, using this app as the idea: its screens, its features and its look. Your current app keeps running as it is.
> • Build a new version from it *(recommended)*
> • Keep the report, that's all for now

- **A new version from it** goes to the idea intake as a document (`skills/idea-intake/SKILL.md`): the health check and the app's own words are the source. Its screens become the mockup's starting point. The user's live app, its accounts and its users stay theirs; moving users or data across is a hard stop for later, never part of the new version's plan.
- **Name what Claude saw** in a line, whatever the kind: a Flutter app, a native iPhone app, a React Native app without Expo (Expo's docs can add it to one, but that's a big change, not a first step).

**none: the place is empty.** Say so, and offer the front door's "New app idea" instead.

Record the verdict in the health check's file, with the user's answer.

## 5. Its own project, and fitting the kit (screen E5, part one)

An app the kit knows gets its own Claude project, like a new app (`skills/name-and-home/SKILL.md`, section 6, step 3), with the app's place on GitHub as its context; the home project's place isn't added. Its name is the app's own: don't ask for a new one. Then the hand-over:

> Next, Pets gets its own project, so everything for it stays in one place.
> **Where:** claude.ai/code in your browser, then "Projects", then "New project".
> **Do:** name it "Pets". Under Context, tap the plus button and pick your app's place on GitHub. Tap Create. Then open the project's settings, "Environment", and choose "Launchwright".
> **You'll see:** "Pets" open, with Launchwright as its environment.
>
> • Done *(recommended)*
> • I'm stuck

If setup found a Plugins section in a project's settings (the home project's decisions, under Setup: the plugin's path), add one line to the Do, as for a new app: "Then, in the project's settings, Plugins, add Launchwright." Otherwise say nothing about plugins.

> Now open Pets's project and say "set up Pets".

**In the app's project, "set up <Name>":**

1. **Does a push to its main branch put it live?** The health check's guardHints.workingBranch guesses; the user confirms, because the kit fixes this at setup and Claude can't change it afterwards (Launchwright's own decision: the working branch is set once, at setup):
   > When the code on GitHub changes, does your app update for your users by itself? Lovable, Vercel and Netlify usually do that.
   > • Yes, or I'm not sure *(recommended: I'll work on a separate copy and you choose when it goes live)*
   > • No, it only changes when I publish it

   Yes or not sure: the working branch is launchwright-work. No: main.

   Never name the working branch launchwright or status, the names of two of the kit's protected folders: the guard reads such a name as the folder and refuses every push, pull and fetch of it (checked by P3.R6 on Nov 18, 2026).
2. **Set up the kit.** With launchwright-work, make that branch from main first (`git switch -c launchwright-work`), and set up there. With main, set up on main itself. The guard turns on as soon as the kit is in, and from then on it lets Claude push only to the working branch, so the kit must already be on it. Then run the plugin's kit script:
   ```
   node <plugin folder>/scripts/kit.mjs setup . --type existing --name "<Name>" --time-zone <the home project's> --app-path <the app's folder, . when it's at the top> --working-branch <launchwright-work or main>
   ```
   The plugin folder is two folders up from this skill's own folder, which Claude Code shows when it loads the skill (not yet tried: `skills/existing-app/sources.md`). The kit goes beside the app, never into it: its own launchwright, project, mockup and ideas folders, and its block at the end of AGENTS.md and CLAUDE.md, where the app's own lines are kept.
   - **If setup refuses,** it names the file that would clash, and changes nothing. Most often it's the app's own Claude settings file. Tell the user in one line what clashes and that it's the kit's limit, not their app's fault; don't move or merge their file. Record it in the health check's file and stop here: the health check and the verdict stand.
3. **Commit, and push to the working branch** (`git push origin launchwright-work`, or `git push origin main`). Then move the health check across: add the home project's place to this thread and copy ideas/<app>/health-check.md into the project folder, as for a new app (`skills/name-and-home/SKILL.md`, section 7, steps 1 and 3), and push again.
   With main, say what happened in one line, and skip step 4: "I've added Launchwright's own folders to Pets. Nothing in your app changed, and nothing went live."
4. **With launchwright-work, the user accepts the kit, with one tap on GitHub** (`skills/existing-app/sources.md`). It adds Launchwright's folders and changes nothing in the app:
   > One tap on GitHub to let Launchwright into Pets. It only adds Launchwright's own folders; your app doesn't change.
   > **Where:** github.com, on your app's page. Your phone's browser should work.
   > **Do:** tap "Compare & pull request" in the yellow banner, then "Create pull request", then "Merge pull request" and "Confirm merge". If it offers "Delete branch" afterwards, leave it: I keep working there.
   > **You'll see:** "Merged" in purple.
   >
   > • Done *(recommended)*
   > • I don't see the banner

   If the app goes live when its main branch changes, add one line: "Your app updates once, with nothing new in it." If there's no banner, the page's branch menu, then launchwright-work, shows "Contribute" with the same choice. From now on every thread syncs from the working branch (the kit's AGENTS.md, step 1).

## 6. Fitting the kit, part two: the guard's questions (screen E5)

The guard learns where the app's production settings and real users' data live, one sweep question at a time (`skills/question-sweep/SKILL.md`, its rules for every question). These come before the safety net runs the app, so nothing the app runs can reach real data. Ask only about what the health check found, using its guardHints:

| The guard's setting | Asked when the report found |
| --- | --- |
| productionBranches | a workflow that deploys from a branch other than main |
| productionScripts | a package script that deploys, pushes a database or submits, under a name the guard doesn't already know |
| userDataHosts | a database host in the code (Supabase, Firebase, MongoDB and the like) |
| userDataPaths | exports, backups or data files in the code |
| keyFolders | folders holding .env files |
| keyNames | the names of keys the code reads (never their values) |

One question each, with what it holds up:

> Your app talks to a database at Supabase. Does it hold your real users' data?
> • Yes, keep Claude away from it *(recommended)*
> • No, it's only test data
>
> (Holds up: recording how the app works today.)

A yes is added to launchwright/guard/guard.json with a file edit; agents may add to that file, never take away. "Not sure" counts as yes. Record each answer in project/decisions.md under "Decided by the user". Then commit and push to the working branch.

## 7. Screen E4 · The safety net

Before any change, record how the app works today, in the cloud, with no keys. It runs in a thread of its own, as the piece S.net, on the design reviewer's model and effort (it's mostly looking).

1. **Install and run what's there:** the app's own install, its tests, its type check if it has one. A failing test isn't fixed now: it's recorded as "already broken". Then the package manager's outdated command, for the out-of-date list the health check couldn't make.
2. **Web flows at a phone's size.** An Expo app gets the web starter's flows set-up, as a checkpoint gives a phone app (`skills/checkpoint/SKILL.md`, section 5), in the app's folder. Write one flow for each of the app's main flows (from section 3: the README and the main screens), recording what happens today, even where it looks wrong.
3. **Screenshots of every screen,** with the checkpoint's helpers (`skills/checkpoint/SKILL.md`, section 4, step 1), into project/safety-net/screens (made by the safety net). A screen that needs the live database or a key shows what the app shows without it (an error, an empty list): keep it, and list it as "not recorded with real data".
4. **Write it down** in project/safety-net/README.md (made by the safety net): the date, the commands, what passed, what was already broken, and each screen with its picture. Commit and push.
5. **Show the user the walkthrough** (spec screen E4): a page at phone size with the screenshots in the order of the main flows, one line under each, published the way the mockup is (`skills/mockup/SKILL.md`, section 5). Then:
   > Here's Pets as it works today: 9 screens, and 3 flows I'll check after every change. Two screens need your live data, so they show as empty here.
   > • That's how it works *(recommended)*
   > • Something's already broken (tell me by voice)

   "Something's already broken": read it back in a line, and record it in the safety net's README, under "Already broken". It becomes a fix in the plan (section 9), not a surprise later.

From now on, every change keeps the safety net passing: the tests, the flows, and screenshots compared with these. A change that's meant to alter a screen updates its recorded picture in the same step, with the before-and-after the user approved.

## 8. Screen E6 · What to change, before and after

1. **Ask what they'd like to change,** by voice is fine, and confirm with "Here's what I heard" (`skills/launchwright/SKILL.md`, section 4). Write the app's description as it is today, plus the changes, in project/description.md, under "The app today" and "Changes wanted".
2. **The design guide is the app's own look,** taken from the safety net's screenshots into project/design.md, so changes match the app. Only if the user asks for a new look does the design direction run (`skills/design-direction/SKILL.md`).
3. **For each change, a before-and-after** (`skills/mockup/SKILL.md`, section 7): "Now" drawn from the safety net's screenshots, faithfully, "After" in the design guide, with the same comment boxes. Comments go round until the user approves, as for a new app.
4. **Then the question sweep** (`skills/question-sweep/SKILL.md`), for anything the changes need: a decision, an account, a key, when they can review. Skip what the health check and the guard's questions already answered.

## 9. Screen E7 · The upgrade plan

The build plan (`skills/build-plan/SKILL.md`) makes it, as its own kind of plan: plan.json's pieces, checkpoints and user tasks as usual, with these differences.

- **Small steps.** Each piece is one change the user can name: a fix, a screen, one package upgrade. No piece mixes an upgrade with a feature.
- **Each one checked against the safety net:** its done-when is the app's own tests, the safety net's flows, and the screenshots compared with the recorded ones (only the screens the step was meant to change may differ, and only as the approved after).
- **Each one easy to undo:** one piece is one or a few commits on the working branch, and its report says how to undo it.
- **The order:**
  1. The safety net's own additions (done in section 7).
  2. Anything already broken that the user wants fixed, and the health check's fixes: a key in the code (a user task with the keys skill, before anything else), a missing test for a fragile part.
  3. Package upgrades, one at a time: Expo one version at a time, as Expo recommends (`skills/existing-app/sources.md`), each its own piece with its own checkpoint run of the flows.
  4. The user's changes, each after its before-and-after was approved.
- **Checkpoints** are the usual ones (`skills/checkpoint/SKILL.md`), with the safety net's flows in them.
- **Going live is the user's.** When the working branch is launchwright-work, the plan ends each release with a user task: the same one-tap merge on GitHub as section 5, step 4, which puts the change live. For store versions it's the launch preparation as usual (`skills/launch-prep/SKILL.md`).

Show it and get it approved as any plan (screens 12 to 18: `skills/build-plan/SKILL.md`, section 8 onward). From there the build runs the usual path: the build relay, checkpoints, launch preparation and after launch.

## 10. Picking up later

Read the project's files and carry on at the first that's missing:
- ideas/<app>/health-check.md in the home project, but no app project yet: section 4's verdict, or section 5.
- The kit's settings say type existing, but the guard's questions aren't in project/decisions.md: section 6.
- No project/safety-net/README.md (made by the safety net), or the user hasn't answered the walkthrough: section 7.
- No "Changes wanted" in project/description.md: section 8.
- No approved plan: section 9.

## What's Claude-only here

The helper and the checks are plain Node; the steps are standard skill instructions. Three things are specific to Claude: a thread adding the app's place on GitHub to itself (section 2), finding the plugin's folder from the skill's own folder (section 5), and the Claude project the app gets (section 5). Other assistants need their own way to do these three.

## What this skill never does

- Changes the app before the safety net is recorded and seen.
- Pushes to a branch that puts the app live, or merges anything: that's the user's tap.
- Prints a key, opens a file named like .env, or rewrites the history to hide a key.
- Reads, copies or reaches real users' data, or points the app at the live database.
- Promises to work on an app the kit doesn't know, or calls the user's app bad.
- Moves the app's users or data to a new version without the user's yes; that's a hard stop.
