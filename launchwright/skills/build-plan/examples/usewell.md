# Dry run: the build plan for Usewell

A dry run of the build-plan skill on the walkthrough's sample app, done on Nov 18, 2026, straight after the question sweep's own dry run (`skills/question-sweep/examples/usewell.md`). The app and its recipe service are made up, as in the walkthrough. The user's time zone is Chicago, and the sweep ended on Wednesday evening, Nov 18. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

The plan file below was checked the way a real one would be: the kit's status script took it as the baseline, and the kit's status page showed its phases, finish and tasks (section 8 of this file).

## 1. What Claude read first (skill section 2)

- **The description:** version 1 is the use-first list, 15-minute recipes, adding food by typing or a receipt, and a reminder the evening before; money is free with Plus. Later: sharing with family, barcodes, weekly meal plans, the web. Runs on iPhone and Android.
- **The decisions:** sign in with Apple and Google; receipts read on the phone; Plus at $2.99 a month; the US only. "To review": the reminder's default time, the recipes' language.
- **The sweep's file:** seven entries, none "waiting". K-recipes (the recipe service's key) was skipped and holds up recipes. R-window: weekday evenings.
- **The rules list** (`skills/rules-check/examples/usewell.md`): R-google-testers ("Who acts: the plan"), R-expo-free ("Who acts: the plan"), and the rules that add work to the build: account deletion (sign-in), the subscription wording and Manage Plus, the privacy policy and its link in Settings, the camera permission message, the reminder permission.
- **The mockup:** nine screens (welcome, today, recipe, cooked, item, kitchen, add, remind, plus); the main flow is Today, then a recipe, then "I cooked it".
- **The kit's settings:** type expo; timeZone America/Chicago; reviewWindow `{"label": "Weekday evenings, 7 to 9 pm", "days": ["mon","tue","wed","thu","fri"], "from": "19:00", "to": "21:00"}`.
- **Measured figures:** none. It's this project's first build, so every time is an allowance.

## 2. Version 1 (skill section 3)

**In:** Today (use these first); 15-minute recipes from what you have; I cooked it; adding food by typing or by a receipt read on the phone; your kitchen and each item; the reminder the evening before; sign in with Apple and Google, with deleting your account (a store rule once people sign in); Plus at $2.99 a month through the stores; Settings with the privacy link and Manage Plus (store rules).

**Waits:** sharing with family, barcodes, weekly meal plans, the web version. Nothing was added that the description and decisions don't ask for.

It's small enough: 20 pieces, ready in under a week. No smaller version was proposed.

## 3. The pieces (skill section 4)

| Piece | What | Inputs | Waits for the user | Role, model | Hours |
| --- | --- | --- | --- | --- | --- |
| P1.1 | The app shell, the theme, navigation to all nine screens (foundation) | none | | builder, preset | 2 |
| P1.2 | The food kept on the phone, sorted by what to use first (foundation) | none | | builder, preset | 2 |
| P1.3 | Shared helpers: dates, US units, empty and error states (foundation) | P1.1 | | builder, preset | 1 |
| P1.R | Review of the foundations | P1.1 to P1.3 | | reviewer, preset | 1 |
| P2.1 | Today: use these first | P1.R | | builder, preset | 2 |
| P2.2 | Recipes from the recipe service, through the app's own server code, which holds the key | P1.R | K-recipes | builder, preset; needs a key | 3 |
| P2.3 | I cooked it | P2.1, P2.2 | | builder, preset | 1 |
| P2.4 | Adding food, by typing or a receipt read on the phone | P1.R | | builder, preset | 3 |
| P2.5 | Phone-flow tests for the main flow | P2.3, P2.4 | | builder, light, medium | 2 |
| P2.R | Review of the main flow | P2.1 to P2.5 | | reviewer, preset | 1.5 |
| P3.1 | Sign-in, and deleting your account | P1.R | | builder, preset | 3 |
| P3.2 | Your kitchen, and each item | P1.R | | builder, preset | 2 |
| P3.3 | The reminder the evening before | P1.R | | builder, preset | 1 |
| P3.4 | Plus, through the stores, with the wording the stores require | P3.1 | | builder, preset | 3 |
| P3.5 | Settings, and phone-flow tests for the rest | P3.1 to P3.4 | | builder, light, medium | 2 |
| P3.R | Review of the rest of version 1 | P3.1 to P3.5 | | reviewer, preset | 1.5 |
| P4.1 | Store answers to paste, and the privacy policy draft | P2.R, P3.R | | builder, preset | 2 |
| P4.2 | The tester plan and the invitation | P3.R | | builder, light, medium | 1 |
| P4.R | Review of the store answers, the privacy draft and the tester plan | P4.1, P4.2 | | reviewer, preset | 1 |
| P4.3 | The store-ready test versions, for the user's tap to send | P4.R | C2, U-privacy, U-store-entries | builder, preset | 1 |

