---
name: build-relay
description: The coordinator's rules for running a Launchwright build once the user has approved its plan. Use when the plan is approved, whenever a piece reports, a question is answered or the build needs checking, and to pick the model and effort for each piece. Covers the relay with no dead time, the handoff check every piece makes, stops, step-ups after failed tries, the model presets by role, and what usage a build can measure.
---

# The build relay

This skill runs the build itself, from the approved plan to the last checkpoint. It's for **the coordinator**: in a Claude Code Project, the Project's own chat. Each piece of the plan runs in its own thread, and this skill says how pieces start, how their reports are checked, when the build stops for the user, and which model and effort each piece gets.

It covers spec screens 13 (Building) and 14 (Waiting on you), the agent roles in spec section 2.2, and brief items F10 and F18. Everything the user sees follows the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4). The brief each piece gets, and the fields the relay reads from the plan, are in `skills/build-relay/brief.md`.

In a project, this skill and the scripts it names live in the kit: read this file at launchwright/skills/build-relay/SKILL.md, and run the status script from the repo's top folder, as the kit's AGENTS.md shows. What the platforms' docs say about models, effort and usage, with sources and dates, is in `skills/build-relay/sources.md`.

## 1. When it opens

- **The plan is approved:** project/plan.json has its approved date and its pieces. Start the build (section 2).
- **While the build runs,** on every one of these: a piece reports, the user answers a question or a stop, the user asks how the build is going, or a thread has been quiet for an hour. Run the relay (section 3).
- **Not before the plan is approved.** If the plan isn't approved yet, go back to the build-plan skill (`skills/build-plan/SKILL.md`).

## 2. Starting the build (screen 13)

Before the first piece:

1. **Check the working branch.** Read workingBranch in launchwright/guard/guard.json. Every piece pushes there, and the next piece picks up from there, so the relay needs it. If it's null, only the user pushes, and pieces can't hand work to each other. Don't start; ask (one question, it holds up the whole build):
   > Your app goes live when anything lands on its main version, so I build on a separate copy you look over. May I set one up?
   > • Yes, set it up *(recommended: the build can run overnight)*
   > • No, I'll keep it as it is
   If they say no, the build can't run by itself: say so plainly, and offer one piece at a time with their look at each.
