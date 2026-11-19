---
name: status-page
description: Keeps a Launchwright project's status page up to date and sends its phone alerts. Use after every status change a thread records, when the build starts, when the user asks how their build is going, when a task for the user is added mid-build, and when the user wants phone alerts turned on, moved to a new phone, or fixed. Rebuilds the page from the status files, publishes it as a private page the user opens from their phone, and sends alerts at the right one of three levels.
---

# The status page and phone alerts

This skill keeps the user's status page current and sends their phone alerts. The page is a project dashboard they can open any time from a phone; the alerts tell them when something needs them, and nothing more.

It covers brief item F14 and spec section 9, using the kit's status, alert and page scripts. Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4): one question at a time, tap-to-answer options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat.

In a project, this skill lives in the kit: read this file at launchwright/skills/status-page/SKILL.md, and run the scripts from the repo's top folder, as the kit's AGENTS.md shows. The facts this skill rests on, with sources and dates, are in `skills/status-page/sources.md`. Publishing the page on Claude is in `skills/status-page/publish-claude.md`, the only part of this skill that's Claude-only (spec section 12). A dry run on the sample app is in `skills/status-page/examples/usewell.md`.

## 1. When it opens

- **After every status change.** Whenever a thread runs one of the status script's commands that write (start, finish, fail, block, ask, answered, phase, mode, task-done, rebaseline, page-link), that same thread rebuilds and publishes the page (section 2) before it ends its turn. A thread that records several changes in a row publishes once, after the last.
- **The build starts** (the build relay's screen 13, `skills/build-relay/SKILL.md`, section 2): the thread that records the start (the first phase and the mode) publishes the page for the first time, records its link with page-link, and gives the link in its report. The coordinator doesn't publish or record anything itself, so the "Building" message carries the link only once that thread has reported it.
- **"How's my build?"**, or anything like it (section 5).
- **A task for the user turns up mid-build** that the plan didn't have (section 4).
- **The user wants alerts** on, on a new phone, or fixed because they stopped arriving (sections 6 and 7).

Never on a timer. The page works out its own age each time it's opened, so a page nobody has rebuilt still says how long the build has been quiet (spec open point O3).

## 2. Rebuild and publish the page

1. **Build it from the status files,** never by hand:
   ```
   node launchwright/scripts/render-status.mjs --out <file>
   ```
   The file goes in the session's own scratch folder, outside the repo. The page is never committed: parallel threads would clash over it, and the status files already hold everything (spec section 9). The script prints where it wrote the page and which state it shows.
2. **Publish it** with this platform's tool for private pages. On Claude that's a Claude artifact page: follow `skills/status-page/publish-claude.md`. The page starts private to the user; this skill never shares it or changes who can see it.
3. **The first time only,** record where it opens:
   ```
   node launchwright/scripts/status.mjs page-link <the page's https link>
   ```
   From then on every alert opens the page with a tap. Republishing keeps the same link, so this is recorded once per project.
4. **If the session has no tool that publishes pages** (a plain cloud session started for a step that needs a key, `skills/keys/SKILL.md`), skip publishing. The status files are what count; the next Project thread rebuilds and republishes the page.
5. **If publishing fails,** try once more. If it fails again, leave it and say so in the piece's report. The page that's already published shows its own age, so it never claims to be newer than it is. Never put the page in the repo instead.

The page shows only what the status files hold: piece titles, questions, tasks and notes. So status text follows the same rule as alerts: no keys, code, links, email addresses or the app's data, ever.

## 3. The three alert levels

Alerts go to the user's phone through ntfy, with `scripts/alert.mjs` (spec section 9). Each changed status sends one alert, two at most.

| Level | When | How it's sent | Example |
| --- | --- | --- | --- |
| blocking | The build waits on the user | By the status script's ask command, at the blocking level. It alerts by itself: never send a second alert for it | "Usewell: needs you" · "Your app needs one answer: keep receipt photos?" |
| do-by | A task with a date | By the ask command, at the do-by level, with its date. Planned tasks also get one heads-up when their phase starts (section 4) | "Usewell: to do by Nov 21" · "Take three photos of your fridge for the store pictures." |
| fyi | Good news, nothing to do | By the alert script, at the fyi level, and only for: a phase finished, the whole build done, or a result the user is waiting to read, such as the market check. A checkpoint's test version is an ask, sent by the checkpoint skill | "Usewell: for you" · "The shopping list works. Next: the meal plans." |

Who sends each fyi: the thread that records the next phase sends "phase finished" (before that phase's heads-up, section 4); the thread that records the mode as done sends "build done"; the piece that produced the result sends the third kind.

The fyi command, for the cases above:
```
node launchwright/scripts/alert.mjs fyi "<one plain sentence>"
```

**Writing an alert.** One plain sentence, under about 160 characters, in the user's words, never a piece id. The title is made for it from the app's name and the level, short enough for a lock screen. The script refuses a message that looks like it holds a key, code, a link or an email address: say it again in plain words without the detail. Tapping an alert opens the status page.

**The ask command** sends its own alert and prints one line about it: "Phone alert sent." is done; "No phone alert:" is followed by one of the answers below. If the reason is the wording, record the ask again under the same id with the text in plain words: it replaces the open item and alerts once more.

**What the alert script's answer means:**
- **"Alert sent":** done.
- **"No alert channel is set up":** the user skipped alerts, or the variable isn't in this environment. Carry on; the page shows everything. Don't mention it to the user more than once.
- **"couldn't reach ntfy.sh":** ntfy.sh is missing from the environment's allowed sites. Say so once in the chat, with the fix from section 7, and carry on.
- **"wasn't sent because…":** reword it and send again.

ntfy.sh takes 250 messages a day from one sender (`skills/status-page/sources.md`); one or two per status change stays far below that.

## 4. The user's tasks on the page and their alerts

**Tasks in the plan** (the plan's user tasks, written by `skills/build-plan/SKILL.md`) show under "Coming up for you", with their do-by days, read from the baseline. A task with a `needed` phase also shows "Needed at the start (or end) of <phase>", and its day moves with that phase: the build is often ahead of plan, so the updated day is the one to go by, with the planned day beside it. Their alerts are this skill's job:

1. **A heads-up when their phase starts.** The thread that records a phase with the status script's phase command also sends one do-by alert for every planned task that isn't done and is due on or before that phase's last day. One alert covers them all, dated by the earliest:
   ```
   node launchwright/scripts/alert.mjs do-by "<what to do, in a few words each>" --do-by <earliest date>
   ```
   > Two things to do by Nov 19: add the recipe key, and run the first test builds.
   If nothing is due in that phase, send nothing. The first phase's heads-up goes out when the build starts.
2. **On the day it's needed,** the relay asks for it if it still isn't done (`skills/build-relay/SKILL.md`, section 3): with the ask command at the do-by level, under the task's own id (U- and a word). That alerts the phone again and puts it under "Waiting on you now".
3. **When it's done,** record both: the task-done command for the task, and the answered command for the ask, if one was made. Each list on the page reads its own record.

**A task that turns up mid-build.** The page reads planned tasks from the baseline, and the baseline changes only at a stop, with the user's OK. So a new task would never show under "Coming up for you". Record it at once instead:
```
node launchwright/scripts/status.mjs ask <U-word> --level do-by --do-by <date> --needed <start|end>:<phase id> --text "<the task, plain words>" --holding "<what waits for it>"
```
It shows straight away under "Waiting on you now" with its date, and alerts the phone once. When it's done, record the answered command for it. At the next stop's rebaseline, leave it out of the plan's tasks while it's still open, so the page doesn't list it twice.

The do-by date is worked back from when the build needs it and how long it takes, never just "as soon as possible" (`skills/build-plan/SKILL.md`).

## 5. "How's my build?"

1. Read where things stand with the status script's show command, and rebuild and publish the page (section 2), so the link shows what you're about to say.
2. Answer in one phone screen: the state first, what's being built, the expected finish against the plan, then whatever waits on the user, oldest first. Times in the user's time zone.
   > Building. Now: adding food by typing. Expected Tue Nov 24, on plan.
   > One thing waits on you: whether to keep receipt photos. It holds up adding food by receipt.
   > Status page: [link]
   > • Answer it now *(recommended: the receipt part is waiting)*
   > • Later
3. If nothing waits on the user, leave out the options:
   > Building. Now: the recipe screens. Expected Tue Nov 24, a day early. Nothing needs you.
   > Status page: [link]
4. If the page says "Quiet, maybe stuck", say so plainly and say what happens next (the relay checks the silent piece and starts it again, `skills/build-relay/SKILL.md`):
   > Nothing has reported in for 4 hours, so I'm checking the piece that went quiet. I'll alert you if it needs you.

## 6. Turning alerts on: the ntfy setup the user does once

The one-time setup does this in its steps 5 and 6 (`skills/setup-assistant/SKILL.md`): it makes the alert channel's name, puts it in the Launchwright environment as LAUNCHWRIGHT_ALERT_CHANNEL, and has the user install ntfy. This section holds the details both use, and is how alerts are turned on later: when the user skipped them at setup, has a new phone, or lost the channel's name.

1. **The channel's name.** It works like a password: anyone who knows it can read the alerts, which is why alerts never hold anything private. Claude never reads, prints or asks for the value in the environment. If the user still has the name (in their notes, or in ntfy on an old phone), use it. If not, make a new one as setup step 5 does (at least 16 random letters, digits and dashes), show it once on a line of its own, and have the user put it in the environment:
   > **Where:** claude.ai/code in your browser, on the new-session screen.
   > **Do:** tap the environment button under the message box. Find "Launchwright" under "Cloud" and tap the settings icon on its right. Tap "Environment variables" and change the line that starts with the name I send next, so everything after the equals sign is your new channel's name. Tap "Save changes".
   > **You'll see:** the dialog closes, and "Launchwright" is still in the list.
   Send the variable's name, LAUNCHWRIGHT_ALERT_CHANNEL, on a line of its own just before. The labels are from Claude Code's docs (sources.md, "The cloud environment"); if the screen shows others, ask for a screenshot rather than guess. Never ask to see the value. A session that's already running keeps the old value until it restarts, so the test in step 4 runs in a new thread.
2. **The app on the phone:**
   > **Where:** your phone's app store.
   > **Do:** install "ntfy". Open it, tap the plus button, type your channel's name exactly, and tap "Subscribe". Leave the server as it is. Allow notifications when it asks.
   > **You'll see:** your channel's name in ntfy's list.
3. **On an Android phone,** ntfy from Google Play can deliver alerts minutes or even hours late unless "instant delivery" is on, at the cost of some battery (sources.md, "ntfy on the phone"). Offer it:
   > On Android, alerts can come late unless you turn on instant delivery in ntfy. It uses a little more battery.
   > • Turn it on *(recommended: you hear about questions at once)*
   > • Leave it
   ntfy's docs don't say on which screen the switch is, so ask for a screenshot of ntfy and point to it there; never guess the label.
4. **Test it,** always from a thread in the project, never from the setup chat (lesson 19):
   ```
   node launchwright/scripts/alert.mjs fyi "Test: alerts reach your phone."
   ```
   > I just sent a test alert. Did it arrive?
   > • Yes *(recommended)*
   > • No
   On no, go to section 7.
5. **What each level feels like,** said once, after the test (sources.md, "ntfy on the phone"):
   > Questions that hold up your build come loud. Dates come as a normal alert. Good news comes quietly, so you may only see it when you open your notifications.

**Turning alerts off:** the user removes the channel in ntfy, or deletes the variable from the environment. The status page keeps working either way. Record that alerts are off in the project's notes, so later threads don't keep reporting a missing channel.

## 7. When alerts don't arrive

Check in this order, one step at a time with the user, and stop at the first that fixes it:

1. **The alert script's answer** in the thread that sent it (section 3). "couldn't reach ntfy.sh" means the site is missing:
   > **Where:** claude.ai/code in your browser, on the new-session screen.
   > **Do:** tap the environment button under the message box. Find "Launchwright" under "Cloud" and tap the settings icon on its right. Tap "Network access" and add ntfy.sh on a line of its own under "Allowed domains". Tap "Save changes".
   > **You'll see:** ntfy.sh in the list of allowed domains when you open it again.
2. **The channel's name** in ntfy matches the one in the environment exactly, capitals included. If unsure, make a new one (section 6, step 1).
3. **Notifications for ntfy** are allowed in the phone's settings.
4. **Android:** instant delivery (section 6, step 3).
5. **iPhone:** ntfy's own docs call its iPhone app basic and a little buggy (sources.md). If alerts still don't come, say so plainly, and that the status page always has the full picture.

## 8. What this skill never does

- Send alerts on a timer, or hold one for later delivery: ntfy didn't reliably withdraw held alerts when tested (lesson 26), so the quiet-build alert stays off and the page shows its own age (open point O3).
- Send a second alert for a question the ask command already alerted.
- Put keys, code, links, email addresses or the app's data in an alert, the page, or any status text.
- Commit the page, or edit the status files by hand: the status script is the only way state changes.
- Share the page, make it public, or change who can see it. The user can share it themselves.
- Read, print or ask for the alert channel's value, or any other environment value.
- Ask the user for anything here except what's theirs: installing ntfy, the environment's settings, and whether to turn alerts on.
