# What the platforms' docs say about setup

Each fact the setup assistant relies on, with its source and the date it was read. Read a page again before relying on it if the date here is more than a month old, and update this file with what changed. The plan asked P3.C4 to check two things in particular: whether Expo's website can set up Apple signing (step 9), and whether an app's home on GitHub and its Claude project can be made from the phone (open point O4).

## Plans (step 1)

- Claude Code Projects need a Pro, Max or Ultra plan, and **Projects** in the sidebar at claude.ai/code. Source: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), "Check the prerequisites", read Nov 18, 2026.

## GitHub access (steps 2 and 8)

- A project's cloud threads need the Claude GitHub App installed on each repository they use; a token from the terminal's web setup isn't enough. On a personal account, which repositories it reaches is set at github.com/settings/installations, under **Repository access**. Source: Projects, "Set up GitHub access", read Nov 18, 2026. Lesson 17 adds that the repository's own settings page can't do it.
- Claude can add a repository to a project when asked in the conversation, but only from a GitHub owner the project already uses, and only one the Claude GitHub App is installed on. Source: Projects, "Decide which repositories to add", read Nov 18, 2026.

## Expo and GitHub (step 3)

- To build from GitHub, an Expo user must have a linked GitHub account (expo.dev **Account settings** > **Overview** > **User settings** > **Connections**) and accept the Expo GitHub app's permissions; each Expo project is then linked to its repository on the project's GitHub settings page. Only an Owner or Admin of the Expo account can install the app. Source: [Expo: Trigger builds from the Expo GitHub App](https://docs.expo.dev/build/building-from-github/), "Prerequisites" and "Configure your app for GitHub", read Nov 18, 2026 (page dated Nov 2, 2026).
- **Per-app finding, for the coordinator:** the same page says that before builds can start from GitHub, the project needs "a successful build from your local machine" for each platform. CI builds also need the credentials made first by an interactive build, or an App Store Connect API key (a key file) to repair them. Source: the page above, and [Expo: Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/), read Nov 18, 2026. So every new app's first iPhone build likely needs one run of Expo's tool on the computer, not just the first app. Spec sections 1 and 7 assume a push is enough; the build-plan and launch pieces should plan for this.

## The app stores (step 4)

- **Google's tester rule:** a personal Google Play developer account created after Nov 13, 2023 needs 12 testers opted in to a closed test for 14 days in a row before it can apply for production access, and that review usually takes 7 days or less. Source: [Google Play Console Help](https://support.google.com/googleplay/android-developer/answer/14151465), read Nov 17, 2026. So the build plan starts the tester plan about three weeks before launch, with a do-by date.

## Cloud environment (step 5)

- An environment's **Network access** is None, Limited or Full. A new one starts at Limited with **Allow package managers** ticked (package registries, GitHub, cloud SDKs). Other sites go in **Allowed domains**, one per line, with `*.` for subdomains. Changes reach running sessions within about a minute. Environments are added from the selector under the message box at claude.ai/code (**New environment**, then **Add environment**); environment variables are set in the same dialog. Source: [Claude Code: Cloud environments](https://code.claude.com/docs/en/cloud-environments), "Configure your environment", "Network access" and "Default allowed domains", read Nov 18, 2026.
- ntfy.sh, expo.dev and the podcast hosts aren't on the default list, so they go in **Allowed domains** (`skills/setup-assistant/sites.md`).

## ntfy (step 6)

- On ntfy.sh "the topic is essentially a password": names are letters, digits, `_` and `-`, up to 64 characters. The phone apps subscribe by typing the topic. Source: ntfy's docs, publish.md "Picking a topic" and subscribe/phone.md, read from [ntfy's GitHub repo](https://github.com/binwiederhier/ntfy/tree/main/docs) on Nov 18, 2026 (docs.ntfy.sh is blocked in this build's environment).

## The plugin (step 7)

- Anthropic's Projects page says plugins are added in a Project's settings, under **Plugins**. On the account Launchwright was built on, Project settings showed only General, Memory, Environment, Usage and Advanced (seen Nov 17, 2026). A plugin turned on for the claude.ai account reaches every session on the account, and its skills show up in regular Claude chats too (Launchwright's own phone checks, Nov 18, 2026). Sources: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects) and [Use Claude Code in the cloud](https://code.claude.com/docs/en/claude-code-on-the-web), read Nov 17, 2026, and what that account's settings showed.
- **Not recorded yet:** whether the guard stays silent in a project that isn't Launchwright's, and the exact taps to turn the plugin on and off for the whole account. Launchwright's own phone checks (P3.U) find these; the thread that records their results writes them here, with the exact taps. Until both are here, step 7 uses the per-project path only.

## Step 9: Apple signing

**The question:** can Expo's website set up Apple signing, so the user needn't use a terminal?

**The answer: partly.** Read Nov 18, 2026, all on docs.expo.dev:

- **Making the signing credentials needs Expo's command-line tool.** "When you run `eas build`, you will be prompted to generate credentials … Generating your iOS credentials (distribution certificate, provisioning profile, and push key) requires you to sign in with an Apple Developer Program membership." Source: [Using automatically managed credentials](https://docs.expo.dev/app-signing/managed-credentials/).
- **The website only takes credentials made elsewhere.** Credentials made outside Expo "can be added … using `eas credentials` or under Select your project > Project settings > Configuration > Credentials using the Expo dashboard". Making them by hand on Apple's site is far harder than one terminal run, so the assistant doesn't use this. Source: [Apple Developer Program roles and permissions](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/).
- **Builds that run without questions** (CI, Expo Workflows, a push) need the credentials to exist first, from an interactive run, or an App Store Connect API key. Source: [Trigger builds from CI](https://docs.expo.dev/build/building-on-ci/).
- **Registering the iPhone can be done on the website side.** `eas device:create` asks "How would you like to register your devices?"; choosing **Website** gives a link or QR code opened on the iPhone, which installs a profile through Settings. Expo Workflows also has an `apple-device-registration-request` job that shows the QR code on the workflow's page on expo.dev and waits for approval there, but its follow-up build needs an App Store Connect API key. Sources: [Create and run a cloud build for iOS device](https://docs.expo.dev/tutorial/eas/ios-development-build-for-devices/), [Internal distribution](https://docs.expo.dev/build/internal-distribution/), [Pre-packaged jobs](https://docs.expo.dev/eas/workflows/pre-packaged-jobs/) (page dated Nov 18, 2026).
- **Apple's wait.** "Registering a device with Expo does not register it with Apple"; it's added when first included in a build. On a new or recently renewed membership Apple "can take up to 24–72 hours" to finish processing it, and the first build that includes it may fail; build again afterwards. Source: [Internal distribution](https://docs.expo.dev/build/internal-distribution/), "Managing devices", citing [Apple: device registration updates](https://developer.apple.com/help/account/reference/device-registration-updates/).
- **Developer Mode.** iPhones on iOS 16 and later must turn on Developer Mode (Settings > Privacy & Security > Developer Mode) to run internal builds; opening the installed app first brings up the prompt. Source: [iOS Developer Mode](https://docs.expo.dev/guides/ios-developer-mode/).

**So step 9 is:** Claude opens a terminal window running Expo's tool; the user types only their Expo and Apple sign-ins there (never in chat), picks **Website** for the phone, and installs from QR codes. Installing Expo's tool, and Node if it's missing, is a hard stop the user approves.

## O4: making an app's home and Project from the phone

**The question:** can Claude make the repository and the Project itself, and can the user do it on a phone? (Spec screen 6 falls back to a computer step if not.)

Read Nov 18, 2026:

- **The Project, from the phone: the docs say yes, untested.** "You create and use projects at claude.ai/code, in the Code tab of the desktop app, or in the Claude mobile app for iOS and Android." The step-by-step only covers the browser and the desktop app ("New project" dialog). Source: [Projects](https://code.claude.com/docs/en/claude-projects), "Create a project"; [Claude Code on mobile](https://code.claude.com/docs/en/mobile).
- **The Project, by Claude: no.** No tool or documented way for Claude to create a Project. Inside one, Claude can add a repository when asked, within the limits under "GitHub access" above.
- **The repository, from the phone: on GitHub's website, likely; not in GitHub's app.** GitHub's steps are "Use this template" then "Create a new repository" on the template's page on github.com, with no device named. GitHub Mobile's list of features (notifications, issues and pull requests, browsing, search, two-factor sign-in, Copilot) doesn't include making a repository. Sources: [GitHub: Creating a repository from a template](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-repository-from-a-template); [GitHub Mobile](https://docs.github.com/en/get-started/using-github/github-mobile).
- **The repository, by Claude: not to be counted on.** Claude's GitHub app is installed per repository, so it doesn't reach a repository that doesn't exist yet, and the docs don't say Claude can make one in the user's account. A guarded project also refuses it.
- **Then Claude's access** (if the user picked "Only select repositories") is the Configure page on github.com, and **the Expo link** is the project's GitHub settings page on expo.dev: both websites.

**So for screen 6:** the user makes the repository on github.com and the Project in the Claude app, with Where / Do / You'll see. Both should work in the phone's browser and app, but neither is tried yet: add both to the user's tries (P3.U's list, or the practice run). Until a try passes, screen 6 offers the phone path with the computer as the fallback.
