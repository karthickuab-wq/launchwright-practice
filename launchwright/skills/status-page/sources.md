# Sources for the status-page skill

What `skills/status-page/SKILL.md` and `skills/status-page/publish-claude.md` rest on, each with its source and the date it was read or tested.

## ntfy on the phone

- **Subscribing:** install the app (App Store or Google Play), open it, add a topic by typing its name, and tap **Subscribe**. Topic names are public, so pick one that can't be guessed. Source: [ntfy: Getting started](https://docs.ntfy.sh/), read Nov 18, 2026.
- **The name is the password:** on ntfy.sh without access control, "your topic name functions as a password", and the user is responsible for one that can't be guessed. Source: [ntfy: Terms of Service](https://docs.ntfy.sh/terms/), "Topic names", and [ntfy: FAQ](https://docs.ntfy.sh/faq/), read Nov 18, 2026.
- **Priorities on the phone:** 5 (max) is a long vibration burst with a pop-over; 3 (default) a short vibration and sound; 2 (low) no vibration or sound, and it doesn't show until the notification drawer is pulled down. The kit's alert script sends blocking at 5, do-by at 3 and fyi at 2. Source: [ntfy: Publishing, Message priority](https://docs.ntfy.sh/publish/), read Nov 18, 2026.
- **Android instant delivery:** without it, ntfy from Google Play delivers ntfy.sh's messages through Firebase, and they "may arrive with a significant delay (sometimes many minutes, or even hours later)". Instant delivery keeps a connection open and uses more battery. The docs don't say on which screen it's switched on. Source: [ntfy: Subscribe from your phone](https://docs.ntfy.sh/subscribe/phone/), "Instant delivery", and the FAQ, "What is instant delivery?", read Nov 18, 2026.
- **The iPhone app** is, in its author's words, "very bare bones and quite frankly a little buggy". Source: [ntfy: FAQ](https://docs.ntfy.sh/faq/), read Nov 18, 2026.
- **Tapping an alert** opens the link sent in its Click header in the browser, or in an app that registered for it. Source: [ntfy: Publishing, Click action](https://docs.ntfy.sh/publish/), read Nov 18, 2026.
- **Limits on ntfy.sh:** 250 messages a day; 60 requests at once, then one every 5 seconds; a message up to 4,096 bytes; a title up to 1 KB. Source: [ntfy: Publishing, Limitations](https://docs.ntfy.sh/publish/), read Nov 18, 2026.
- **Free and best effort:** ntfy.sh can be used free, without an account, under rate limits, with no uptime guarantee. Source: [ntfy: Terms of Service](https://docs.ntfy.sh/terms/), "Free tier" and "Service availability", read Nov 18, 2026.
- **Held alerts aren't reliable.** ntfy can deliver an alert from 10 seconds to 3 days ahead, and its docs say that sending again with the same id replaces it and a DELETE on that id withdraws it (ntfy 2.16, Jan 24, 2026). Tested on ntfy.sh on Nov 17, 2026, neither held up: a DELETE never stopped a held alert (0 of 3), and a replacement stopped the earlier version only 2 times out of 7. So nothing here holds an alert for later. Sources: [ntfy: Publishing](https://docs.ntfy.sh/publish/), [ntfy 2.16 release](https://github.com/binwiederhier/ntfy/releases/tag/v2.16.0), and tests on a throwaway topic, Nov 17, 2026.
- ntfy's terms and AI policy (read Nov 18, 2026) don't forbid reading the docs with AI tools.

## The cloud environment

- Environments are added and edited from the environment selector under the message box at claude.ai/code: find the environment under **Cloud**, select the settings icon on its right, then the dialog's **Network access** or **Environment variables** row, and save with **Save changes**. Variables are one `KEY=value` per line. A running session keeps the values it last read until its machine is restored or rebuilt, so a new value is tested from a new session. Source: [Claude Code: Cloud environments](https://code.claude.com/docs/en/cloud-environments), "Configure your environment" and "Set environment variables", read Nov 18, 2026.

## Claude artifact pages

- A page is one complete HTML document; inline scripts and styles work, and requests to other hosts are blocked. A new artifact is visible to its owner only, and the artifact tools can't change who sees it: the owner shares it from its page on claude.ai. Republishing passes the artifact's slug and the live version as base_version; a conflict names the live version; an artifact shared with users, an organization or the public also needs shared_live. Source: Claude's artifact tools, their "pages" guide, read Nov 18, 2026.
- **Who has the publishing tool.** Tested Nov 18, 2026 (the build's day-1 checks): a thread in a Claude Project can publish a Claude artifact page, which keeps comments. A plain cloud session started on its own was not tested and may not list the tool, so the skill doesn't count on it.
- **Tested Nov 18, 2026 (P3.B5):** the kit's page for the sample app was published from a file, came back private (read "owner") at a claude.ai/artifact link, and was republished after a status change at the same link, with the new version live. Opening the link in a browser without a signed-in Claude account stops at a sign-in check, so a person opens it on their phone to confirm it.
