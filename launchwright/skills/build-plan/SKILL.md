---
name: build-plan
description: Makes a Launchwright project's build plan after the question sweep, and saves the approved plan as the baseline. Use when the sweep is done, when the user asks to see or change the plan, or when a stop agrees a change to it. Covers a small version 1, phases on shared foundations, pieces with what each needs first, workers sized to the user's usage, the time and usage estimate, checkpoints booked into the review window, the user's own tasks with do-by dates, and the baseline.
---

# The build plan

After the question sweep, the plan says what version 1 is, how the build runs, how long it takes, roughly how much of the user's Claude plan it uses, when the user checks it, and what they do themselves and by when. The user approves it with one tap, and it becomes the baseline the status page measures against (spec section 6, screen 12; brief F9 and F18; lessons 4, 13 and 16).

Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message. Every line the user sees is written below as a quoted line; adapt the words, keep the shape.

A worked example, a dry run on the walkthrough's sample app, is `examples/usewell.md` in this skill's folder. In a project, this skill lives in the kit at launchwright/skills/build-plan/SKILL.md; run the status script from the repo's top folder, as the kit's AGENTS.md shows.

## 1. When it opens

- **The sweep is done,** or the user taps "Show me the plan" after it. If the sweep has questions still "waiting" (not answered, not skipped), go back to the question-sweep skill (`skills/question-sweep/SKILL.md`) first.
- **The user asks to see or change the plan.** Before approval, change it freely. After approval, the pieces can change (the build relay does that to fix problems), but the dates, the scope and the checkpoints change only at a stop, with the user's OK (section 9).
- **Not during the build** to make a new plan from scratch. The build relay (`skills/build-relay/SKILL.md`) runs the approved one.

## 2. Read first, and say nothing yet

- **The confirmed description:** "Version 1 does", "Later", where it runs, money, outside services.
- **The project's decisions,** both "Decided by the user" and "To review". A decision can add or remove work (sign-in, receipts read on the phone).
- **The sweep's file** (the project's questions file): each id (Q-, A-, K-, R-window), its answer, and what it holds up. Skipped ones matter most: the work they hold up waits (section 6).
- **The rules list:** every rule whose "Who acts" names the plan, and every rule that adds work to the build. Google's tester rule and Expo's free plan usually do (`skills/rules-check/SKILL.md`).
- **The design guide and the mockup's screens,** for the screens to build and the main flow.
- **The kit's settings:** the project's type, timeZone, and reviewWindow, an object `{label, days, from, to}` with three-letter days and 24-hour times (from and to null mean any time).
- **The guard's settings:** workingBranch. If it's null, the plan can still be made, but say at the end that the build needs one (the relay asks).
- **What earlier builds measured,** if any: the project's lessons file under "Usage by model", and finished pieces in status/ (each has its model, effort, start and finish). In a project's first build there are none; say so in the estimate's basis.

Never guess a fact. A date, a rule, a price or a limit comes from these files or a page read today.

## 3. Version 1: small on purpose

