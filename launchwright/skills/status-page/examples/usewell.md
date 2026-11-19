# Dry run: the status page and alerts for Usewell

A dry run of the status-page skill on the walkthrough's sample app, done on Nov 18, 2026, with the plan from the build-plan skill's own dry run (`skills/build-plan/examples/usewell.md`). The app is made up, as in the walkthrough. The user's time zone is Chicago. Lines starting with `>` are what Claude shows the user.

## 1. The sample project

A scratch folder, set up with the kit as a new Expo app named Usewell (time zone America/Chicago, weekday evenings 7 to 9 pm), with the build plan's plan file. Every record below went through the kit's status script, with nothing pushed (it was a scratch folder):

1. rebaseline with the plan; mode running, "Plan approved; build started"; phase P1.
2. P1.1 started and finished; P1.2 started.
3. A blocking question, Q-receipts: "Should a receipt's photo be kept after the food is read from it?", holding up "adding food by receipt". (In a real build the ask command alerts the phone by itself.)
4. **A task that turned up mid-build** (skill section 4), U-photos: "Take three photos of your own fridge for the store pictures", do by Nov 21, holding up "the store pictures". It was recorded with the ask command at the do-by level, because the baseline doesn't have it.

## 2. Rebuild and publish (skill section 2)

- The page script wrote the page to the session's scratch folder, outside the repo, and said it shows "Waiting on you".
- **First publish:** from the file, icon chart, titled "Usewell · build status (sample)" because it was a sample (a real project uses "Usewell: status"). It came back private to the owner, at https://claude.ai/artifact/K5Wjhycz4y1V1ufEk5uMoJ. The link was recorded with the page-link command.
- **After the next change** (P1.2 finished, P1.3 "Adding food by typing" started), the page was rebuilt, the live version read with the link, and the page republished over it. The link stayed the same, and the live version was the new one (102 lines, the same as the rebuilt file).

## 3. What the page shows, at 390 × 844

Checked from a screenshot of the published file at phone width; nothing runs wider than the screen. Top to bottom:

1. **Waiting on you:** "The build needs an answer from you."
2. **Last reported in:** just now, with the note that the phone gets no alert when the build goes quiet, so the page works out its own age.
3. **Expected finish:** Nov 24, on plan; the planned date moves only when the user agrees.
4. **Waiting on you now:** the receipt question ("The build waits for this", holds up adding food by receipt), then the mid-build task U-photos ("Do by Nov 21", holds up the store pictures). So a task added mid-build shows at once, without a new baseline.
5. **Coming up for you:** the plan's five tasks with their do-by days, minutes and what each is needed for; the two due Nov 19 marked soon.
6. **The phases:** Foundations running since Nov 18, should end Nov 19; the other three not started.
7. **Where the time went:** building, waiting on you, paused and stuck, since Nov 18.

## 4. The alerts (skill sections 3 and 4)

Shown with the alert script's dry run, so nothing reached a phone:

| Moment | Level | Title · body |
| --- | --- | --- |
| Q-receipts asked | blocking | Sent by the ask command itself; no second alert |
| Phase P1 starts: the heads-up for the plan's tasks due by P1's last day, Nov 19 (U-recipes-key, U-first-build) | do-by | "Usewell: to do by Nov 19" · "Two things to do by Nov 19: add the recipe key, and run the first test builds." |
| U-photos added mid-build | do-by | Sent by the ask command: "Usewell: to do by Nov 21" · "Take three photos of your own fridge for the store pictures." |
| Phase P1 finishes | fyi | "Usewell: for you" · "Foundations are done. Next: the main flow, Today to I cooked it." |

Each alert opens the status page. An alert with a link in its text was refused, as it should be: "The alert wasn't sent because it holds a link (the alert already opens the status page)."

One fyi alert was also sent for real, to a throwaway channel made for this test, to check that ntfy.sh can be reached from the build's environment: "Alert sent (fyi)."

## 5. "How's my build?" (skill section 5)

> Waiting on you. Now: adding food by typing. Expected Tue Nov 24, on plan.
> One thing waits on you: whether to keep receipt photos. It holds up adding food by receipt.
> Status page: [link]
> • Answer it now *(recommended: the receipt part is waiting)*
> • Later

## 6. Checked against the skill

- The page is built only from the status files, never committed, and published privately; the link is recorded once and survives republishing.
- No alert was sent twice for the same thing; each status change sent one at most.
- No alert or status text holds a key, code, a link, an email address or the app's data.
- The mid-build task shows under "Waiting on you now" with its date, without a new baseline.
- Opening the claude.ai link from a browser that isn't signed in stops at a sign-in check, so the phone check is the user's: open the link in the Claude app or a signed-in browser on the phone.
