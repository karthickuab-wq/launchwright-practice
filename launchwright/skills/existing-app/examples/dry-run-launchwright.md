# Dry run: the health check on Launchwright's own repo

Run by P3.C3 on Nov 18, 2026, on karthickuab-wq/launchwright at the piece's own commits (401 files, 53 commits in the history), with:

```
node skills/existing-app/health-check.mjs . --history
```

Launchwright's repo isn't an app: it's the plugin, and it holds two starter apps among its templates. That makes it a fair test of the honest verdict, and of the "several apps in one place" rule. Below is what the skill does with the report, then what the user would see.

## What Claude reads in the report

| Heading | The report | What Claude makes of it |
| --- | --- | --- |
| Built with | kind expo; Expo ~58.0.26, React Native 0.88.1, Expo Router, React; appFolders: the starters' expo-app and web-app folders; no made-with trace; no backend | Two app folders, so section 3 asks which app this is before anything else. Neither is an app the user made: both are the kit's starters. |
| Runs and ships | 21 package scripts (all in the two starters); one GitHub workflow, status.yml, runs on every push to main and "publishes"; eas.json with preview, e2e-test and production builds and a submit profile; no hosting files | The workflow publishes the build's status page, not an app. Nothing here puts an app live by itself, though the helper's guess (deploysOnMainPush) is yes because of the word "publish": Claude reads the workflow before saying so, and the user confirms in section 5 anyway. |
| Fragile | no lockfile; two long files (the guard's rules, 1,898 and 1,280 lines); 21 TODO-style notes | The starters have no lockfile on purpose (a new app makes its own on first install). The two long files are the guard, which is meant to be one piece. |
| Keys in the code | 4 found, all in test files: "an Anthropic key" and "a GitHub token" in the alert script's test, "a Stripe secret key (test)" in the store answers' test, and "a value named like a secret" in the health check's own test; history: the same 4, all still in the code; no .env file now or ever | Looking at each line without printing it: each is a made-up sample that a test feeds in to prove a key is refused. Not real keys, so nothing to fix. |
| Out of date | Expo, React Native, React, Expo Router and TypeScript all match the kit's starter | The starters are the kit, so they can't be behind it. The rest waits for an install. |
| Safe to change | care: the GitHub workflows (they decide what happens on each push); the starters' app settings and build settings (store identity) | Everything else is safe once a safety net exists. |
| The guard's hints | working branch: its own; no production branches, scripts, key folders, data paths or data hosts | No sweep questions would be needed beyond the working branch. |

## What the user would see

First, because the report lists two app folders:

> I found two apps in this place: a phone app starter and a web app starter. Which one would you like to improve?
> • The phone app starter *(recommended: it's the fuller of the two)*
> • The web app starter
> • Neither, I picked the wrong place

Then, if they picked the phone app starter (the lines below come from a second run on that folder alone, `node skills/existing-app/health-check.mjs templates/expo-app --kit .`: kind expo, the only fragile point is the missing lockfile, no keys, care for its app and build settings, nothing that deploys):

> Here's how the phone app starter is doing:
> • **Built with:** Expo, for iPhone and Android, with nothing on a server.
> • **How it runs and ships:** it builds on Expo; nothing puts it live by itself.
> • **Fragile:** it has tests, but its package versions aren't fixed yet. That's normal for a starter.
> • **Keys in the code:** none. A few made-up ones sit in tests, on purpose.
> • **Out of date:** nothing; it's on the newest Expo the kit knows.
> • **Safe to change:** almost everything. The store settings need care.

And the verdict, said honestly:

> This is Launchwright's own starter, not an app you've built, so there's nothing to improve yet. To make an app from it, start a new app idea instead.
> • New app idea *(recommended)*
> • Keep the report, that's all for now

## What the dry run changed in the helper

- A database host named only in a test file was listed as real users' data (the helper's own test names a made-up one). Test files are now left out of that search, with a test for it.
- "A value named like a secret" comes from the helper's own test fixture. It's kept: it shows that a key in a test file is reported with inTestFile, and that the skill's step of looking at the line is what tells a sample from a real key.
