---
name: setup-assistant
description: Walks a new Launchwright user through the one-time setup, on a computer, in nine steps - a paid Claude plan and the phone app, GitHub and Claude's access to it, Expo, the two app stores, the cloud environment, phone alerts, the plugin, the home project, and Apple signing on their own iPhone. Use when the user says set me up, when Launchwright isn't set up yet and they're on a computer, or when they come back to finish a setup step. Claude does the clicks in the user's own signed-in browser where it can, and gives Where, Do and You'll see where it can't.
---

# The setup assistant

This skill takes a new user through Launchwright's one-time setup (spec section 4; brief items F1 and F2). It runs once, on a computer, for all of the user's projects. After it, everything works from the Claude phone app.

Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4): one question at a time, two to four tap-to-answer options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat. Lines starting with `>` are what the user sees.

Files in this folder:
- `skills/setup-assistant/sites.md`: the sites the user's cloud environment must allow (step 5), to send as its own message.
- `skills/setup-assistant/sources.md`: what the platforms' own docs say about each step, with sources and dates, including Apple signing (step 9) and making an app's home and Project from the phone (open point O4). Read it before the step it covers; read the page again if it's more than a month old.
- `skills/setup-assistant/examples/dry-run.md`: a dry run with the walkthrough's sample user.

## 1. How it runs

