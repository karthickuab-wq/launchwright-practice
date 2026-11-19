# Sources for the existing-app skill

Facts the skill relies on, each with its source and the date it was read. Everything else in the skill is Launchwright's own choice, recorded in Launchwright's own decisions or the piece's report.

## Putting a laptop-only app on GitHub (spec screen E1)

From GitHub's docs, read Nov 18, 2026:

- "Adding locally hosted code to GitHub" (docs.github.com/en/migrations/importing-source-code/using-the-command-line-to-import-source-code/adding-locally-hosted-code-to-github): local code goes to GitHub by typing Git commands in a terminal, or with GitHub CLI or GitHub Desktop. The page warns never to add, commit or push passwords or API keys.
- "Adding a file to a repository" (docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository): files added through the browser are limited to 25 MiB each, and up to 100 files can be uploaded at the same time. GitHub's push protection may block an upload that holds a supported secret.

So the computer route (the setup assistant in the app's folder, with Git) is the main one, and the browser upload only fits a small app. Either way, the key check runs before anything leaves the computer.

## Accepting the kit with one tap (spec screen E5)

From GitHub's docs, read Nov 18, 2026:

- "Creating a pull request" (docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request): after a branch is pushed, a yellow banner above the list of files offers **Compare & pull request**; the base menu picks the branch to merge into; **Create pull request** makes it.
- "Merging a pull request" (docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request): **Merge pull request**, then **Confirm merge**.

## Upgrading Expo (spec screen E7)

From Expo's docs, "Upgrade Expo SDK" (docs.expo.dev/workflow/upgrading-expo-sdk-walkthrough), modified Nov 2, 2026, read Nov 18, 2026: "We recommend upgrading SDK versions incrementally, one at a time." The same docs have a section on existing React Native apps (adopting Expo), which is a large change: the skill leaves it out of a first upgrade plan.

## Not yet tried (for the practice run, Phase 5)

- That Claude Code shows the skill's own folder when it loads a plugin skill, so the plugin's kit script can be found two folders up. If it doesn't, ask the user to add the plugin's repo to the thread instead, and record what worked here.
- That a push of a new branch to an app's repo works from the app's own Project before the kit is in it, with the guard on for the account.
