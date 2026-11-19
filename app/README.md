# Expo app starter

The starting point for a phone app (iPhone and Android), made by Launchwright's build thread on day one and replaced screen by screen as the app is built. It is an Expo app on Expo SDK 58 (Expo Router, React Native, TypeScript). Launchwright needs SDK 56 or later: Google requires Android API 36 for new uploads and Apple needs Xcode 26 (sources at the end of this file). `npm run check` fails on anything older.

In a project it lives in the app's folder (`app/`, or where appPath in the kit settings says: launchwright/kit.json in a project). Read this file, then the project's design guide (project/design.md) and the plan (project/plan.md).

## What's here

| Path | What it is |
| --- | --- |
| `src/app/` | The screens, by Expo Router's file names. `(tabs)/` holds the tab bar's screens: `index.tsx` (Home) and `more.tsx`. Add a screen as a file there and a `Tabs.Screen` line in `(tabs)/_layout.tsx` |
| `src/theme/tokens.json` | The look: colours, corners, spacing and type sizes. Filled from the design guide by `npm run design` |
| `src/theme/index.ts`, `src/components/` | What screens read. A screen never writes a colour, size or corner of its own (the check refuses a `#` colour outside the theme) |
| `__tests__/` | Jest tests (`npm test`): the screens, the theme's readable colours, tap and text sizes |
| `.maestro/` | Phone-flow tests for Expo's simulated phones: open the app, move between tabs, tap. They run only on a paid Expo plan, with the user's yes (below) |
| `flows/`, `playwright.config.ts` | The same flows on the app's web build at a phone's size, free, in a cloud session (`npm run flows`). They catch most broken screens and taps, but not what's special to an iPhone or an Android phone |
| `workflows/` | Expo workflows: three for checkpoints (`workflows/test-version.yml` builds the test version, `workflows/phone-flows-ios.yml` and `workflows/phone-flows-android.yml` run the phone flows), and two that send the app to the stores after the user's Approve tap on Expo's site. The kit copies them to the .eas/workflows folder, a folder only a kit update or setup writes |
| `eas.json` | Three build profiles: `preview` (the test version the user installs, internal distribution), `e2e-test` (a build for the simulated phones) and `production` (the store version, its build number counted up by Expo). One submit profile, `production`, which uploads to Google's internal testing track only; launch preparation adds the app's Apple ID to it |
| `scripts/` | `scripts/check-starter.mjs` (the check), `scripts/apply-design.mjs`, `scripts/make-icons.mjs`, `scripts/starter-test.mjs` (their tests). Plain Node, no packages |

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs the app's own packages, in this folder only |
| `npm test` | Jest tests |
| `npm run typecheck` | TypeScript |
| `npm run check` | The starter check and the tests of its scripts. Needs nothing installed |
| `npm run check:ready` | The same, plus: nothing is still a placeholder. Run before a test version goes to the user |
| `npm run design` | Sets the theme from the project's design guide (project/design.md). Refuses, and changes nothing, if a colour is missing or a text colour is too faint |
| `npm run icons` | Makes plain placeholder icons in the accent colour, and sets them in `app.json`. The real icon comes with the store listing |
| `npm run export:web` | Builds the web version into `dist/`, one page per screen (`web.output` is `static` in `app.json`). The design review takes its screenshots from it, at a phone's size |
| `npm run flows` | Serves `dist/` and runs the flows in `flows/` at a phone's size. Run `npm run export:web` first. If the browser can't be found, set `CHROMIUM_PATH` to `/opt/pw-browsers/chromium` |
| `npm start`, `npm run web`, `npm run ios`, `npm run android` | Expo's dev server, for the user's computer. A cloud session doesn't run a simulator |

## What the build sets on day one

The starter's values are placeholders. The build thread replaces them, and `npm run check:ready` lists what's left:

- **Name and slug** in `app.json` (the name the user chose, in the decisions file (project/decisions.md)).
- **App identifier**, in `app.json` as `ios.bundleIdentifier` and `android.package`, and as `appId` in every `.maestro/` flow. It can't be changed once the app is in a store, so it's the user's choice: ask first. `com.example.starterapp` is only a stand-in.
- **The theme**: `npm run design`.
- **The screens**: the starter's Home and More screens, with their `Starter screen` and `Your app starts here` words, are replaced with the screens from the approved mockup. When a screen's words change, the flows in `.maestro/` and `flows/` that look for them change with it (the check finds a flow that looks for words no screen shows).
- **Icons**: `npm run icons` for the test version.

## Test versions and phone flows

