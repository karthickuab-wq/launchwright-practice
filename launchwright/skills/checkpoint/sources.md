# What Expo's docs say about checkpoints

Each fact the checkpoint skill relies on, with its source and the date it was read. Read a page again before relying on it if the date here is more than a month old, and update this file with what changed. These facts were first read for Launchwright's own build; they're kept here so a project has them too.

## What Expo's checkpoint runs cost (open point O9)

- **Maestro test jobs aren't in the Free plan.** Expo's pricing table, under CI/CD Workflows, row "Run Maestro end-to-end test jobs": Free "—"; Starter, Production and Enterprise "$0.05, plus CI/CD minute usage". Source: [Expo pricing](https://expo.dev/pricing), read Nov 18, 2026.
- **Workflow minutes:** the Free plan has "Up to 60 minutes" of CI/CD minutes a month; paid plans have "Usage-based pricing". The page's text doesn't give the price per minute. Same source and date.
- **Builds:** the Free plan has "Up to 15 Android and 15 iOS builds" a month, in a low-priority queue, with a 45-minute build timeout. Starter is $19 a month with $45 of build credit, then usage-based pricing. A workflow's build job uses these ("Run build jobs: Use included builds" on Free). Same source and date; [Expo: subscriptions, plans and add-ons](https://docs.expo.dev/billing/plans.md), read Nov 18, 2026 (page dated Nov 2, 2026).
- **The Free plan can't run up a bill.** "Free plan accounts do not incur overage charges. Once you use your monthly quota of free builds, new builds are unavailable until the quota resets on the first day of the next calendar month." Source: [Expo billing FAQ](https://docs.expo.dev/billing/faq.md), read Nov 18, 2026. Paid plans are charged for usage past their limits: [Usage-based pricing](https://docs.expo.dev/billing/usage-based-pricing.md), read Nov 18, 2026.
- **So:** on the Free plan, the phone-flow tests on Expo's simulated phones can't run, and the checkpoint runs the flows on the web build at a phone's size instead. On a paid plan they cost about $0.05 a job plus minutes and two builds from the credit, and run only with the user's yes, each time.

## Workflows

- A workflow's `on.push.if` can read the commit's message (`github.commit_message`) and combine conditions with `&&`, `||` and `!`. A `build` job takes `platform` and `profile`; a `maestro` job runs flows on a build made with a profile of `ios.simulator: true` or `android.buildType: "apk"`. Source: [Expo Workflows syntax](https://docs.expo.dev/eas/workflows/syntax.md), read Nov 18, 2026; [E2E tests with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests.md), read Nov 18, 2026.
- Expo reads workflows only from the .eas/workflows folder, which agents can't write: the kit copies the app's workflows there at setup or a kit update. Source: [Expo Workflows: get started](https://docs.expo.dev/eas/workflows/get-started.md), read Nov 18, 2026, and the guard.

## The test version

- A build with internal distribution can be installed from a link. When it's finished, its page on expo.dev has a **Build artifact** section; **Install** opens **Install on a test device**, with a QR code and an install link. Source: [Expo tutorial: internal distribution builds](https://docs.expo.dev/tutorial/eas/internal-distribution-builds.md), "Install", read Nov 18, 2026.
- An iPhone can install an ad hoc build only if it was registered before the build; registering a new phone means a new build. Android installs the file once the user accepts the warning for an app from outside the Play Store. Source: [Expo: internal distribution](https://docs.expo.dev/build/internal-distribution.md), read Nov 18, 2026.
- Web apps: a deploy to an alias gives a fixed link, `https://<preview name>--<alias>.expo.app`; only a deploy marked prod goes to the production address. The Free plan's hosting amounts cover checkpoint links. Source: [Expo Hosting: deployments and aliases](https://docs.expo.dev/eas/hosting/deployments-and-aliases.md), read Nov 18, 2026 (by the starter templates' piece); [Expo pricing](https://expo.dev/pricing), read Nov 18, 2026.
