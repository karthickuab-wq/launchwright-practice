# The sites a Launchwright environment allows

Setup step 5 sends the list below, as a message of its own, for the user to paste into the Launchwright environment's "Allowed domains" field (network access "Limited", with "Allow package managers" ticked, which already covers GitHub, npm and the other package registries; Claude Code's docs, "Default allowed domains", read Nov 18, 2026). One site per line; a leading `*.` matches every subdomain. Send only the sites, not the headings or notes.

Why each group is there, for Claude, not for the user:

- **Phone alerts:** ntfy.sh is where alerts go (`scripts/alert.mjs`).
- **Expo:** its website and docs, for builds and their status (spec sections 1 and 7).
- **Store and platform rules:** the rules check reads Apple's and Google's own pages (`skills/rules-check/sources.md`). play.google.com was refused in this build's environment on Nov 18, 2026 until allowed; support.google.com carries Google Play's policies (P3.B4). apps.apple.com isn't listed: App Store pages are never read (D-23, D-24 in Launchwright's own build; `skills/market-check/sources.md`).
- **Idea links** (spec start A): the podcast hosts that run shows' own websites and feeds. The idea-intake skill never opens Spotify, YouTube or Apple Podcasts pages, or other listening apps' (`skills/idea-intake/sources.md`), so none of those sites is listed. A show's own website on its own address can't be listed ahead; the idea-intake skill asks for a paste, and offers to add the site afterwards.
- **Not here:** a service an app uses (payments, email). Its docs' site is added when the question sweep chooses it, and its API's host goes on a network secret in the app's keys environment (`skills/keys/SKILL.md`).

```
ntfy.sh
expo.dev
*.expo.dev
expo.fyi
developer.apple.com
appstoreconnect.apple.com
support.google.com
play.google.com
developer.android.com
*.buzzsprout.com
*.libsyn.com
*.podbean.com
*.transistor.fm
*.simplecast.com
*.captivate.fm
*.substack.com
```