- **Foundations first:** the three P1 pieces hold the shell, the data and every shared helper, so the parallel pieces after them never write their own (lesson 4).
- **No two side-by-side pieces share a file:** P3.4 changes the account code P3.1 makes, so it takes P3.1 as an input.
- **The recipe key is secret.** Spoonbase is made up; here it's treated as a service whose key is secret, so P2.2 includes the small server code that holds it (keys skill, section 3, row 2), and the key goes in two places: Usewell's keys environment for the build, and Expo for the server code. Until open point O1 is settled, the user also starts P2.2's session (keys skill, section 6), so P2.2 is laid out like a user task.
- **Every phase has its review,** P4 included: the store answers and the privacy draft are checked before the user is asked to approve them.
- **P3's pieces don't wait for checkpoint C1.** None of them builds on the main flow's feedback, so they run while recipes wait for the key.
- **The balanced preset** (`skills/build-relay/SKILL.md`, section 7) gives builders top at medium and reviewers top at high. The two test pieces and the tester plan name light at medium, as the preset allows for tests.

## 4. Workers and the layout (skill section 5)

**Workers: 3,** the default: no earlier build here waited at a usage limit, and the user hasn't said their Claude plan is Pro. Decided under the go-ahead rule and listed under "To review".

The pieces laid out from approval (Wed Nov 18, 9 pm), each allowance plus a quarter, three at a time, in Chicago time:

| When | What runs |
| --- | --- |
| Wed 9 pm to Thu 2 am | P1.1 and P1.2, then P1.3, then the review P1.R |
| Thu 2 am to 2 pm | P2.1, P2.4 and P3.1; then P3.2, P3.3, P3.4; then P3.5 and the review P3.R |
| Thu 2 pm to 3 pm | P4.2 (the tester plan) |
| Thu 3 pm to 7:30 pm | Nothing can run: recipes wait for the key, and everything else waits for recipes or is done |
| Thu 7 pm | The user adds the recipe key in its two places and starts the recipes session (U-recipes-key), and runs the first test builds on their computer (U-first-build) |
| Thu 7:30 pm to Fri 5 am | P2.2 (recipes), P2.3, P2.5, then the review P2.R |
| Fri 5 am to 9 am | P4.1 (store answers and the privacy draft), then the review P4.R |
| **Fri Nov 20, 7 to 9 pm** | **Checkpoint C1:** the main flow on the phone. Its fixes run that night |
| **Mon Nov 23, 7 to 9 pm** | **Checkpoint C2:** all of version 1. The user approves the privacy policy and makes the store entries |
| Mon night | C2's fixes (the one night the skill allows) |
| Tue Nov 24, early | P4.3: the store-ready test versions. **The finish** |

