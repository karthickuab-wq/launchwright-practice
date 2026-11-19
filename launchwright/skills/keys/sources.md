# What the platforms' docs say about keys

Each fact the keys skill relies on, with its source and the date it was read. Read a page again before relying on it if the date here is more than a month old, and update this file with what changed. These facts were first read for Launchwright's own build; they're kept here so a project has them too.

## Masked plugin settings reach hooks only

- A plugin setting marked `sensitive: true` is masked and kept in the machine's secure credential store. Its value reaches the plugin as `${user_config.KEY}` in MCP and LSP server config, in hook arguments, and in skill and agent text (where a sensitive value becomes a placeholder), and as `CLAUDE_PLUGIN_OPTION_<KEY>` in hook processes only. A script Claude runs itself doesn't get it. Source: [Claude Code: Plugins reference](https://code.claude.com/docs/en/plugins-reference#user-configuration), "User configuration", read Nov 18, 2026.
- **So:** masked settings are one set for the whole plugin, kept on one machine, and never reach a cloud build's scripts. No project key goes there (the skill, rule 6).

## Network secrets

- A cloud environment can hold network secrets: a key stored on the environment that Claude's agent proxy adds to requests for the hosts the user lists, after each request leaves the session, so the key never enters the session's environment variables or files. Source: [Claude Code: Cloud environments](https://code.claude.com/docs/en/cloud-environments), "Add network secrets", read Nov 18, 2026.
- They're added one at a time at claude.ai/code: the environment's settings icon, **Network secrets**, **Add secret**; type **Bearer**, with **Allowed websites** and a header row. On a Team or Enterprise plan without the organization's admin role, the form is shorter: one **Host**, a **Secret type** of **Token**, and the key in **Token**, with the header. Same source and date.
- The value can't be viewed again. To change one, delete it and add it again. A secret applies to every session in that environment. It's never sent to GitHub, the Anthropic API, public package registries (npm, PyPI and others) or the setup script. A list entry marked **Not sent** says why. Available on Pro, Max, Ultra, Team and Enterprise plans, in Anthropic-hosted environments. Same source and date.
- By contrast, an environment's variables can be read by anyone who uses the environment, and the dialog warns against putting secrets there. Source: Cloud environments, "Set environment variables", read Nov 18, 2026.

## Keys on Expo

- Expo keeps environment variables per project (or per account), in the development, preview and production environments. Each is **Plain text** (shown everywhere), **Sensitive** (hidden in build and workflow logs, but readable on the website and in Expo's command-line tool) or **Secret** (never readable outside Expo's servers). Source: [Expo: Environment variables](https://docs.expo.dev/eas/environment-variables/), read Nov 18, 2026.
- They're added on expo.dev under the project's **Project settings** > **Environment variables** > **Add Variables**, or with `eas env:set`. Source: [Expo: Create and manage environment variables](https://docs.expo.dev/eas/environment-variables/manage/), read Nov 18, 2026.
- Variables whose names start with `EXPO_PUBLIC_` are put into the app's code. Anything in the app is readable by whoever has it, and Secret gives no protection to a value built into the app. Expo's hosting can deploy only Plain text and Sensitive variables to server code (API routes); Secret ones serve build and workflow jobs. Source: [Expo: Environment variables usage](https://docs.expo.dev/eas/environment-variables/usage/), read Nov 18, 2026.
- **So:** a key the app's server code uses goes to Expo as Sensitive (Secret when only build jobs use it), in development and preview for test keys; production only at launch, by the user. A public key goes as Plain text with the `EXPO_PUBLIC_` name. The guard refuses `eas env`, so the user adds them on the website.

## Where a repo's own hooks run

- A cloud session with one repository runs the hooks in that repository's `.claude/settings.json`. A session with several repositories doesn't, and neither does a thread of a Project, which runs only plugins added in the Project's settings. Sources: [Claude Code: Cloud environments](https://code.claude.com/docs/en/cloud-environments), "What carries over from your setup"; [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), "What threads pick up from your repositories"; read Nov 18, 2026.
- **So:** a piece that needs a key runs as a plain cloud session on the app's repo, where the kit's guard runs, never in a Project thread (the skill, section 6).