- **In version 1:** the description's "Version 1 does", plus what the user's decisions add (for example sign-in), plus what the rules list makes the build do (for example account deletion when there's sign-in).
- **Waits:** the description's "Later", and anything the user didn't ask for. Never add a feature on your own.
- **If it's still big** (the finish is more than about a week of building away, or there are more than about 25 pieces), propose a smaller version 1 under "Change something": the main flow plus what the stores require, the rest in a version 1.1 right after. What version 1 does is the user's call, so propose, never cut on your own.

## 4. Phases, pieces and foundations

**Phases are stretches between checkpoints,** back to back: each ends at its checkpoint (or the finish), the next starts that day. A piece belongs to one phase, but it may start early when its inputs are done; the build never idles waiting for a phase date. The usual phases of a new app:

| Phase | What's in it | Ends with |
| --- | --- | --- |
| P1 · Foundations | The app shell, from the starter the kit put in the app folder (a phone app's, or the web one for a web-only app; spec section 2.5), the design guide's theme, navigation to every screen, the data the app keeps, and the shared helpers | Its review |
| P2 · The main flow | The mockup's main flow (opening the app and doing its main thing), its phone-flow tests | Checkpoint C1 |
| P3 · The rest of version 1 | Every other screen and feature, sign-in, the paid plan, settings, their phone-flow tests | Checkpoint C2 |
| P4 · Store-ready | The store answers and privacy draft, the tester plan, the store-ready test versions | The finish |

A web app has the same phases. An existing app uses its own kind of plan (spec screen E7, `skills/existing-app/SKILL.md`).

**Pieces.** One piece is what one thread can make and check in one sitting: a screen or two, one feature, or one shared part, with its own tests. For each:
- **foundation: true** for the shell, the theme, the data and the shared helpers. They come first, in their own pieces, so parallel pieces never each write the same helper (lesson 4).
- **inputs:** only what it truly needs first. Two pieces that would change the same file never run side by side: one takes the other as an input.
- **files:** the folders or files it may touch, so pieces don't collide.
- **doneWhen:** checks a thread can run: its tests pass, the phone-flow test for its screens passes, the web build shows the screen at phone size.
- **A review piece per phase** (role reviewer), whose inputs are that phase's pieces; each reviewed piece names it in reviewedBy.
- **needsUser:** the ids of what it waits for from the user: a skipped question (Q-, A-, K-), a user task (U-, section 6) or a checkpoint (C1, C2) whose feedback it builds on. Pieces that don't need the checkpoint's feedback don't list it, so they keep going.
- **needsKey: true** when a step uses a key. The keys skill says where the key goes and how that step runs (`skills/keys/SKILL.md`, sections 3 and 6). Plan for both:
  - **Where the key goes** (keys skill, section 3). A key the app itself uses, if the service calls it secret, needs server code that holds it: put that in the feature's piece or a piece of its own, never the key inside the app. The user's task for the key names every place it goes (the app's keys environment for the build, Expo for the app's server code) and starting the key piece's session, with minutes for each.
  - **Who starts it.** Until open point O1 is settled, a key piece runs in a session the user starts from the phone (keys skill, section 6), so lay it out like a user task (section 5, step 2).
  - **Who puts server code live.** Server code that holds a key runs on Expo Hosting, and putting it there needs Expo's tool signed in, which a cloud thread never has; the starters have no workflow for it yet (spec, open point O13). So a phone app with server code gets a user task, U-server, after the piece that makes the code: Claude opens a window on the user's computer, and the user types the line Claude sends, as for U-first-build. Say so in the plan; never plan it as a thread's step.
- **role, model and effort** from the build relay's preset table (`skills/build-relay/SKILL.md`, section 7): leave model and effort out to take the preset's, and name them only where a piece needs more.
- **hours:** the piece's allowance (section 5).

**Every new app's first test builds run once from the user's computer.** Right after them, in the same sitting, the user links the app's home to Expo's GitHub app and sets Expo's base directory to the app folder (`skills/name-and-home/SKILL.md`, section 8). Expo can start builds from GitHub only after the app has had one successful build from a computer, which also makes Apple's signing credentials (`skills/setup-assistant/sources.md`, "Expo and GitHub (step 3)", the per-app finding). So every new app's plan has the user task U-first-build (section 6), and checkpoint C1 needs it. Setup already left Expo's tool signed in on their computer for this.

## 5. Workers and the estimate

**Workers** (how many pieces run at once), written as workers in the plan:
- **3** by default, the relay's default and the most a Project should run for one build.
- **2** if an earlier build here waited at usage limits for more than about two hours a day, or the user has said their Claude plan is Pro and this is their first build.
- Never more than the pieces that can really run side by side.
- The relay lowers it during the build with the user's yes (`skills/build-relay/SKILL.md`, section 3). Choosing it here is under the go-ahead rule; say it in the plan.

**Each piece's time allowance,** in thread-hours:
- With no measured figures: small 1, medium 2, large 3; a review 1 to 1.5. Then add a quarter for fix tries.
- With measured figures (finished pieces in status/, from start to finish, minus any wait at a usage limit their reports note): use the average for that role and model instead, plus a quarter.

**Lay the pieces out in time,** starting when the plan is approved:
1. Foundations first. Then, whenever fewer than the workers are running, start the next piece in plan order whose inputs are done, and which isn't waiting on the user.
2. A piece waiting on a user task or a skipped question starts no earlier than that task's planned time: the start of the review window on its do-by date (section 6). A key piece the user starts (section 4) starts no earlier than the next review window after its inputs are done, or the key task's window if that's later.
3. A checkpoint is booked into the first review-window slot that starts at least two hours after its last piece ends (Expo's free plan builds in a low-priority queue; two hours is an allowance, not a promise). One checkpoint per slot, and a later checkpoint goes in a later slot than the one before, so the fixes from the first come first.
4. After the last checkpoint, allow one night for its fixes before the store-ready step.
5. The builds run day and night, in the cloud. Only the user's parts keep to the review window.

From the layout:
- **Each phase's start and end dates,** and the **finish date:** the store-ready test versions. All in the user's time zone.
- **The time estimate** in plain words: how long the building takes, and when it's ready with the user's checks ("about 2 nights of building; ready Tue Nov 24, with your two checks").
- **The usage estimate:** the thread-hours, by model and effort. A thread can't read the user's plan meter (`skills/build-relay/sources.md`, "What usage a build can see"), so:
  - with no measured figures, say the hours and that it's checked with the user at the first checkpoint: "about 45 hours of building, mostly on the top model. I can't see your plan's meter yet, so I'll check it with you at the first look";
  - with a Usage screenshot from an earlier checkpoint (the relay's section 8), turn hours into a share of their plan: "about a third of your weekly limit", with the date of the figures it's based on.
- **Expo's builds:** count the test builds per platform (one per checkpoint and for the store-ready step, plus one spare per checkpoint, plus U-first-build), and the store builds: one per platform from the user's computer (U-store-credentials), then one per platform each time a version is sent to the stores. If the rules list has Expo's free plan (15 per platform a month, then a wait until the next month), keep within it and say so. Going past it is a money question for the user, never planned in silently.

Write the basis next to the estimate in the plan file: allowances or measured, which figures, which dates.

## 6. The user's tasks, worked back

Everything the user does themselves gets a task with a do-by date, worked back from when the build needs it (lesson 13). Usual ones:
- **U-first-build:** the app's first test builds, from their computer, with Claude opening the window (section 4). Needed for C1.
- **One task per skipped sweep question** that the build needs, with closedBy set to the question's id, so the page counts it done when the answer is recorded (lesson 30). For example U-recipes-key, closedBy K-recipes.
- **The store entries** on Apple's and Google's websites, with every answer prepared to paste (brief F12). A computer step: clumsy on a phone.
- **Approving the privacy policy** and any other legal text Claude drafts (U-privacy). Both stores need the policy at a public link; where that page lives is still open (spec, open point O12), so the task says the link is part of it, and launch preparation asks.
- **U-store-credentials:** the first store versions and Apple's upload key, from their computer, with Claude opening the window (`skills/launch-prep/SKILL.md`, section 2a). About 20 minutes. Needed for the store-ready step.
- **U-google-key:** Google's upload key, made on Google's website and uploaded to Expo's website, on a computer (`skills/launch-prep/SKILL.md`, section 2b). Needed for the first Android store version.
- **U-server,** only for a phone app with server code that holds a key (section 4).
- **Google's 12 testers,** when the rules list has Google's tester rule: 12 people opted in for 14 days in a row, then a review of usually 7 days or less. The task's do-by is the day the first closed test version is ready, and the plan says the earliest Play launch: that day plus 14 days, plus up to 7. Claude drafts the invitation; the user finds the testers and sends it.

Each task, as the status page reads it: `{id, text, doBy, minutes, neededFor, needed, closedBy}`. id is U- and a word; text is plain words ("Add the recipe key"); neededFor names what waits in the user's words, never a piece id; minutes is honest.

**needed** ties the task to the moment the build needs it: `{ "phase": "<phase id>", "at": "start" | "end" }`, the start or the end of one of the plan's phases. Builds often run ahead of plan, so the status page shows "Needed at the start of <phase>" with the planned do-by and an updated day that keeps the same distance from that moment as the phases move. Set it for every task: a task needed for a checkpoint is needed at the end of the checkpoint's phase; a task a phase's first pieces wait on is needed at its start.

**The do-by date:** the last review-window day that leaves the task's minutes plus an hour before the build needs it. If even the first window is too late, the do-by is the first window's day and the pieces that need it move after it (section 5, step 2). With "any time" as the window, use 9 am on the day before. Never set two hours of tasks on one evening if they can be spread; if they can't, say so.

Alerts for these tasks are the status page's job (`skills/status-page/SKILL.md`); this skill only writes them.

## 7. Checkpoints

One per phase that ends with one, as `{id, phase, after, needsUser, date, from, to, try}`:
- **date, from, to:** the booked slot, in the user's time zone, from the review window.
- **after:** the pieces whose work it shows. **needsUser:** for C1, U-first-build.
- **try:** the three or four things the user tries, in their words ("open Today and cook the first recipe").

The checkpoint skill (`skills/checkpoint/SKILL.md`) runs each one: the test version on the phone or a web link, the phone-flow tests, the screenshot design review and the retrospective.

## 8. Showing the plan (screen 12)

Save the plan first (section 10, without "approved"), then one message, on one phone screen:

> Here's Usewell's plan.
> • In version 1: use-first list, 15-minute recipes, adding food, the evening reminder, sign-in, Plus
> • Later: family sharing, barcodes, meal plans, the web
> • Ready Tue Nov 24: about 2 nights of building
> • Your checks: Fri Nov 20 and Mon Nov 23, 7 pm
> • About 45 hours of building, mostly on the top model
> • 5 small tasks for you, the first two Thursday evening
>
> • Approve the plan *(recommended)*
> • Change something
> • Show my tasks

- **"Show my tasks":** each task on a line with its do-by day and minutes, then the same three options without this one.
- **"Change something":** ask what, in one question with likely options ("Fewer features in version 1", "Different check times", "Something else"). Change the plan, lay it out again (section 5) and show it again. A change to what version 1 does, a date or a check time is the user's; the pieces, the workers and the order are yours.
- **Money:** if the plan goes past a free limit (section 5), that's its own question before approval, with the free way first.

## 9. Approval, and the baseline

When the user taps "Approve the plan":
1. Write the approved date (YYYY-MM-DD, the user's time zone) in the plan file, and the plan's own words.
2. Save the baseline with the kit's status script: its rebaseline command, given the project's plan file. It refuses a plan without phases that each have an id, a name, a start and an end date; fix the plan, never the script.
3. Under "Decided by the user" in the project's decisions: "Plan approved", the date, the finish, the checks. What you chose yourself (workers, the order, the allowances) goes under "To review".
4. Commit and push to the working branch, as the project's AGENTS.md says.
5. Say one line, then hand over to the build relay, which records the first phase and the mode and starts the first pieces:
   > Approved. Ready Tue Nov 24. I'm starting now.

**Changing the baseline later.** Only at a stop (a checkpoint, or a question that's the user's), and only with their OK:
> The recipe key came 2 days late, so the finish moves from Tue Nov 24 to Thu Nov 26.
> • OK, new date *(recommended)*
> • Leave something out instead
Then change the plan, run rebaseline again (it keeps the old baseline in its history), and add a line under "Changes to the baseline" in the plan's notes: what changed, the stop, the date.

## 10. What the plan files hold

**The plan's notes** (the project's plan.md) keep the kit's headings: Version 1, Phases and pieces, Workers, Time and usage (with the basis), Checkpoints, The user's tasks, Changes to the baseline. Plain words; the user may read it.

**The plan's data** (the project's plan.json), read by the status script, the status page and the build relay (`skills/build-relay/brief.md` lists the per-piece fields it reads):

```json
{
  "project": "Usewell",
  "approved": null,
  "workers": 3,
  "preset": "balanced",
  "version1": { "includes": ["…"], "waits": ["…"] },
  "estimate": { "buildHours": 45, "byModel": { "top, medium": 33, "top, high": 6, "light, medium": 6 }, "basis": "…", "expoBuilds": { "ios": 6, "android": 6 } },
  "baseline": { "finish": "2026-11-24", "phases": [ { "id": "P1", "name": "Foundations", "start": "2026-11-18", "end": "2026-11-19" } ] },
  "pieces": [ { "id": "P1.1", "title": "…", "phase": "P1", "role": "builder", "inputs": [], "files": ["app/"], "doneWhen": "…", "reviewedBy": "P1.R", "needsUser": [], "needsKey": false, "foundation": true, "hours": 2 } ],
  "checkpoints": [ { "id": "C1", "phase": "P2", "after": ["P2.R"], "needsUser": ["U-first-build"], "date": "2026-11-20", "from": "19:00", "to": "21:00", "try": ["…"] } ],
  "userTasks": [ { "id": "U-first-build", "text": "…", "doBy": "2026-11-19", "minutes": 20, "neededFor": "…", "needed": { "phase": "P1", "at": "end" }, "closedBy": null } ]
}
```

- Ids match the status script's: letters, digits, dot, dash or underscore, up to 41 characters. Dates are YYYY-MM-DD.
- Every id in inputs, reviewedBy, needsUser and after exists in the plan or the sweep's file. Check this before showing the plan; a missing id is the plan's mistake.
- model and effort appear on a piece only when it overrides the preset.

## 11. What the plan never does

- Add a feature the description and decisions don't ask for, or drop one without the user's yes.
- Plan a step that's the user's as if Claude did it: paying, store submissions, production keys, deploying to production, messages to real people, legal or privacy text, installing software. It plans the preparation, and the user's tap, as a task.
- Promise a date or a share of the user's plan it can't support. Allowances are called allowances.
- Ask the user about the workers, the order of the pieces or the allowances. Those are decided and listed under "To review".
