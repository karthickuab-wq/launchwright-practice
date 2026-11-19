# Dry run: setup for the walkthrough's sample user

A dry run of the setup assistant, done on Nov 18, 2026, for the user behind the walkthrough's sample app (Usewell, the podcast-idea recipe app). The user is made up: they have an iPhone, a Mac, a new Apple membership that went active today, no Google account yet, and their time zone is America/Chicago, as in the question sweep's dry run. No site was clicked and no account touched; each step's labels come from the pages in `skills/setup-assistant/sources.md`, read today. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## Where it started (section 1)

The user said "set me up" in Claude Code on their Mac, with the plugin installed. Claude had browser tools for the user's own Chrome, so it offered that:

> I can do the clicks in your own browser, where you're already signed in. You approve each one.
> • Go ahead *(recommended)*
> • Show me the steps instead

Go ahead.

## Step by step

| Step | What happened | Recorded later by the home project's first thread |
| --- | --- | --- |
| 1 | "I have both": a Max plan and the phone app | Done, Nov 18 |
| 2 | Had a GitHub account. Picked "Only the ones I pick". Claude opened the Configure page for Claude's GitHub app; the user chose "Only select repositories" and saved | Done; access: only the ones picked |
| 3 | Made an Expo account (the user typed their own password on expo.dev). Claude opened "Connections"; the user connected GitHub and accepted Expo's GitHub app | Done |
| 4 | "Show me Apple first": already active. Google: "I'll do this later" | Apple done. Google: a do-by task, due when the first launch's tester plan starts |
| 5 | Claude made the channel name on the Mac and showed it once; sent the 16 sites from sites.md, then the variable's name. The user made "Launchwright" (Limited, package managers ticked, the sites, the variable) and sent a screenshot; Claude checked the name, "Limited" and the sites, not the value | Done |
| 6 | Installed ntfy on the iPhone and subscribed to the channel. Test waits for step 8 | Done after step 8's test |
| 7 | Waiting on Phase 3's checks, so per-project only: the plugin stays on the Mac. Step 8's project settings showed no Plugins section (screenshot) | Plugin: this computer only, until Phase 3's checks |
| 8 | The user made launchwright-home from the starter on github.com ("Use this template", Private), added it on Claude's Configure page, and made the "Launchwright home" project with the Launchwright environment. The first thread asked the time zone (America/Chicago, recommended from the Mac), sent the test alert, and the user tapped "Yes, it arrived" | Done; alerts on; time zone saved |
| 9 | Below | Below |

## Step 9, as it went

> **Step 9 of 9 · Your iPhone, ready for test apps**
> I'll put a sample app on your iPhone today, so any problem with Apple shows up now, not at launch. You'll sign in to Apple once, in a window I open on this computer, never in this chat.
> • Start *(recommended)*
> • My Apple membership isn't active yet

Start. Node was already on the Mac. Claude asked before installing Expo's tool:

> To talk to Apple, I need Expo's own free program on this computer. It's used once now, and you can remove it later.
> • Install it *(recommended)*
> • Not now: only the test app waits

Install it. Claude copied the sample app to a folder and opened a terminal window; the user signed in to Expo and Apple there, picked "Website", registered the iPhone by QR code, and the first build was sent to Expo. It failed: Apple hadn't processed the new phone yet, which Expo's docs warn about for a new membership.

> Apple is still checking your phone. That's normal for a new membership and takes up to 3 days. I'll try again on Friday at 9 am; nothing else waits.
> • OK *(recommended)*

Recorded: a do-by task for Nov 20, "Build the sample app again", holding up only the first app build.

## Done

> Setup's done, apart from Apple checking your phone. From now on, everything works from the Claude app on your phone.
> Open the Code tab, then Projects, then Launchwright home, and say "start a new app".
> • Got it *(recommended)*

The user said "start a new app" from the phone, and the front door opened the idea intake.

## What the dry run showed

- Step 6 can't pass inside the setup chat: the test comes from the home project (lesson 19), so steps 6 and 8 finish together. Written into the skill.
- Step 7 can't be finished until P3.U records the account switch's taps; the dry run took the per-project path.
- Every new app will need its own first build from the computer before builds start from GitHub (sources.md, "Per-app finding"). Not a setup step, but a cost the build plan must show.
