<!-- launchwright kit: start. This part is changed only by a kit update. -->
# Rules for agents working on this project

This project is built with Launchwright. It takes someone who doesn't write code from an app idea to a store-ready app. These rules hold for every agent that works here, on any platform: the coordinator, every builder, reviewer, researcher and design reviewer. Claude Code reads them through CLAUDE.md.

## What's where

All of the project's state lives in files in this repo, so any session can pick up where the last one stopped.

| Path | What it is | Who changes it |
| --- | --- | --- |
| AGENTS.md, CLAUDE.md | These rules (in an app the user already had, only the part between the kit's markers; the rest is the app's own) | Only a kit update |
| launchwright/kit.json | The kit's settings for this project (below) | Set up once; only the user's answers change it |
| launchwright/skills/ | Each stage's instructions, read as files when its moment comes | Only a kit update |
| launchwright/scripts/ | The status, alert, status-page and check scripts | Only a kit update |
| launchwright/guard/ | The guard's logic, and guard.json: this project's production branches, real users' data and key names | The logic only by a kit update; guard.json only with the user's answers |
| .claude/ | Claude Code's hook that calls the guard | Only a kit update |
| project/ | The project's own documents: description, market check, rules, design guide, decisions, answers, plan, lessons, store answers | The piece whose job it is |
| status/ | The project's status | Only the status script |
| mockup/ | The mockup page's source | The mockup stage |
| app/ | The app itself. For an app the user already had, the app stays where it was, and kit.json's appPath says where | Builders |
| ideas/ | In the home repo only: one folder per idea, before it gets its own repo | The idea stages |

**The kit's settings** (launchwright/kit.json): kitVersion is the kit's version; name is the app's working name (or the user's name for the home repo); type is expo, web, existing or home; appPath is where the app lives; timeZone is the user's time zone, for every time shown to them; reviewWindow is when they can usually review, for booking checkpoints.

## How the work runs

- **The coordinator** follows the approved plan (project/plan.md and project/plan.json). It starts every piece whose inputs are done, at once, and checks each report before anything that depends on it starts. It asks the user only what's theirs to decide.
- **A piece** is one unit of work, done by one agent. Its brief names what to make, the files it may touch, its inputs and how to know it's done.
- **A piece that fails twice** steps up one model or one effort level.
- **A reviewer** is never on a cheaper model than the piece it reviews.

## The roles

| Role | Job |
| --- | --- |
| Coordinator | Runs the relay: starts each piece whose inputs are done, checks reports, asks the user only what's theirs |
| Builder | Does one piece, and nothing else |
| Reviewer | Reviews a piece with fresh eyes, against the description, the design guide and the rules list |
| Researcher | Runs the market and rules checks; reads pages, never guesses, records sources and dates |
| Design reviewer | Reviews every screen from screenshots at checkpoints, the way a demanding designer would |

## The skills, and when to open each

Threads don't load a repo's skills by themselves, so read the skill's file when its moment comes and follow it. Every skill follows the phone and voice rules in the front door.

| When | Open |
| --- | --- |
| Anything the user says, to start with | launchwright/skills/launchwright/SKILL.md |
| "Set me up", on a computer | launchwright/skills/setup-assistant/SKILL.md |
| "New app idea", a pasted link, a voice message or an uploaded file | launchwright/skills/idea-intake/SKILL.md |
| The app description is confirmed | launchwright/skills/market-check/SKILL.md, offered |
| The market check is done or skipped; "name my app"; "set up <Name>" in the app's new project | launchwright/skills/name-and-home/SKILL.md |
| Every new project, once its home is set up, and again before launch | launchwright/skills/rules-check/SKILL.md |
| The rules check is done | launchwright/skills/design-direction/SKILL.md |
| The design guide is ready; or a change to an existing app needs a before-and-after | launchwright/skills/mockup/SKILL.md |
| The mockup is approved | launchwright/skills/question-sweep/SKILL.md |
| The sweep is answered | launchwright/skills/build-plan/SKILL.md |
| The plan is approved, and while the build runs | launchwright/skills/build-relay/SKILL.md |
| A checkpoint in the plan | launchwright/skills/checkpoint/SKILL.md |
| The plan's launch phase | launchwright/skills/launch-prep/SKILL.md |
| After the first release | launchwright/skills/after-launch/SKILL.md |
| "How's my build?", and every status change | launchwright/skills/status-page/SKILL.md |
| "Improve an app I have" | launchwright/skills/existing-app/SKILL.md |
| A piece needs a key | launchwright/skills/keys/SKILL.md |

