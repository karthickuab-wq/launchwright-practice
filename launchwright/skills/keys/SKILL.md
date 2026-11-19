---
name: keys
description: How a Launchwright project gets a key for a service, such as a payments or email service. Use at the question sweep's keys group, when a piece of the plan needs a key that isn't there yet, when the user wants to change or remove a key, and when a key turns up somewhere it shouldn't (pasted in a chat, or sitting in the code). Asks for one key at a time, for one project, only when it's needed, never in a chat, with Where / Do / You'll see, and says exactly where each key goes.
---

# Keys on demand

This skill gets a project the keys it needs, one at a time, without Claude ever seeing one. A key is the password-like code a service such as a payments or email service gives the app so it can use that service.

It covers brief item F17, the key rules of spec section 10, the keys group of the question sweep (spec screen 11), and open point O11 for project keys. Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4): one question at a time, tap-to-answer options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat.

In a project, this skill lives in the kit: read this file at launchwright/skills/keys/SKILL.md, and run the status script from the repo's top folder, as the kit's AGENTS.md shows. What the platforms' docs say about where keys can go, with sources and dates, is in `skills/keys/sources.md`.

## 1. When it opens

- **The question sweep reaches its keys group** (spec screen 11, after decisions and accounts). Ask for each key the plan will need, one at a time, in the order the build will need them.
- **A piece needs a key that isn't there yet:** its plan entry has needsKey true, and project/questions.md doesn't show that key as added. Only that piece waits (section 6).
- **The user wants to change or remove a key** (section 7).
- **A key turns up where it shouldn't:** pasted into a chat, or found in a file, the code or its history (section 8).

It never opens during the one-time setup, which holds no project keys, and never "just in case": a key is asked for only when a step of this project really needs it.

## 2. The rules

These come from spec section 10 and brief item F17. They never bend.

1. **One key, for one project, only when it's needed.** First check that the step really needs a key. Building and testing an Expo app needs none: a push starts the build on Expo's servers, and the Apple and Google credentials stay with Expo (spec section 1).
2. **Never in a chat, never in a file, never printed.** Claude never asks for a key's value, never types one, and never sees one. The user pastes each key straight into the service that keeps it (section 3). If a user pastes one into a chat anyway, section 8 says what to do.
3. **Test keys first.** Every key the build uses is the service's test or practice key, where no real money moves and no real person gets a message. If the service has no test mode, say so and ask before going on.
4. **Production keys never go to the cloud** where Claude works. A live key is a hard stop: it's the user's step, at launch, straight into the service that runs the live app (section 3, row 4). Claude prepares the steps; the user does them.
5. **The Project's own environment holds no keys at all.** The threads of a Claude Code Project all use it, and the guard may not run there (spec section 1, open point O1). Each app's keys sit in that app's own keys environment, used only by the plain cloud sessions that need them (section 6).
6. **No project key goes into the plugin's masked settings** (open point O11, settled here). Masked settings are one set for the whole plugin, not one per project; they're kept on the machine where the plugin is turned on; and Claude Code hands them only to the plugin's hooks, never to a script or a cloud build (`skills/keys/sources.md`, "Masked plugin settings reach hooks only"). So they can't keep a key to one project, and a cloud build can't use them. Project keys go where section 3 says.
7. **Store credentials aren't this skill's.** The Apple sign-in stays with Expo from setup step 9, and Google's key goes to Expo's website at the first launch (spec screen 16), never to Claude.
8. **The user can change or remove a key at any time** (section 7), and is told so when it's added.

## 3. Where each key goes

Before asking, work out who uses the key. Read the service's own docs for it and record each fact with its source and the date in project/rules.md: the host the key is sent to, how it's sent, whether the service calls it public or secret, and whether there's a test key. Never guess any of these.

