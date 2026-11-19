# What the platforms' docs say about running a build

Each fact the build relay relies on, with its source and the date it was read. Read a page again before relying on it if the date here is more than a month old, and update this file with what changed. These facts were first read for Launchwright's own build; they're kept here so a project has them too.

## Models and effort in a Project

- A Project's settings, under **General**, have Thread model and Thread effort, and Coordinator model and Coordinator effort. A new Project runs Opus everywhere: threads at high effort, which draws on the user's plan fastest, and the conversation at low. A different model for one task is asked for in the task. Source: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), "Choose models and let Claude manage context", read Nov 18, 2026.
- Effort levels are low, medium, high, xhigh and max on current models. A level the model doesn't support falls back to the highest one below it. Source: [Claude Code: Model configuration](https://code.claude.com/docs/en/model-config), "Adjust effort level", read Nov 18, 2026.
- **So:** the relay names the model and effort when it starts each piece, records them with the status script, and offers the user once to set Thread effort and Coordinator effort to Medium, the balanced preset (the skill, section 2, step 2).

## Threads and usage limits

- Project threads run in auto mode, wait out usage limits and resume by themselves. A thread started by a scheduled task doesn't wait. Source: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), read Nov 17, 2026.
- Waiting at the limit is on by default: "Auto-continue when usage limits reset", in the Project's settings under **General**. Source: Projects, "A thread hit the usage limit", read Nov 18, 2026.
- **So:** a thread waiting at a limit isn't stuck, and the relay never starts extra threads to make up time.

## What usage a build can see

- A Project's settings, under **Usage**, show the person token use by thread and by model. Source: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), "Usage and cost", read Nov 18, 2026.
- In Claude Code on a computer, `/usage` shows plan usage bars and usage by model for the session. Source: [Claude Code: Costs](https://code.claude.com/docs/en/costs), "Using the /usage command", read Nov 18, 2026.
- A status line script on a computer gets `rate_limits` (5-hour and 7-day percentages used) on Pro, Max and Ultra. Source: [Claude Code: Status line](https://code.claude.com/docs/en/statusline), "Available data", read Nov 18, 2026.
- Nothing in the docs lets Claude in a thread read these figures itself, and Project threads don't load a repo's settings, so a status line can't help there. A thread at the plan's limit stops and, by default, continues when the limit resets. Projects use the plan faster than one session: each running thread is a full session, and the conversation uses tokens too. Source: Projects, "Usage and cost" and "A thread hit the usage limit", read Nov 18, 2026.
- **So:** the build measures per piece what it can (model, effort and time, from the status files). Per-model figures come from an optional screenshot of the Usage page at a checkpoint, never a stop (the skill, section 8).