- **C1** could have gone in Friday morning's slot by its two-hour allowance, but the window is weekday evenings, so it's Friday at 7 pm.
- **C2's work was ready on Friday too,** but one checkpoint goes in each slot and C2 comes in a later one, so C1's fixes land first. The weekend isn't in the window, so it's Monday.
- **The phases,** back to back, each ending at its checkpoint: P1 Foundations Nov 18 to 19; P2 The main flow Nov 19 to 20; P3 The rest of version 1 Nov 20 to 23; P4 Store-ready Nov 23 to 24. The finish: Tue Nov 24.

**The time estimate:** about two nights of building (Wednesday and Thursday), plus one night of fixes after each check. Ready Tue Nov 24, with two evening checks.

**The usage estimate:** 36 hours of allowances, plus a quarter: about 45 thread-hours. By model: about 33 on the top model at medium, 6 at high (the reviews), 6 on the light model. There's no measured figure yet and a thread can't read the plan's meter, so the user is told the hours, and the first checkpoint asks for the optional Usage screenshot (`skills/build-relay/SKILL.md`, section 8).

**Expo's builds:** 6 per platform this month: U-first-build, C1 and a spare, C2 and a spare, and the store-ready step. R-expo-free says 15 a month per platform, so it fits, and the plan says so.

## 5. The user's tasks (skill section 6)

| Task | Do by | Minutes | Needed for | How the date was worked back |
| --- | --- | --- | --- | --- |
| U-recipes-key: add the recipe key in its two places, and start the recipes session (closedBy K-recipes) | Thu Nov 19 | 10 | recipes | Recipes could start Thu 2 am; no window before that, so the first window, Thursday, and recipes move after it |
| U-first-build: the first test builds, from the computer | Thu Nov 19 | 20 | your first try on the phone | C1's test build is due Fri 5 am; Thursday's window is the last before it |
| U-privacy: approve the privacy policy | Mon Nov 23 | 10 | the store-ready versions | Drafted Fri morning; needed Tue early; Monday's window is the last before |
| U-store-entries: make the store entries, pasting the answers | Mon Nov 23 | 30 | the store-ready versions | The same |
| U-testers: find 12 Android testers and send the invitation | Tue Nov 24 | 30 | launching on Google Play | The closed test version is ready Tue Nov 24. 14 days takes it to Dec 8, and Google's review of up to 7 days to about Dec 15, the earliest Play launch |

Monday evening holds the check and 40 minutes of tasks, under the two hours the skill allows; Thursday holds 30 minutes. Alerts for these are the status page's job.

## 6. The conversation

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

Show my tasks

> Your 5 tasks:
> • Thu Nov 19 · add the recipe key, and start its part of the build · 10 min
> • Thu Nov 19 · first test builds on your computer · 20 min
> • Mon Nov 23 · approve the privacy policy · 10 min
> • Mon Nov 23 · make the store entries · 30 min
> • Tue Nov 24 · send your 12 testers the invitation · 30 min. Start asking people now: Google Play can launch about Dec 15
>
> • Approve the plan *(recommended)*
> • Change something

Approve the plan

> Approved. Ready Tue Nov 24. I'm starting now.

Then the build relay took over: it records phase P1 and the mode "running", and starts P1.1 and P1.2.

## 7. What was saved (skill sections 9 and 10)

- **The plan's notes** (the project's plan.md), under the kit's headings: version 1 and what waits (section 2 above), the phases and pieces (section 3), workers: 3 and why, time and usage with the basis "allowances; first build in this project", the two checkpoints, the five tasks, and "Changes to the baseline: none yet".
- **The decisions,** under "Decided by the user": "Plan approved, Nov 18, 2026: ready Tue Nov 24, checks Fri Nov 20 and Mon Nov 23". Under "To review": workers 3; the allowances; P3 running before checkpoint C1.
- **The baseline:** the kit's status script's rebaseline command with the plan file, which wrote status/baseline.json.
- **The plan's data** (the project's plan.json):