- The test version is built on Expo's servers from the `preview` profile by `workflows/test-version.yml`, for a push whose message says `[checkpoint]`, through Expo's GitHub app (one build per platform each checkpoint). No Expo key goes into the cloud environment. `distribution: internal` means the user installs it from a link; on iPhone the phone must be registered with Expo once (setup step 9).
- The phone flows are `workflows/phone-flows-ios.yml` and `workflows/phone-flows-android.yml`. They run only for a push whose message says both `[checkpoint]` and `[phone-flows]`. Maestro jobs aren't in Expo's Free plan and cost money on a paid one (open point O9), so the checkpoint skill adds `[phone-flows]` only after the user says yes, each time; the flows in `flows/` always run on the web build at a phone's size, for free. Each builds the `e2e-test` profile and runs every flow in `.maestro/` (Expo's docs, read Nov 18, 2026; sources at the end of this file).
- The store workflows are `workflows/send-to-stores-ios.yml` and `workflows/send-to-stores-android.yml` (open point O5, settled by P3.C2). A push whose message says `[store-ios]` or `[store-android]` builds the `production` profile, then the run waits at a `require-approval` job. Only someone signed in to the user's Expo account can approve it, on the run's page on expo.dev, and the project's Claude has no Expo sign-in, so that tap is the user's. Only then does the `submit` job upload. Apple puts the build in TestFlight, and Google in internal testing; App Review and Google's later tracks are the user's own steps (`skills/launch-prep/SKILL.md`).
- Expo looks for workflow files only in the .eas/workflows folder "at the root of your Expo project" (Expo's docs). In a project the app sits in its own folder, so the project's base directory on Expo's website (its GitHub settings) is set to that folder once, when the repo is connected. Expo's docs don't say whether the workflows are then read from the repo's top folder or from the app's folder; the first checkpoint of the practice run settles it, and the kit places them to match.
- A server that holds a key (for a service the app uses) needs more than this starter: its code is deployed as a preview on Expo Hosting, which needs Expo sign-in, so a cloud thread can't do it. The plan for such an app says who starts it.

## What it never does

It never submits to a store or deploys to production without the user's Approve tap on Expo's site, and holds no key. It has no over-the-air updates (`expo-updates`): a fix reaches phones as a new store version. Adding them is a plan piece of its own, and a workflow that publishes them must come with the kit, behind an approval (the check refuses an update job here). It makes no network call and has no analytics or tracking: the check refuses a `fetch`, a web address, or a package that looks like either, in the untouched starter. When a feature needs a service, the plan and the README say so first. `expo-doctor` runs clean except two checks that need `exp.host` and `reactnative.directory`, which the cloud environment doesn't allow.

## How this folder is checked

`node templates/check-templates.mjs` (in the plugin) runs the starter check and the script tests for this template and the web one, and confirms the files they share are identical. It installs nothing. Jest, the type check and the web export need `npm install` in a copy of this folder; the plugin itself never holds the packages.

## Sources

Read on Nov 18, 2026.

- Expo SDK versions on npm (`sdk-56`, `sdk-57`, and SDK 58 as `latest`): [expo on npm](https://registry.npmjs.org/expo).
- Which Android and iOS versions each Expo SDK targets, and the Xcode it needs: [Expo: SDK versions](https://docs.expo.dev/versions/latest/).
- Google's target API level for new apps and updates: [Google Play: target API level requirements](https://developer.android.com/google/play/requirements/target-sdk).
- Apple's Xcode and SDK minimum for uploads: [Apple: upcoming requirements](https://developer.apple.com/news/upcoming-requirements/).
- What a push can start (`on.push.if` on the commit's message), and `maestro` jobs (in alpha) on a build made with `ios.simulator: true` or `android.buildType: "apk"`: [Expo Workflows syntax](https://docs.expo.dev/eas/workflows/syntax.md), [E2E tests with Maestro](https://docs.expo.dev/eas/workflows/examples/e2e-tests.md).
- Where Expo looks for workflow files ("the .eas/workflows/ directory at the root of your project", and "only in this location"): [Introduction to Expo Workflows](https://docs.expo.dev/eas/workflows/introduction.md), [Run your first Expo Workflows job](https://docs.expo.dev/tutorial/cicd/first-workflow.md), [Expo Workflows: get started](https://docs.expo.dev/eas/workflows/get-started.md). The base directory for a project in a subfolder: [Build from GitHub](https://docs.expo.dev/build/building-from-github.md).
- What Expo's plans include: [Expo pricing](https://expo.dev/pricing).
- The store workflows: a `require-approval` job waits until someone signed in to the Expo account approves it (within 30 days), and a `submit` job uploads with the `production` submit profile; a workflow can be started by hand only with Expo's command-line tool or its API: [Expo Workflows: pre-packaged jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs.md), [syntax](https://docs.expo.dev/eas/workflows/syntax.md). The `production` build profile, remote build numbers, and the submit profile's `track`: [Submit to Google Play](https://docs.expo.dev/submit/android.md), [Submit to the App Store](https://docs.expo.dev/submit/ios.md), [App version management](https://docs.expo.dev/build-reference/app-versions.md), [eas.json reference](https://docs.expo.dev/eas/json.md). More in `skills/launch-prep/sources.md`.