| Who uses the key | Where it goes | How it's kept | Who adds it |
| --- | --- | --- | --- |
| **1. The build's own sessions**, to set up the service or test against its test mode (for example making test products, or a test that sends a practice email) | A **network secret** on the app's own keys environment in Claude's cloud settings | Claude's agent proxy adds the key to requests for the hosts the user lists, after they leave the session, so the key never enters the session: no command, file or agent can read it (`skills/keys/sources.md`, "Network secrets") | The user, on claude.ai/code |
| **2. The app's own server code**, such as an Expo Router API route on Expo's hosting | An **environment variable on Expo**, for this project, in its development and preview environments | **Sensitive** (hidden in Expo's logs), because Expo's hosting can't deploy secret ones; **Secret** for a value only Expo's build jobs use, such as a token for a private package (`skills/keys/sources.md`, "Keys on Expo") | The user, on expo.dev |
| **3. The app itself**, for a key the service says is public, such as a "publishable" key | An **environment variable on Expo** whose name starts with EXPO_PUBLIC_ | **Plain text.** Anything inside the app is readable by whoever has the app (Expo's docs), so only a key the service itself calls public goes here | The user, on expo.dev |
| **4. The live app** (a production key) | Only at launch, into Expo's **production** environment or the service that runs the live app | As in rows 2 and 3. Never in a Claude environment | The user, as a hard stop; the launch-prep skill (`skills/launch-prep/SKILL.md`) brings it up |

**Never inside the app** for a secret key: code that runs on the phone or in the browser is public. If the app needs a secret key, the plan gives it server code (row 2) that holds the key and does the work.

**When a network secret can't carry the key** (row 1): the agent proxy never adds a secret to requests to GitHub, the Anthropic API or the public package registries, and some services take a key in a way the secret's form doesn't offer. Then, and only for a test key, it goes as an environment variable in the same keys environment. Tell the user plainly that sessions in that environment can read it, and add its name to the guard's key names (section 9), so the guard refuses any command that would print it.

## 4. Asking for one key

One key per message, with what it holds up, the recommended choice first:

> Your app takes payments, so the build needs a practice key from Stripe. No real money moves with it.
> You'll put it into a safe place in Claude's settings: I can use it, but I never see it. Never paste it here.
> • Show me how *(recommended)*
> • Later: only the payments part waits

If they pick "Later", record the skip in project/questions.md under Skipped, with the work that waits on it, and go on to the next question.

If they pick "Show me how", give the steps one screen at a time, each with a tap to say it's done. The examples in this skill use Stripe and a sample app called Pantry Pal; the parts in square brackets are filled in from the service's own docs when the skill runs (section 3), never from memory. Getting the key:

> **Where:** Stripe's website, signed in, in test mode.
> **Do:** [the steps from Stripe's docs to the page with the test keys], and copy the test secret key.
> **You'll see:** [what Stripe's docs say a test key looks like].

Then where it goes, by section 3's row.

### Row 1: a network secret on the app's keys environment

The first time this app needs a key, it gets its own keys environment. The user makes it once:

> **Where:** claude.ai/code in a web browser. A computer is easiest.
> **Do:** on the new-session screen, tap the first button under the message box, then "New environment". Name it "Pantry Pal keys". Set "Network access" to the same choice and sites as your Launchwright environment, so your status page works there too. Tap "Add environment".
> **You'll see:** "Pantry Pal keys" in the list of environments.

Then the key itself:

> **Where:** claude.ai/code, the same list of environments.
> **Do:** tap the settings icon on the "Pantry Pal keys" row, then "Network secrets", then "Add secret". Keep "Bearer". In "Allowed websites" type [the host from Stripe's docs]. Paste your key as the "Value". Tap "Add".
> **You'll see:** the secret in the list, next to that host, with no "Not sent" note.

Fill in the host, and the header if it isn't the usual one, from the service's docs (section 3). On a Team or Enterprise plan without the organization's admin role, the form is shorter: one "Host", a "Secret type" of "Token", and the key in "Token" (`skills/keys/sources.md`, "Network secrets"). If the list shows "Not sent", ask for a screenshot and read the note under it with the user.

### Rows 2 and 3: a variable on Expo

Send the variable's name on a line of its own first, so it's easy to copy. Then:

> **Where:** expo.dev, signed in, on your app's page, then "Project settings", then "Environment variables".
> **Do:** tap "Add Variables". Type the name I just sent, paste your key as the value, tick "development" and "preview", and choose "Sensitive". Save it.
> **You'll see:** the name in the list, tagged "development" and "preview", marked "Sensitive".

Choose "Secret" or "Plain text" instead when section 3 says so. Expo's own command for this is the user's step, not Claude's: the guard refuses it, because it touches keys.

### After it's added

1. **Record it** (section 9).
2. **Check it works,** the first time a session in that environment needs it: one harmless call the service's docs name, that only reads (never one that charges, sends or changes anything). Never print what comes back beyond whether it worked. If it fails, tell the user in one line and show the step to look at again.
3. **Tell the user once,** in one line, that they can change or remove it whenever they like.

## 5. The question sweep

At the sweep, list the keys the plan needs first, so the user sees how many:

> The build needs 2 practice keys: Stripe, for payments, and one for your email service. Let's do them one at a time.
> • Start with Stripe *(recommended)*
> • Later: payments and emails wait

Then section 4 for each. Ask only for keys the approved features need; an extra service is the user's call, as a decision, before its key.

## 6. Running a piece that needs a key

A Project's threads hold no keys (rule 5), so a piece that needs one runs as a plain cloud session on the app's repo in its keys environment, where the repo's own guard runs (spec section 1; `skills/keys/sources.md`, "Where a repo's own hooks run"). How a coordinator starts such a session by itself is still open point O1. Until it's settled, the user starts it, from the phone:

> One part of the build needs your Stripe key, so it runs in its own session. Can you start it? It takes a minute.
> • Show me how *(recommended)*
> • Later: only the payments part waits

> **Where:** the Claude app, the Code tab.
> **Do:** start a new session, not inside a Project, and pick Pantry Pal's home on GitHub for it. Tap the first button under the message box and pick "Pantry Pal keys". Paste the message I sent just before this one, and send it.
> **You'll see:** the session starts, and your status page shows the payments part running.

The message the user pastes is the piece's brief from the build relay (`skills/build-relay/brief.md`), sent on its own just before. The coordinator records the wait with the status script's ask command at the blocking level, under the id run-<piece id> (for example run-P2.2), holding only that piece, and keeps every other piece going (`skills/build-relay/SKILL.md`, section 3). It records it answered once the session has started (the status script shows the piece running). If the key itself isn't in yet, ask for the key first (section 4), under its sweep id, and send this right after. When the session reports, the relay checks it like any other piece.

## 7. Changing or removing a key

The user can change or remove any key at any time.

- **A network secret:** it can't be edited. Delete it and add it again with the new key (`skills/keys/sources.md`, "Network secrets").
  > **Where:** claude.ai/code, the list of environments.
  > **Do:** tap the settings icon on "Pantry Pal keys", then "Network secrets". Delete the Stripe secret, then add it again as before with your new key.
  > **You'll see:** one Stripe secret in the list, with no "Not sent" note.
- **An Expo variable:** change or delete it on the same "Environment variables" page where it was added.
- **A key that's no longer needed:** delete it at the service too, so it stops working everywhere.

Then update project/questions.md (section 9). The guard's list of key names only grows, and a name left on it does no harm.

## 8. A key in the wrong place

- **Pasted into a chat.** Don't repeat it, use it, copy it anywhere or quote any of it. A chat keeps what's in it, so that key is no longer safe:
  > That's a key, so it isn't safe in a chat. Let's swap it for a new one: it takes a minute.
  > • Show me how *(recommended)*
  Then Where / Do / You'll see to make a new key at the service and delete the old one, then section 4 to put the new one in its place.
- **Found in a file, the code or its history** (the existing-app health check finds these too, spec section 8). Name it by kind and file only, never printed. Once a key has been pushed, it stays in the project's history: removing it from the file doesn't make it safe, and history is never rewritten. The fix is a new key at the service, the old one deleted there, and the new one kept as section 3 says, with the code changed to read it from there. A live key here is a hard stop: changing it affects the live app, so the user does it, with the steps prepared.

## 9. What's recorded

- **project/questions.md, under Keys:** one line per key, with its name, the service, what it's for, where it's kept (section 3's row: for example "network secret on Pantry Pal keys, for [the host]", or "Expo, development and preview, sensitive"), test or live, the date it was added, and the date it was last checked. Never the key or any part of it.
- **launchwright/guard/guard.json, keyNames:** the key's name, such as the name of its variable, so the guard refuses any command that would print or expand it. Agents may add to this list, never remove from it.
- **project/rules.md:** each fact from the service's docs used in section 3, with its source and the date read.
- **The status script:** the ask command when a key holds up a piece, under the key's sweep id (such as K-recipes) so a plan task closed by it counts as done, and the answered command when it's in.

## 10. Never

- Ask for, accept, type, print, list, log or commit a key, or any part of one.
- Put a key in the Project's own environment, in the plugin's masked settings, in a file, or inside the app's code.
- Put a production key anywhere Claude works, or set one up for the user. The user does it at launch.
- Run Expo's environment commands, or any command that reads the environment or a key file to find a key. The guard refuses them; if it refuses something a step needs, use the safe way it names.
- Ask for a key before a step really needs it, or for a service the user hasn't chosen.
