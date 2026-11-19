# What the name check reads, and what the docs say about the home

Each fact the name-and-home skill relies on, with its source and the date it was read. Read a page again before relying on it if the date here is more than a month old, and update this file with what changed. **This file says where to look and what the rules were, not what a check will find:** in a project, every finding comes from a search or page read that day.

## The stores' name rules

| Rule | What the skill does | Source | Read |
| --- | --- | --- | --- |
| **Google Play: the app name is 30 characters at most,** counting full-width and half-width characters alike. One localized name per language. "Repetitive or irrelevant keyword usage in your app name … can result in app suspension." | Every suggested name is 30 characters or fewer, and is a name, not a list of keywords | [Create and set up your app - Play Console Help](https://support.google.com/googleplay/android-developer/answer/113469?hl=en) | Nov 18, 2026 |
| **Google Play: what a title may not say.** "Your app title must be 30 characters or less." Avoid emojis and irrelevant special characters; no CAPS unless the brand is; "Words like "Free" and "No Ads" … don't belong in app titles"; no ranking claims such as "#1", "App of the year", "Popular"; "Don't use another app or entity's title or name in a manner that may mislead users"; "Make sure your title is unique, accessible, and avoid common terms." | No emoji, deal words, ranking words, or a name that sounds like another app or brand | [Best practices for your store listing - Play Console Help](https://support.google.com/googleplay/android-developer/answer/13393723?hl=en) | Nov 18, 2026 |
| **App Store: a name is held by one app only.** Seen in web search results only: Apple developer forum threads quote App Store Connect's message that the name "you entered is already being used", and a name held by an app that isn't released yet can still be taken. Apple's own help pages weren't opened (see below) | An exact App Store match is a clash. The sure check is when the app is set up in App Store Connect, the user's own step at launch preparation; the skill says it checked search results only | Web search results, Nov 18, 2026, linking to [developer.apple.com/forums](https://developer.apple.com/forums/thread/691494); not opened | Nov 18, 2026 |
| **App Store: the name is 30 characters at most,** and unique. App Review Guideline 2.3.7: "Choose a unique app name … and don't try to pack any of your metadata with trademarked terms, popular app names, pricing information, or other irrelevant phrases just to game the system. App names must be limited to 30 characters." Guideline 5.2.1: "don't include misleading, false, or copycat representations, names, or metadata" | The same 30 as Google Play, and no price, trademark or other app's name in a name | [App Review Guidelines](https://developer.apple.com/app-store/review/guidelines/), 2.3.7 and 5.2.1 (page dated Oct 16, 2026) | Nov 18, 2026 |

## What the check never reads

The pages on market check's "never read" list (`skills/market-check/sources.md`): Apple's App Store pages and other media pages (Apple's Media Services Terms and Website Terms of Use), Spotify, and YouTube, with Apple Podcasts under Apple's terms. Their reasons and dates are there; the user's rule is D-23.

Added here, Nov 18, 2026: **sites that copy App Store listings,** such as app-tracking and app-ranking sites whose pages show an App Store app's description, rating and price (seen in the dry run's results: appgoblin.info, mwm.ai, appshunter.io). Their content is the App Store's, which Apple's terms bar from automated reading, so reading it there would be the same thing by another road. They're never opened; their results' titles are treated like any search result (the skill, rule 3).

**On developer.apple.com, only the App Review Guidelines.** Karthick decided on Nov 18, 2026 that Launchwright may read Apple's developer guideline pages despite Apple's general website terms (decision D-24 in Launchwright's own build); the rules check reads them, and the name rules above quote the guidelines page. Apple's other developer pages, such as App Store Connect's help and the developer forums, aren't opened by this skill, so the "held by one app only" row stays from search results. App Store pages stay never read.

## Google Play listings

Read one at a time, only `/store/apps/details`, found through web search (`skills/market-check/sources.md`, "Google Play": Google Play's robots.txt allows those pages and disallows the store's search, read Nov 18, 2026). A listing shows the app's name, maker, downloads band, last update and description, which is all the name check needs.

Google's terms, checked again Nov 18, 2026: Google's Terms of Service bar automated access only "in violation of the machine-readable instructions on our web pages (for example, robots.txt files that disallow crawling, training, or other activities)" (https://policies.google.com/terms, as quoted in search results; policies.google.com and Google's Transparency Center, https://transparency.google/, couldn't be opened from Launchwright's build environment). Google Play's robots.txt (read the same day) still allows `/store/apps/details` and disallows `/store/search`. The Google Play Terms of Service (https://play.google.com/about/play-terms/, dated Nov 17, 2026, read that day) say nothing about automated access; their "personal, non-commercial use only" is about "Content", the apps and other items people get through Google Play. Play Console Help pages (support.google.com), where the name rules above come from, are allowed by that site's robots.txt except its search.

## Web search

A search finds names; it proves nothing about a number. A trademark seen in a search result is reported as "seen in search results", with what the result says it covers, and never looked into further: the check isn't a trademark search (the skill, rule 5).

## The app's own home

- **Making its place on GitHub and its Claude project:** the user does both on the websites, with Where / Do / You'll see; Claude can't make either. Read by P3.C4 on Nov 18, 2026: `skills/setup-assistant/sources.md`, "O4" and "GitHub access". Neither has been tried from a phone yet; that's for the practice run.
- **The home project's files, read by the app's first thread:** "Repositories you don't add are still within reach: a cloud thread can add one to itself when its task needs it", "added to this thread only. … The next thread starts without it." Once a project has repositories, "Claude can only add repositories from a GitHub owner the project already uses". Every repository in a project is cloned into every thread, with its `CLAUDE.md` loaded, which is why the app's project holds only its own. Repositories can also be added in **Project settings > Environment**. Source: [Claude Code: Projects](https://code.claude.com/docs/en/claude-projects), "Decide which repositories to add", "What threads pick up from your repositories" and "Give a project standing context", read Nov 18, 2026. How to take a repository out of a project isn't on the page; ask for a screenshot if it's ever needed.

## Expo's link to GitHub

Read Nov 18, 2026, on [Expo: Trigger builds from the Expo GitHub App](https://docs.expo.dev/build/building-from-github/) (page dated Nov 13, 2026):
- Builds from GitHub need "a successful build from your computer for each platform", an Expo user with a linked GitHub account, and the Expo GitHub app's permissions accepted.
- The link is made on "your project's GitHub settings" page on expo.dev (its address is expo.dev/accounts/[account]/projects/[projectName]/github): install the Expo GitHub app, then "link the GitHub repository to your Expo project". Only an Owner or Admin of the Expo account can install the app.
- "If your Expo project source code is in a subdirectory, then you'll need to configure "Base directory" settings for your repository on your project's GitHub settings page." A Launchwright app's code is in the app folder, so the base directory is app.
- "You can only link GitHub organization repositories to Expo organizations": a personal GitHub account goes with a personal Expo account.