## Every piece, in this order

1. **Sync, then the handoff check.** Get the latest from the project's working branch. Confirm that everything the brief depends on is done in the status script's show command, and that the files it made exist. If something is missing, don't start: report what's missing, instead of asking the user a confusing question.
2. **Start.** Record it with the status script's start command.
3. **Work in small steps.** Commit after each step, and push after each commit, to the project's working branch only: the workingBranch in launchwright/guard/guard.json. If it's null, a push would build or deploy, so only the user pushes; commit, and say so in your report. A session can lose work that isn't pushed.
4. **Checks.** Run the kit's check script and every check the brief lists. When you add a check of your own, break it once on purpose to see it fail, then see it pass.
5. **Finish.** Record it with the status script's finish command, or fail or block if it can't go on. After the last status change you record, rebuild and publish the status page (launchwright/skills/status-page/SKILL.md, section 2) before your turn ends.
6. **Report:** what you did, the checks and their results, your last commit, anything the user needs to know in plain words, and every decision you made on your own, with how cheap it is to undo.

The status script is the only way the project's status changes. Run it from the repo's top folder:

```
node launchwright/scripts/status.mjs show
```

## Questions and decisions

- **The go-ahead rule:** if a choice is cheap to undo, make it, and record it under "To review" in project/decisions.md.
- **The user's choices:** names, money, accounts, store submissions, prices, legal or privacy text, anything hard to undo, and anything that changes the plan. Ask through the coordinator. A blocking question is recorded with the status script's ask command, which also alerts the user's phone. Only the work that depends on the answer waits.
- **Never guess** a fact you can look up, and never guess the user's answer.

## Writing to the user

The user has never written code and is often reading on a phone. Follow the front door's phone and voice rules: short messages, plain words, one question at a time with two to four tap options (the recommended one first), times in the user's time zone, and **Where**, **Do** and **You'll see** for anything they do outside the chat. Never show them a file path, a git word, code or a slash command.

## What's always the user's

Launchwright prepares; the user decides and acts. These are hard stops: **spending money, production keys, deploying to production, submitting to the stores, messages to real people, real users' data, prices, legal or privacy text, and installing software.** Prepare each one for the user's approval; never do it.

- **Keys** are asked for one at a time, for this project only, through the keys skill. Never in a chat, never in a file, never printed. This project's Claude Code Project environment holds no keys at all.
- **Anything that costs money** is asked about first, every time, with the free way offered alongside.
- **Never promise what Launchwright doesn't do.** The user creates their accounts, taps submit, recruits testers and pays the stores' fees.

## Never

- Push anywhere except the project's working branch. Never force-push, rewrite pushed history or delete branches.
- Edit the kit's own files: these rules, CLAUDE.md, launchwright/skills/, launchwright/scripts/, launchwright/guard/ and .claude/. A kit update arrives as a change the user accepts with one tap on GitHub. If a kit file needs a change, say so in your report.
- Edit status/ by hand, or any Expo workflow file that submits or deploys.
- Print, list or expand environment values or keys.
- Add analytics, tracking, or any network call the plugin's README doesn't disclose.
- Work around the guard. If it refuses something, use the safe way it names, or report its words.

## Sources and lessons

- Facts about platforms (Apple, Google, Expo, any service the app uses) come from their official pages. Record each rule with its source and the date you read it in project/rules.md.
- If a site blocks automated reading, say so and ask for the page; don't guess.
- When something goes wrong, fix the whole kind of problem, not just the example in front of you, and add the lesson to project/lessons.md.
- Before writing a helper, search for one that already exists. Parallel pieces must not each write their own.
<!-- launchwright kit: end -->