2. **Check the Project's model settings, once.** A new Project runs every thread on its top model at high effort, which uses the user's plan fastest, and the coordinator (the Project's own chat) at low effort (`skills/build-relay/sources.md`, "Models and effort in a Project"). The balanced preset (section 7) wants medium for both. The relay names a model and effort for each piece when it starts it, but it can't change the coordinator's own setting or the threads' default. Offer the change once, never again:
   > One change makes your plan last longer and keeps my checks careful: medium effort for building (now high) and for me (now low). I check the hard parts at high effort anyway.
   > • Show me how *(recommended)*
   > • Leave it as it is
   If they want it:
   > **Where:** Claude, this project's settings, General.
   > **Do:** set "Thread effort" to Medium, and "Coordinator effort" to Medium.
   > **You'll see:** Medium next to both.
   These are the user's own settings, so they're never changed for them.
3. **Record the start,** through the next piece's brief (section 6): the first phase with the status script's phase command, and the mode with its mode command, `running`, with a note such as "Plan approved; build started". That thread also publishes the status page for the first time, records its link with the status script's page-link command, and gives the link in its report (`skills/status-page/SKILL.md`, section 1).
4. **Tell the user,** once that report is in, and then leave them alone:
   > Building. You can close everything. I'll alert your phone when something needs you, and now and then with good news.
   > Status page: [link]
   The link is the one that thread reported. Never send this message before the page is published: a "Building" message without a working link sends the user nowhere. From then on, every thread that records a status change republishes the page (`skills/status-page/SKILL.md`).
5. **Start the first pieces** at once (section 3).

## 3. The relay

Run this every time something happens (section 1). It takes a minute; there's never a wait between a piece's inputs finishing and the piece starting.

1. **Read where things stand:** the status script's show command, the files under status/, and the plan's pieces in project/plan.json.
2. **Check each new report** (section 4) before anything that depends on it starts.
3. **Find the pieces that can start:** every input is done (shown as done by the status script, with its report checked), it isn't running or done already, and everything in its needsUser is done:
   - **a question from the sweep** (Q-, A-, K-): it has an answer in project/questions.md, not "skipped" or "waiting", or the status script shows it answered;
   - **a user task** (U-): the status script shows it done (task-done), or the question named in its closedBy answered;
   - **a checkpoint** (C1, C2, …): the status script shows it answered. A checkpoint is recorded under its own id with the ask command when its test version is ready, and answered when the user has tried it (the checkpoint skill does both).
   If something in needsUser isn't done, ask the user for it (section 6), but not before it's due: a planned user task, or a question a task is closed by, waits for the start of the review window on that task's do-by day. Until then the status page shows it under "Coming up for you", and the piece waits quietly.
4. **Start them, up to the plan's worker count** (workers in project/plan.json; three if it says nothing). Shared foundations first, then the rest in plan order. Each gets the brief in `skills/build-relay/brief.md`, on the model and effort from section 7. A piece with needsKey true doesn't start as a thread: it runs in its own session, as the keys skill says (`skills/keys/SKILL.md`, section 6). A checkpoint whose after pieces are all done and checked starts too, as its own thread, the piece `<id>.run` (C1.run), as the checkpoint skill says (`skills/checkpoint/SKILL.md`, at the top).
5. **Never wait for the user** unless the plan marks a stop here, or every piece that's left needs an answer from them. When a question holds one piece, the others keep going.
6. **When nothing can start and nothing is running,** the build is either done, at a stop, or waiting on the user. Record the mode that's true (section 6): done, or waiting with a note on what it waits for.

**Handoffs are clean.** Every piece syncs first, then checks that its inputs are really there before it starts, and reports what's missing instead of asking the user a confusing question (lesson 15). The brief says so. If a piece reports something missing, it's the relay's mistake or an unfinished input: fix the input, never pass the question to the user.

**A quiet thread.** A thread that has said nothing for an hour may still be working; read its transcript first.
- **Waiting out a usage limit** isn't stuck. Threads wait at the user's plan limit and carry on by themselves when it resets, unless the user has turned that off in the Project's settings (`skills/build-relay/sources.md`, "Threads and usage limits"). Don't start extra threads to make up time; they draw on the same limit.
- **Stuck** (an error, a loop, or no progress for an hour with no limit in sight): start the same piece again in a new thread. Its handoff check finds anything half-pushed. This counts as a failed try (section 5).
- **If limits keep holding the build for hours,** tell the user once, at the fyi level, with a choice (it's theirs, because it moves dates):
  > Your Claude plan's limit is slowing the build: it waited 6 hours today. The expected finish is now Dec 6.
  > • Fewer pieces at once *(recommended: steadier, same finish date or a little later)*
  > • Keep going as it is

## 4. Checking a report

A piece reports what it did, its checks and their results, its last commit, anything the user needs to know, and every decision it made on its own. Before anything that depends on it starts:

- **Its done-when checks are quoted as passed,** and its last commit is shown and is on the working branch.
- **It touched only the files its brief named.** Anything else is a failed try, however good.
- **Its status is recorded** as done by the status script.
- **If the plan has a review piece for it** (reviewedBy in its plan entry), the review runs first and its findings are fixed or listed before anything that depends on it starts. The reviewer is never on a cheaper model or a lower effort than the piece it reviews (section 7).
- **Decisions it made on its own** are listed under "To review" in project/decisions.md, to go through with the user at the next stop.
- **Anything the user needs to know** goes into the next message the user gets anyway (a checkpoint or a stop), not a message of its own, unless it's theirs to decide now.

If a check failed, the report is unclear, or the thread failed, that's a failed try (section 5).

## 5. Failed tries and step-ups

- **The first failed try:** start a fix piece, named after it with .fix1 (for example P2.3.fix1), on the same model and effort, with the failure in its brief.
- **The second failed try:** the piece steps up one rung on the ladder below, and the next fix piece runs there (F18). Each two more failed tries step up one more rung.
- **The ladder,** one rung at a time: light model at medium effort, light at high, top at medium, top at high, top at extra-high. A piece never steps down during the build.
- **Its reviewer** steps up with it, so it's never on a cheaper rung than the piece.
- **At the top rung, after two more failed tries,** the piece is stuck. Record it with the status script's block command, keep every other piece going, and tell the user (it's theirs, because it changes the plan):
  > One part of your app is stuck: the photo upload. I've tried it six ways, and the rest of the build carries on.
  > • Try a simpler version of it *(recommended: you'll see it at the next checkpoint)*
  > • Leave it out of version 1
- **Every failure that the plan didn't expect** gets a lesson in project/lessons.md, and the fix covers the whole kind of problem, not just the example (lesson 2).

## 6. Records and stops

**The coordinator doesn't edit files.** Every status change it owes goes into the next piece's brief, under "Before your piece, record", and that thread runs it first. If no piece is about to start, start a short thread on the light model that only runs them. The records it owes:

- a phase begins: the status script's phase command
- the build's overall mode: its mode command, with a note on why (running, waiting, paused, done)
- the user answered: its answered command, with the answer in the user's words; when it was a stop, also mode running with the note "<stop> answered", so the build reads as running again (lesson 24)
- a planned task of the user's is done: its task-done command (lesson 30)

**Stops are fewer and bigger.** The build stops only for:
- **the plan's checkpoints,** booked into the user's review window (the checkpoint skill, `skills/checkpoint/SKILL.md`, runs each one);
- **what's the user's to decide:** names, money, accounts, store submissions, prices, legal or privacy text, anything hard to undo, and changes to the plan or its dates.

Anything cheap to undo is decided under the go-ahead rule and listed at the next stop. Small questions never stop the build (lesson 16).

**Screen 14 · Waiting on you.** When something is the user's to decide:
1. A thread records it with the status script's ask command, at the blocking level, with what it holds up. A question the sweep skipped keeps its sweep id (Q-, A-, K-), so a plan task closed by it counts as done when it's answered (lesson 30). That alerts the user's phone, and a tap on the alert opens the status page, which lists the question under what's waiting on them (`skills/status-page/SKILL.md`, section 2).
2. The coordinator asks it in the Project's chat, as one question with tap options, the recommended one first:
   > Your app needs one answer: how people sign in. It holds up the sign-in screens; everything else keeps building.
   > • With Apple and Google *(recommended: fastest for your users)*
   > • With email and a code
   > • No sign-in for version 1
3. Only the pieces that need the answer wait. When it comes, record it (above) and run the relay.

A task the user does by a date (for example, inviting testers) uses the do-by level with its date, worked back from when the build needs it.

**Never ask for a key, a password or a code in a chat.** A piece that needs a key follows the keys skill (`skills/keys/SKILL.md`); it never runs in a Project thread, whose environment holds no keys (spec section 1).

**Good news, now and then.** At the end of a phase, and nowhere else, one fyi alert:
> Pantry Pal: the shopping list works. Next: the meal plans.

## 7. Models and effort, by role (F18)

**Top** is the most capable model the user's Project offers, and **light** the lighter one. Name the model and effort when starting each thread, and record what actually ran in the status script's start command, so usage can be measured per model (section 8).

**The balanced preset** (the default; D-5):

| Role | Model and effort |
| --- | --- |
| Coordinator | top, medium (the Project's own setting: section 2, step 2) |
| Builder | top, medium; light, medium for templates and tests |
| Reviewer | top, high |
| Researcher (market and rules checks) | top, medium |
| Design reviewer | top, high |

**The saver preset,** for a plan whose limits keep holding the build (section 3), and only with the user's yes, because it can slow the build down with more fix tries:

| Role | Model and effort |
| --- | --- |
| Coordinator | top, medium |
| Builder | light, medium; top, medium for shared foundations |
| Reviewer | top, medium |
| Researcher | light, medium |
| Design reviewer | top, high |

Rules that hold for every preset:
- **A reviewer is never on a cheaper model or a lower effort than the piece it reviews.** If a piece stepped up (section 5), its reviewer is at least on the same rung.
- **The plan's piece entry wins** when it names a model and effort; the preset fills in the rest.
- **A step-up is per piece,** and lasts for that piece and its fix pieces only.
- **After launch only,** the tip of planning with a stronger model and building with a lighter one may be offered to stretch the plan (spec screen 18). Never during the first build.

## 8. Measuring usage (open point O6)

**What a thread can see** (looked up Nov 18, 2026; `skills/build-relay/sources.md`, "What usage a build can see"): Claude in a thread has no way to read how much of the user's plan it has used. The figures exist only on screens the person reads: the Project's Usage settings (token use by thread and by model), the usage screen in Claude Code on a computer, and a status line script on a computer. A Project thread doesn't load a repo's settings, so a status line can't help there. A thread does see when it reaches the plan's limit, because it stops and waits.

So the build measures what it can:
- **Per piece, from the status files:** the model and effort named at start, and the time from start to finish. Time spent waiting at a usage limit is noted in the piece's report, so it's not counted as work.
- **Per model, from the user, when they're at a checkpoint anyway, and never as a stop.** It's optional, and the build never waits for it:
  > Optional: a screenshot of your project's Usage page helps me size the next plan better.
  > **Where:** Claude, this project's settings, Usage.
  > **Do:** take a screenshot.
  > **You'll see:** how much each thread and model used.
  > • Here it is
  > • Skip it *(recommended if you're short on time)*
  The figures read from it go into the checkpoint's retrospective in project/lessons.md, under "Usage by model", with the date.

The build-plan skill uses both to size workers and estimate time and usage. Until there are measured figures, its estimates use each piece's time and model (spec, open point O6).

## 9. What the relay never does

- Start work the plan doesn't list. Changing the plan's pieces to fix a problem is fine; changing its scope, dates or stops is the user's call, at a stop.
- Approve a hard stop for the user: spending money, production keys, deploying to production, submitting to the stores, messages to real people, real users' data, prices, legal or privacy text, or installing software. Pieces prepare them; the user approves.
- Pass a piece's confusion to the user. A missing input is the relay's to fix.
- Promise a date the plan doesn't support. The status page shows the expected finish against the baseline; the baseline moves only at a stop, with the user's OK.
