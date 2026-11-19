# The piece brief, and what the relay reads from the plan

Part of the build-relay skill (`skills/build-relay/SKILL.md`). The coordinator gives every piece this brief, filled in from the piece's entry in project/plan.json. None of it is for the user's eyes.

## The brief

```
Piece: <id> · <title> · phase <phase>
Role: <builder | reviewer | researcher | design reviewer>, on <model>, <effort> effort
Make: <what, in a few lines, from the plan>
Files you may touch: <paths>. Leave everything else alone.
Inputs (must be done first): <piece ids, or "none">
Done when: <the plan's checks>
Before your piece, record: <status commands the coordinator owes, or "nothing">
First: git fetch origin <working branch>, git checkout <working branch>, git pull --rebase origin <working branch>.
Then the handoff check: every input shows as done in `node launchwright/scripts/status.mjs show`, and the files it made exist. If anything is missing, don't start: report what's missing.
Follow AGENTS.md. Record your start and finish only with the status script, with --model "<model>, <effort>" on start.
When you're done, report: what you did, the checks and their results, your last commit, anything the user needs to know (plain words), every decision you made on your own with how cheap it is to undo, and any time you spent waiting at a usage limit.
```

- **The working branch** is workingBranch in launchwright/guard/guard.json. A thread starts on a branch of its own with an old copy of the working branch, so the first line brings it up to date before anything else (lesson 27).
- **"Before your piece, record"** carries the status changes the coordinator owes (the skill's section 6). The thread runs them first, in the order given.
- **A fix piece** (<id>.fix1, .fix2, …) gets the same brief, plus the failure in a line of its own: "Last try: <what failed, quoted from the report>".
- **A review piece** gets the reviewed piece's files as its "Files you may touch", and "Done when: findings fixed or listed".

## What the relay reads from each piece in project/plan.json

The build-plan skill writes these when it makes the plan. The relay reads them and nothing else, so a field it needs is never guessed.

| Field | What it holds | If it's missing |
| --- | --- | --- |
| id | Short, unique, such as P1.2 | The plan isn't ready: back to the build-plan skill |
| title | What the piece makes, in plain words | Same |
| phase | The phase it belongs to, such as P1 | Same |
| role | builder, reviewer, researcher or design-reviewer | builder |
| model, effort | top or light; low, medium, high or xhigh | From the preset (the skill's section 7) |
| inputs | The ids of the pieces it needs first | It needs none |
| files | The paths it may touch | The plan isn't ready |
| doneWhen | The checks that show it's done | The plan isn't ready |
| reviewedBy | The id of the review piece that checks it, or null | No review |
| needsUser | What it waits for from the user: sweep question ids (Q-, A-, K-), user task ids (U-), or checkpoint ids (C1, C2) whose feedback it builds on. The skill's section 3 says when each counts as done | It waits for none |
| needsKey | true if a step needs a key | false |
| foundation | true for a shared foundation, which starts before other pieces of its phase | false |

At the top of project/plan.json, the relay also reads:
- **workers:** how many pieces run at once. Three if it's missing.
- **preset:** balanced or saver. Balanced if it's missing.