- **On a computer.** If the user is on a phone, say so and stop (the front door's section 1 has the message). Setup needs a computer for steps 7 and 9.
- **Claude does the clicks where it can,** in the user's own signed-in browser, with the user approving each step (D-14). If Claude has no browser tools, every step is Where / Do / You'll see instead, and Claude checks a screenshot.
- **Name the browser exactly** (lesson 18). The simpler path is the user's own browser, where they're already signed in. The browser inside the Claude desktop app starts signed out of everything; if that's the one Claude can use, say so:
  > I can do the clicks in the browser inside the Claude desktop app. It starts signed out, so you'll sign in to each site once.
  > • Use my own browser instead *(recommended: you're already signed in there)*
  > • That's fine
- **The user types every password and sign-in themselves,** on the site that asks for it. Claude never asks for a password, a key or a code in the chat, and never types one.
- **Hard stops stay the user's** (the front door's section 5). In setup they are: paying for anything (the stores' fees), installing software (the phone apps, Expo's tool in step 9, and the plugin), and making anything public.

### Each step is one screen

A title, why it's needed in one line, the action, and a tap. Progress shows as "Step 4 of 9":

> **Step 4 of 9 · The two app stores**
> Your apps go to Apple's and Google's stores under your own name, so you need an account with each.
> • Done *(recommended)*
> • I'm stuck
> • I'll finish this later

"I'm stuck" asks for a screenshot and works through it. "I'll finish this later" records the step as a user task with a do-by date (section 4) and goes on, if a later step doesn't need it.

### Where it starts

Check what's already done before step 1, and skip it with one line each:

- The plan and phone app: Claude can't see these; ask.
- GitHub and Claude's access: Claude can see whether its GitHub tools reach the user's account.
- The others: ask, one at a time, only for the steps the user says they've started.

A user who comes back part-way picks up at the first step that isn't done, from the home project's setup notes (section 4) or, before step 8, from what they say.

## 2. The nine steps

### Step 1 · A paid Claude plan, and the Claude app on the phone

Projects need a paid plan: Pro, Max or Ultra (sources.md, "Plans"). Claude explains; the user does it.

> **Step 1 of 9 · Claude, on your plan and your phone**
> Your builds run in Claude's cloud as a project, which needs a paid plan: Pro, Max or Ultra. And the Claude app on your phone is where you follow them.
> • I have both *(recommended)*
> • Show me how

If they want to see how:

> **Where:** claude.ai, signed in, then your name, then Settings, then Billing.
> **Do:** check your plan says Pro, Max or Ultra. If not, pick one there: that's a payment, so it's your choice. Then install the Claude app from your phone's app store, and sign in with the same account.
> **You'll see:** "Projects" in the menu at claude.ai/code, and your chats in the phone app.

### Step 2 · GitHub, and Claude's access to it

Every app lives in its own place on GitHub. Claude reaches only the ones the user adds to Claude's access, and a new one is invisible until it's added (lesson 17). The user signs in and chooses; Claude clicks.

> **Step 2 of 9 · GitHub, where your apps are kept**
> Each app's files live on GitHub. If you don't have an account yet, it's free.
> • I have an account *(recommended)*
> • Make one with me

Then Claude's access, from claude.ai (sources.md, "GitHub access"): connect the GitHub account to Claude, then install Claude's GitHub app. Ask which apps it reaches:

> Claude needs access to each app's files on GitHub. Which should it reach?
> • Only the ones I pick *(recommended: Claude can't touch your other work)*
> • "All repositories": no extra step for each new app, but Claude can reach all your code

If they pick "Only the ones I pick", say once that each new app is added there too, and that Launchwright reminds them when it's time:

> **Where:** github.com, signed in, then your picture, Settings, Applications, Installed GitHub Apps, then Configure next to Claude.
> **Do:** under "Repository access", choose "Only select repositories". You'll add your home project here in step 8.
> **You'll see:** "Only select repositories" chosen, with a Save button.

The repository's own settings page can't add Claude's access; only the Configure page above can (lesson 17).

### Step 3 · Expo, and Expo's GitHub app

Expo builds the apps on its own servers, so a change on GitHub can start a build with no key in Claude's cloud (spec section 1). The user signs in; Claude clicks, or Where / Do / You'll see.

> **Step 3 of 9 · Expo, which builds your apps**
> Expo turns your app's files into something your phone can install. Its free plan is enough to start; anything paid is asked about first.
> • I have an Expo account *(recommended)*
> • Make one with me

Then link GitHub to Expo (sources.md, "Expo and GitHub"):

> **Where:** expo.dev, signed in, then your picture, Account settings, then "Connections".
> **Do:** connect your GitHub account, and accept what Expo's GitHub app asks for.
> **You'll see:** your GitHub name under "Connections".

Each app is linked to its own place on GitHub later, when it's made (spec screen 6). No Expo key goes into Claude's cloud, ever.

### Step 4 · The two app stores

The user pays the stores' own fees; Launchwright never does. Apple's membership can take a while to be accepted, so it starts now.

> **Step 4 of 9 · The two app stores**
> Your apps go out under your own name, so you need Apple's developer membership and a Google Play developer account. Each has its own yearly or one-time fee, paid to them by you.
> • Show me Apple first *(recommended: it takes longest)*
> • I have both
> • I'll do this later

Read each store's sign-up page that day for the steps and the fee, and give them with Where / Do / You'll see. Never state a fee from memory. Two things to say plainly:
- **Apple:** step 9 can start only once the membership is active.
- **Google:** a personal account made now needs 12 testers for 14 days in a row before the first public release (sources.md, "The app stores"). The build plan schedules that; nothing to do now.

If they finish one later, record it as a user task (section 4): Apple's do-by is the day step 9 needs it; Google's is the first launch's tester plan.

### Step 5 · The cloud environment

Every Project the user makes for Launchwright runs in this one environment. It holds no key at all (spec section 1); the app's keys, when one is needed, go in a separate keys environment for that app (`skills/keys/SKILL.md`). The user edits it; Claude says exactly what to type where.

> **Step 5 of 9 · Where your builds run**
> Your builds run in Claude's cloud, in a setup called an environment. Let's make one called Launchwright. It never holds your passwords or keys.
> • Show me *(recommended)*

1. **Make the alert channel's name first,** for step 6. It's a long, random name of letters, digits and dashes, at least 16 characters (`scripts/alert.mjs` refuses shorter), made by Claude on the computer, for example "lw-" and 20 random letters and digits. Show it once on a line of its own, so it's easy to copy. It's not a key: alerts never hold anything private. But anyone who knows it can read the user's alerts, so say:
   > This is your alert channel's name. Keep it to yourself, like a house key: anyone with it can read your alerts. They never hold anything private.
2. **Send the site list** from `skills/setup-assistant/sites.md` as a message of its own, one site per line, so it can be pasted in one go. Leave out the notes; only the sites.
3. **The environment:**
   > **Where:** claude.ai/code in your browser, on the new-session screen.
   > **Do:** tap the first button under the message box, then "New environment". Name it "Launchwright". Under "Network access" pick "Limited", keep "Allow package managers" ticked, and paste the list of sites I just sent into "Allowed domains". Under "Environment variables", add one line: the name I send next, an equals sign, then your alert channel's name. Tap "Add environment".
   > **You'll see:** "Launchwright" in the list of environments.

   Send the variable's name, LAUNCHWRIGHT_ALERT_CHANNEL, on a line of its own just before, as the keys skill does with a variable's name. The labels are from Claude Code's docs (sources.md, "Cloud environment"); if the user's screen shows something else, ask for a screenshot.
4. **Check it** with a screenshot of the environment's dialog: the name, "Limited", the sites. Don't ask to see the variable's value.

A site the user adds later (a service an app uses, or a podcast host that was refused) goes into the same "Allowed domains" list. A change reaches running sessions within about a minute (sources.md, "Cloud environment"), but add every site a phase needs before it starts (lesson 11).

### Step 6 · Phone alerts

Claude's own notifications don't reach the phone for cloud builds, so alerts come through ntfy, a small free app. The user installs it; Claude sends the test.

> **Step 6 of 9 · Alerts on your phone**
> When a build needs you, your phone buzzes. That comes through a free app called ntfy. Alerts only ever say things like "your build needs one answer".
> • Set it up *(recommended)*
> • Skip alerts: I'll check the status page myself

> **Where:** your phone's app store.
> **Do:** install "ntfy". Open it, tap the plus button, and type your alert channel's name exactly. Leave the server as it is. Allow notifications when it asks.
> **You'll see:** your channel's name in ntfy's list.

**The test alert** must arrive before this step passes. It's sent from the Launchwright environment, never from this setup chat (lesson 19): the setup chat runs on the computer, and only the environment knows the channel's name. So the real test is the first thing the home project does, in step 8. Until then, say:

> I'll send the test from your home project in step 8, because that's where alerts come from. Keep ntfy open on your phone.

If the user skips alerts, the status page alone tells them what's going on, and the home project records that alerts are off. They can turn alerts on later with this step.

### Step 7 · The plugin

**Waits for Phase 3's checks (P3.U; sources.md, "The plugin").** Decision K2 (D-21) lets this step turn the plugin on for the user's whole account, so its guard reaches Project builds, but only once Phase 3 has shown the guard stays silent in a project that isn't Launchwright's, and has found the exact taps to switch it on and off that the user can reach. Until `skills/setup-assistant/sources.md` records both, under "The plugin" (the thread that records the results of Launchwright's own phone checks writes them there), this step uses the per-project path only, and its "Where" and "Do" lines for the account switch stay unwritten: never guess them. The review piece P3.R6 checks this step against D-21 and P3.U's results.

1. **The plugin is on this computer** already if the user started setup from it. If they started from a copy of the kit instead, installing is a hard stop: ask, then install it with Claude Code's plugin command on the computer, with the marketplace in the README. The phone app can't do this.
2. **Look for a Plugins section** in a Project's settings (lesson 25). Project settings on the user's account may show only General, Memory, Environment, Usage and Advanced (sources.md, "The plugin"). Look in step 8's Project once it's made, by screenshot.
3. **If there's a Plugins section:** add Launchwright there, for the home project and each app's Project. Nothing account-wide.
4. **If there isn't one, and Phase 3's checks passed:** offer the account switch, saying plainly what it does and how to undo it:
   > Your projects have no place to add Launchwright's safety check, so the safest way is to turn Launchwright on for your whole Claude account. Its safety check does nothing outside your Launchwright projects. Its skills will also be listed in your other Claude chats, and you can switch it off any time.
   > • Turn it on, and show me the off switch *(recommended)*
   > • Keep it to this computer only
   Show the off switch before switching it on, with Where / Do / You'll see from sources.md, "The plugin".
5. **If there isn't one, and Phase 3 found no off switch the user can reach:** the plugin stays on this computer only. Say what that means in one line: builds in Projects still run, with the kit's own rules and no keys in their environment (spec section 1); steps that need a key run in a separate session where the kit's guard does load (`skills/keys/SKILL.md`, section 6).
6. **The plugin's alert setting** (open point O11, still open): if Claude Code asks for an alert channel when the plugin is turned on, the user may paste the same channel name there, or leave it empty; cloud builds use the environment's copy from step 5.

### Step 8 · The home project

Ideas are explored in one home project before any of them gets its own app (spec section 3). Claude clicks; the user approves. The home project's place on GitHub is made from Launchwright's public starter template, launchwright-starter (decision K1, D-21).

> **Step 8 of 9 · Your home project**
> Your ideas live in one home project. I'll make it on GitHub from Launchwright's starter, let Claude reach it, and make a Claude project on it that uses your Launchwright environment.
> • Go ahead *(recommended)*
> • Show me each step, I'll do the taps

Making it public or private is the user's call; recommend private (spec choice 12). The three parts, each checked before the next (sources.md, "O4"):

1. **The home on GitHub, from the starter.** Claude can't be counted on to make it through its own GitHub tools: they reach only what Claude's GitHub app was given, and a guarded project refuses it. So it's made on GitHub's website:
   > **Where:** github.com, on the launchwright-starter page, github.com/karthickuab-wq/launchwright-starter.
   > **Do:** tap "Use this template", then "Create a new repository". Name it "launchwright-home", choose "Private", and tap "Create repository".
   > **You'll see:** your new launchwright-home page, with the starter's files.
2. **Claude's access to it,** if the user chose "Only select repositories" in step 2: the Configure page from step 2, adding launchwright-home. Lesson 17: until it's added, Claude can't see it.
3. **The Claude project:**
   > **Where:** claude.ai/code in your browser, then "Projects", then "New project".
   > **Do:** name it "Launchwright home". Under Context, tap the plus button and pick launchwright-home. Tap Create. Then open the project's settings, "Environment", and choose "Launchwright".
   > **You'll see:** "Launchwright home" open, with Launchwright as its environment.
   Then step 7's Plugins check, by screenshot of the project's settings.
4. **The first thread** in the home project, started by the user with the words "set up my home project", does three things: records the user's time zone in the kit's settings (asked here in setup, with the computer's own time zone as the recommended answer), sends the test alert at the fyi level with the kit's alert script, and records the setup's open tasks (section 4). The alert:
   > Did a test alert from Launchwright reach your phone?
   > • Yes, it arrived *(recommended)*
   > • Nothing came
   If nothing came, check the channel name in ntfy and in the environment, letter by letter, with screenshots, never by sending the name in the chat again; then send again. Step 6 passes only when the alert arrives.

The starter comes with its kit settings' name and time zone empty, set up for a phone app (spec section 2.5). So this first thread writes, with a file edit to the kit's settings (launchwright/kit.json): type home, appPath empty, name the user's first name, and the time zone. The home project leaves the app folder the starter brought unused.

### Step 9 · Apple signing, solved once

A sample app goes on the user's iPhone today, so any signing problem shows up now, not at launch (lesson 9). The user signs in to Apple once through Expo, so Expo keeps the signing credentials, and registers the iPhone with Expo. Claude builds; the user installs and taps "it opened".

What Expo's docs say (sources.md, "Step 9"): Expo's website can register the iPhone (a link or QR code opened on the phone), but it can't sign in to Apple and make the signing credentials. That needs Expo's command-line tool, answered in a terminal on a computer, once. So:

> **Step 9 of 9 · Your iPhone, ready for test apps**
> I'll put a sample app on your iPhone today, so any problem with Apple shows up now, not at launch. You'll sign in to Apple once, in a window I open on this computer, never in this chat.
> • Start *(recommended)*
> • My Apple membership isn't active yet

- **Wait for the membership.** If it isn't active, record a do-by task for this step (section 4) and finish the rest of setup. Ideas don't need signing; only the first app build waits.
- **Installing Expo's tool is a hard stop.** Ask first, and say what it is: Expo's own free program, run once now, removable afterwards. It needs Node on the computer; if Node isn't there, installing Node is the user's step too, with Where / Do / You'll see from Node's own download page, read that day.
- **The sample app** is the plugin's Expo starter (the expo-app folder in its templates), copied to a folder on the computer, set for test installs.
- **Claude opens a terminal window** running Expo's sign-in, then the device registration, then the first iPhone build, and the user answers its questions there. Before it opens:
  > A window opens with questions from Expo. Answer them there, never here:
  > • Your Expo sign-in, then your Apple ID and password, and the code Apple sends to your phone
  > • "How would you like to register your devices?": pick "Website"
  > • Generate a new certificate and profile: yes to both
  > Tell me when it shows a link or QR code.
- **Register the iPhone:**
  > **Where:** your iPhone's camera, pointed at the QR code on the computer.
  > **Do:** open the link, tap Allow to download the profile, then open Settings, tap "Profile Downloaded", and tap Install.
  > **You'll see:** the page in Safari says your phone is registered.
- **The build** runs on Expo's servers. When it's done, Expo shows a QR code to install it:
  > **Where:** your iPhone's camera, pointed at the install QR code.
  > **Do:** open the link and tap Install. Then tap the new app. If it says Developer Mode is needed, open Settings, Privacy and Security, Developer Mode, turn it on, and restart the phone when it asks.
  > **You'll see:** the sample app opens.
  > • It opened *(recommended)*
  > • Apple is still processing my phone
  > • It didn't install
- **Apple's wait.** On a new or just-renewed membership, Apple can take 24 to 72 hours to accept a newly registered phone, and the first build that includes it may fail (sources.md, "Step 9"). If so, record a do-by task for two days later: run the build again. The rest of setup doesn't wait.
- **An Android phone:** no signing step. The sample app is built for Android and installed from Expo's link; the phone asks to allow installs from the browser once.

Expo's tool stays signed in on this computer, which every later app's first iPhone build needs too (sources.md, "Step 9", per-app finding). Tell the user they can sign it out at any time, and that Launchwright will ask before using it again.

## 3. Done

Setup is done when the test alert arrived (or alerts were skipped), the sample app opened on the phone (or Apple is still processing it), and the user said "start a new app" in the home project from their phone:

> Setup's done. From now on, everything works from the Claude app on your phone.
> Open the Code tab, then Projects, then Launchwright home, and say "start a new app".
> • Got it *(recommended)*

If Apple is still processing the phone, add one line: ideas can start now; the first app build waits for Apple.

## 4. What's recorded

- **In the home project** (from step 8 on), in project/decisions.md under Setup: each step, done or skipped, with the date; GitHub access "only the ones I pick" or "all"; alerts on or off; the plugin's path (Project setting, account-wide, or this computer only). Never a name, password, key or the alert channel's name.
- **User tasks with do-by dates,** with the kit's status script's ask command at the do-by level: a store account still to finish, Apple's membership, a rebuild after Apple's wait. Each says what it holds up; only that waits.
- **The time zone** in the kit's settings (step 8).
- **Before step 8,** nothing is written anywhere: there's no project yet. Steps done before it are recorded by the first thread from what the user confirms.

## 5. Never

- Ask for, type, read back or store a password, key, sign-in code or recovery code. Apple's and Expo's sign-ins are typed by the user, in the window or site that asks.
- Pay, or start anything paid, without the user's yes; the stores' fees are theirs, and paid Expo plans are asked about each time (D-21, K3).
- Install software, or make anything public, without the user's yes.
- Put a key in the Launchwright environment.
- Turn the plugin on for the whole account before Phase 3's checks pass, or without showing the off switch first.
- Change Claude's permission settings, or any of the user's settings for them: the user makes each change, or approves Claude's click.
- Guess a label, a fee or a step: read the platform's page that day, and record anything new in sources.md's way, with the source and date.