```json
{
  "project": "Usewell",
  "approved": "2026-11-18",
  "workers": 3,
  "preset": "balanced",
  "version1": {
    "includes": ["Today: use these first", "15-minute recipes from what you have", "I cooked it", "Add food by typing or by scanning a receipt on the phone", "Your kitchen and each item", "A reminder the evening before", "Sign in with Apple and Google, and deleting your account", "Plus, $2.99 a month, through the stores"],
    "waits": ["Sharing with family", "Barcodes", "Weekly meal plans", "The web version"]
  },
  "estimate": {
    "buildHours": 45,
    "byModel": { "top, medium": 33, "top, high": 6, "light, medium": 6 },
    "basis": "Allowances (small 1, medium 2, large 3 thread-hours; reviews 1 to 1.5), plus a quarter for fix tries: 36 hours of allowances. No measured figures yet: first build in this project.",
    "expoBuilds": { "ios": 6, "android": 6, "freePerMonth": 15 }
  },
  "baseline": {
    "finish": "2026-11-24",
    "phases": [
      { "id": "P1", "name": "Foundations", "start": "2026-11-18", "end": "2026-11-19" },
      { "id": "P2", "name": "The main flow", "start": "2026-11-19", "end": "2026-11-20" },
      { "id": "P3", "name": "The rest of version 1", "start": "2026-11-20", "end": "2026-11-23" },
      { "id": "P4", "name": "Store-ready", "start": "2026-11-23", "end": "2026-11-24" }
    ]
  },
  "pieces": [
    { "id": "P1.1", "title": "The app shell from the Expo starter, the design guide's theme, and navigation to all nine screens", "phase": "P1", "role": "builder", "inputs": [], "files": ["app/"], "doneWhen": "The starter's checks pass; every screen opens from the navigation in the web build at phone size", "reviewedBy": "P1.R", "needsUser": [], "needsKey": false, "foundation": true, "hours": 2 },
    { "id": "P1.2", "title": "The food the app keeps on the phone, sorted by what to use first", "phase": "P1", "role": "builder", "inputs": [], "files": ["app/data/"], "doneWhen": "Its tests pass: adding, using up and the use-first order", "reviewedBy": "P1.R", "needsUser": [], "needsKey": false, "foundation": true, "hours": 2 },
    { "id": "P1.3", "title": "Shared helpers: dates, US units, empty and error states", "phase": "P1", "role": "builder", "inputs": ["P1.1"], "files": ["app/shared/"], "doneWhen": "Its tests pass", "reviewedBy": "P1.R", "needsUser": [], "needsKey": false, "foundation": true, "hours": 1 },
    { "id": "P1.R", "title": "Review of the foundations", "phase": "P1", "role": "reviewer", "inputs": ["P1.1", "P1.2", "P1.3"], "files": ["app/"], "doneWhen": "Findings fixed or listed", "reviewedBy": null, "needsUser": [], "needsKey": false, "foundation": false, "hours": 1 },
    { "id": "P2.1", "title": "Today: use these first", "phase": "P2", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/today/"], "doneWhen": "Its tests pass; the screen matches the mockup at phone size", "reviewedBy": "P2.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 2 },
    { "id": "P2.2", "title": "Recipes from the recipe service: 15 minutes or less, from what you have, through the app's own server code, which holds the key", "phase": "P2", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/recipe/", "app/services/recipes/", "app/api/recipes/"], "doneWhen": "Its tests pass, with the service's real answers for three foods", "reviewedBy": "P2.R", "needsUser": ["K-recipes"], "needsKey": true, "foundation": false, "hours": 3 },
    { "id": "P2.3", "title": "I cooked it: using food up", "phase": "P2", "role": "builder", "inputs": ["P2.1", "P2.2"], "files": ["app/screens/cooked/"], "doneWhen": "Its tests pass; Today updates after cooking", "reviewedBy": "P2.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 1 },
    { "id": "P2.4", "title": "Adding food, by typing or by scanning a receipt on the phone", "phase": "P2", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/add/", "app/services/receipts/"], "doneWhen": "Its tests pass, with three sample receipts", "reviewedBy": "P2.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 3 },
    { "id": "P2.5", "title": "Phone-flow tests for the main flow", "phase": "P2", "role": "builder", "model": "light", "effort": "medium", "inputs": ["P2.3", "P2.4"], "files": ["app/flows/main/"], "doneWhen": "The flow tests pass on the web build at phone size", "reviewedBy": "P2.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 2 },
    { "id": "P2.R", "title": "Review of the main flow", "phase": "P2", "role": "reviewer", "inputs": ["P2.1", "P2.2", "P2.3", "P2.4", "P2.5"], "files": ["app/"], "doneWhen": "Findings fixed or listed", "reviewedBy": null, "needsUser": [], "needsKey": false, "foundation": false, "hours": 1.5 },
    { "id": "P3.1", "title": "Sign in with Apple and Google, and deleting your account in Settings", "phase": "P3", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/welcome/", "app/services/account/"], "doneWhen": "Its tests pass; deleting an account removes its data", "reviewedBy": "P3.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 3 },
    { "id": "P3.2", "title": "Your kitchen, and each item", "phase": "P3", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/kitchen/", "app/screens/item/"], "doneWhen": "Its tests pass; both screens match the mockup", "reviewedBy": "P3.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 2 },
    { "id": "P3.3", "title": "The reminder the evening before", "phase": "P3", "role": "builder", "inputs": ["P1.R"], "files": ["app/screens/remind/", "app/services/reminders/"], "doneWhen": "Its tests pass; the phone asks permission the first time only", "reviewedBy": "P3.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 1 },
    { "id": "P3.4", "title": "Plus, $2.99 a month through the stores, with the wording the stores require and Manage Plus", "phase": "P3", "role": "builder", "inputs": ["P3.1"], "files": ["app/screens/plus/", "app/services/purchases/"], "doneWhen": "Its tests pass; the Plus screen shows price, renewal and cancelling as the rules list says", "reviewedBy": "P3.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 3 },
    { "id": "P3.5", "title": "Settings with the privacy link, and phone-flow tests for the rest", "phase": "P3", "role": "builder", "model": "light", "effort": "medium", "inputs": ["P3.1", "P3.2", "P3.3", "P3.4"], "files": ["app/screens/settings/", "app/flows/rest/"], "doneWhen": "The flow tests pass on the web build at phone size", "reviewedBy": "P3.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 2 },
    { "id": "P3.R", "title": "Review of the rest of version 1", "phase": "P3", "role": "reviewer", "inputs": ["P3.1", "P3.2", "P3.3", "P3.4", "P3.5"], "files": ["app/"], "doneWhen": "Findings fixed or listed", "reviewedBy": null, "needsUser": [], "needsKey": false, "foundation": false, "hours": 1.5 },
    { "id": "P4.1", "title": "Store answers ready to paste, and the privacy policy draft", "phase": "P4", "role": "builder", "inputs": ["P2.R", "P3.R"], "files": ["project/store/"], "doneWhen": "Every store answer and the privacy draft exist, each checked against the rules list", "reviewedBy": "P4.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 2 },
    { "id": "P4.2", "title": "The tester plan and the invitation for the user to send", "phase": "P4", "role": "builder", "model": "light", "effort": "medium", "inputs": ["P3.R"], "files": ["project/store/testers.md"], "doneWhen": "The plan has its dates; the invitation is drafted", "reviewedBy": "P4.R", "needsUser": [], "needsKey": false, "foundation": false, "hours": 1 },
    { "id": "P4.R", "title": "Review of the store answers, the privacy draft and the tester plan", "phase": "P4", "role": "reviewer", "inputs": ["P4.1", "P4.2"], "files": ["project/store/"], "doneWhen": "Findings fixed or listed; every answer matches the app and the rules list", "reviewedBy": null, "needsUser": [], "needsKey": false, "foundation": false, "hours": 1 },
    { "id": "P4.3", "title": "The store-ready test versions, ready for the user's tap to send to the stores' test tracks", "phase": "P4", "role": "builder", "inputs": ["P4.R"], "files": ["app/app.json", "app/eas.json"], "doneWhen": "Both test versions build on Expo; nothing is sent to a store", "reviewedBy": null, "needsUser": ["C2", "U-privacy", "U-store-entries"], "needsKey": false, "foundation": false, "hours": 1 }
  ],
  "checkpoints": [
    { "id": "C1", "phase": "P2", "after": ["P2.R"], "needsUser": ["U-first-build"], "date": "2026-11-20", "from": "19:00", "to": "21:00", "try": ["Open Today and see what to use first", "Open a recipe and cook it", "Add food by typing, then by a receipt"] },
    { "id": "C2", "phase": "P3", "after": ["P3.R"], "needsUser": [], "date": "2026-11-23", "from": "19:00", "to": "21:00", "try": ["Sign in with Apple or Google", "Look through your kitchen and set the reminder", "Open Plus and Settings"] }
  ],
  "userTasks": [
    { "id": "U-recipes-key", "text": "Add the recipe service's key to Usewell's keys environment and to Expo, then start the recipes part of the build", "doBy": "2026-11-19", "minutes": 10, "neededFor": "recipes", "needed": { "phase": "P2", "at": "start" }, "closedBy": "K-recipes" },
    { "id": "U-first-build", "text": "Run Usewell's first test builds on your computer: I open the window, you answer Expo's questions", "doBy": "2026-11-19", "minutes": 20, "neededFor": "your first try on the phone, Fri Nov 20", "needed": { "phase": "P2", "at": "end" }, "closedBy": null },
    { "id": "U-privacy", "text": "Read and approve Usewell's privacy policy", "doBy": "2026-11-23", "minutes": 10, "neededFor": "the store-ready versions", "needed": { "phase": "P4", "at": "start" }, "closedBy": null },
    { "id": "U-store-entries", "text": "Make Usewell's entries on Apple's and Google's store websites, pasting the answers I prepared", "doBy": "2026-11-23", "minutes": 30, "neededFor": "the store-ready versions", "needed": { "phase": "P4", "at": "start" }, "closedBy": null },
    { "id": "U-testers", "text": "Find 12 people with Android phones to test Usewell for 14 days, and send them the invitation I drafted", "doBy": "2026-11-24", "minutes": 30, "neededFor": "launching on Google Play, earliest about Dec 15", "needed": { "phase": "P4", "at": "end" }, "closedBy": null }
  ]
}
```

