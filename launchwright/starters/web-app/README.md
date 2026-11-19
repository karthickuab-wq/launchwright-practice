# Web app starter

The starting point for an app that opens at a link in a phone's or computer's browser, made by Launchwright's build thread on day one and replaced screen by screen as the app is built. It is the same toolchain as the Expo app starter (`templates/expo-app/`): Expo SDK 58 (Expo Router, React Native for web, TypeScript), web only. It shares the theme, the components, the check and its scripts with that starter, so one set of instructions covers both. Launchwright needs SDK 56 or later; `npm run check` fails on anything older.

In a project it lives in the app's folder (`app/`, or where appPath in the kit settings says: launchwright/kit.json in a project). Read this file, then the project's design guide (project/design.md) and the plan (project/plan.md).

## What's here

| Path | What it is |
| --- | --- |
| `src/app/` | The pages, by Expo Router's file names. `(tabs)/` holds `index.tsx` (Home) and `more.tsx`. Add a page as a file there and a `Tabs.Screen` line in `(tabs)/_layout.tsx` |
| `src/layout.ts` | One rule: windows 768 wide or wider get the tabs down the left side, narrower ones get them along the bottom |
| `src/theme/tokens.json` | The look, filled from the design guide by `npm run design`. Pages never write a colour, size or corner of their own |
| `__tests__/` | Jest tests: the pages, the layout rule, the theme's readable colours, tap and text sizes |
| `flows/`, `playwright.config.ts` | Phone-flow tests for the web app: the exported site opened at a phone's size and at a computer's, tapping through the pages and checking every tap target is at least 44 by 44 |
| `workflows/web-preview.yml` | Puts a preview of the site on Expo Hosting. The kit copies it to the .eas/workflows folder, a folder only a kit update or setup writes |
| `workflows/release-web.yml` | Puts the site live at its production address, only after the user's Approve tap on Expo's site. Copied by the kit the same way |
| `scripts/` | The same plain-Node scripts as the Expo starter: `scripts/check-starter.mjs`, `scripts/apply-design.mjs`, `scripts/make-icons.mjs` (only the favicon here), `scripts/starter-test.mjs` |

There is no EAS build file: a web app has no build profile. Its test version is the preview link below.

## Commands

| Command | What it does |
| --- | --- |
| `npm install` | Installs the app's own packages, in this folder only |
| `npm test` | Jest tests |
| `npm run typecheck` | TypeScript |
| `npm run check`, `npm run check:ready` | The starter check, and the same plus "nothing is still a placeholder" (name, theme, favicon, starter words). `check` needs nothing installed |
| `npm run design` | Sets the theme from the project's design guide (project/design.md); refuses if a colour is missing or a text colour is too faint |
| `npm run icons` | Makes a plain placeholder favicon in the accent colour |
| `npm run export:web` | Builds the site into `dist/` |
| `npm run flows` | Serves `dist/` and runs the phone-flow tests. Run `npm run export:web` first. In a cloud session the browser is already there; if it can't be found, set `CHROMIUM_PATH` to `/opt/pw-browsers/chromium` |
| `npm start` | Expo's dev server in the browser, for the user's computer |

## Hosting: Expo Hosting (open point O10)

What Expo's docs and pricing page say, read Nov 18, 2026 (sources at the end of this file):

- **Expo Hosting serves a web app built with Expo Router.** This starter's output is `static` (`web.output` in `app.json`): each page is a file, so a link straight to `/more` works. `single` is one page for everything, and `server` adds API routes.
- **It needs an Expo account, and no other.** The Free plan includes 100,000 requests a month, 1 GB of storage, 5 aliases and deployments kept 30 days; a custom domain needs a paid plan. A paid plan or going past the free amounts costs money, so it is the user's choice, asked first, every time (K3).
- **A preview is not production.** `eas deploy` makes a preview link; only `eas deploy --prod` (or a deploy job with `prod: true`) goes to the production address, and the guard refuses that. Only `workflows/release-web.yml` has `prod`, in a job that waits for a `require-approval` job: a push whose message says `[release-web]` puts the version at the alias `release` first, then the run waits until someone signed in to the user's Expo account approves it on expo.dev. The project's Claude has no Expo sign-in, so that tap is the user's (open point O5, settled by P3.C2).
- **The link stays the same.** The workflow deploys to the alias `checkpoint`, so every checkpoint opens at `https://<preview name>--checkpoint.expo.app`. The preview name is chosen once, on Expo's website (the project's Hosting page) or on the first `eas deploy`. It is reserved forever, so it's the user's choice. Expo's docs don't say whether a preview link needs a sign-in, so treat the link as open to anyone who has it.
- **A cloud thread can't deploy.** `eas deploy` needs Expo sign-in, which no key in the cloud environment provides (spec section 1). The workflow runs on Expo's servers when a push says `[checkpoint]`, through Expo's GitHub app, as the phone starter's workflows do.
- **Rolling back** is the same release run on the last good version: Claude prepares it, and the user's Approve tap puts it live (`skills/after-launch/SKILL.md`). Moving the production address to an earlier deployment directly needs Expo's command-line tool, which the guard keeps from agents.
- **One catch:** with `static` output the first paint is laid out as for a phone, and on a wide window the tabs move to the left a moment later, once the page has started. Change it only if that matters to the app.

## What the build sets on day one

Replace the placeholders; `npm run check:ready` lists what's left: the name and slug in `app.json`, the theme (`npm run design`), the pages (the starter's `Starter screen` and `Your app starts here` words go), the favicon, and the preview name on Expo's website. When a page's words change, the flows in `flows/` that look for them change with it (the check finds a flow that looks for words no page shows).

## What it never does

It never deploys to production without the user's Approve tap on Expo's site, never submits anything, and holds no key. It makes no network call and has no analytics or tracking: the check refuses a `fetch`, a web address or a package that looks like either, in the untouched starter. A web app that holds a key for a service needs server code (API routes, `server` output) deployed on Expo Hosting, which needs Expo sign-in; the plan for such an app says who starts it.

## How this folder is checked

`node templates/check-templates.mjs` (in the plugin) runs the starter check and the script tests for this template and the phone one, and confirms the files they share are identical. It installs nothing. Jest, the type check, the web export and the flows need `npm install` in a copy of this folder; the plugin itself never holds the packages.

## Sources

Read on Nov 18, 2026.

- Expo Hosting, preview and production deploys, and the `static`, `single` and `server` outputs: [Expo Hosting: introduction](https://docs.expo.dev/eas/hosting/introduction.md), [get started](https://docs.expo.dev/eas/hosting/get-started.md).
- Deployments that never change, aliases, and rolling back: [Expo Hosting: deployments and aliases](https://docs.expo.dev/eas/hosting/deployments-and-aliases.md).
- The Free plan's amounts and what costs money: [Expo pricing](https://expo.dev/pricing).
- A deploy job's `alias` and `prod`, and a push's commit message in `on.push.if`: [Expo Workflows syntax](https://docs.expo.dev/eas/workflows/syntax.md), [Web deployments](https://docs.expo.dev/eas/hosting/workflows.md).
- The release workflow: a `require-approval` job waits until someone signed in to the Expo account approves it (within 30 days), and a deploy job with `prod: true` goes to the production address: [Expo Workflows: pre-packaged jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs.md), [Deployments and aliases](https://docs.expo.dev/eas/hosting/deployments-and-aliases.md). More in `skills/launch-prep/sources.md`.