## 8. Checked against the skill

- **The status script took the plan:** in a copy of the kit's project template with this plan.json and these settings, `node scripts/status.mjs rebaseline project/plan.json --no-push --root <copy>` wrote status/baseline.json, and `node scripts/render-status.mjs --root <copy>` showed "Planned Nov 24 · On plan", the four phases with their dates, and the five tasks under "Coming up for you" with their do-by days, minutes and what each is needed for.
- **Every id resolves:** each piece's inputs, reviewedBy and needsUser, and each checkpoint's after and needsUser, name a piece, a checkpoint, a user task, or an id in the sweep's file (K-recipes). U-recipes-key is closedBy K-recipes, so the page counts it done when that answer is recorded (lesson 30).
- **Every field the relay reads** (`skills/build-relay/brief.md`) is on every piece; workers and preset are at the top.
- **Phases are back to back,** each ending at its checkpoint, and the finish is the last phase's end.
- **The checkpoints are in the review window,** weekday evenings 7 to 9 pm, one per slot, C2 in a later slot than C1.
- **Only the recipe work waited** on the skipped key; P3's pieces kept going.
- **The estimate says what it rests on:** allowances, no measured figures, and the meter checked at the first look. Expo's builds fit the free plan's 15 per platform.
- **Nothing that's the user's was planned as Claude's:** the store entries, the privacy policy, sending to the stores and inviting testers are the user's tasks or taps.
- **The plan message** fits one phone screen: six lines and three options, the recommended one first.
