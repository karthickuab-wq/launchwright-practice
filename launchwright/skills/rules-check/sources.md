# Where the rules are: the starting list

The official pages the rules check starts from, by topic. Launchwright last read each one on the date shown. **This list says where to look, not what the rule is.** In a project, read every page again that day and write the rule from what the page says then (the skill, section 3). If a page has moved, find its new address on the same site and note the move under "Changes since the last check" in the project's rules file.

Every address here is on a site the project's cloud environment must be allowed to reach: developer.apple.com, support.google.com, developer.android.com, docs.expo.dev and expo.dev. The setup assistant's list of sites should include them.

## Apple (every app for iPhone)

| Topic | Read it when | Page | Last read by Launchwright |
| --- | --- | --- | --- |
| App Review Guidelines, the whole page | Always. Note its "Last Updated" date | https://developer.apple.com/app-store/review/guidelines/ | Nov 18, 2026 (page dated Oct 16, 2026) |
| Upcoming and current requirements: Xcode and SDK versions, minimum iOS, age rating questions | Always | https://developer.apple.com/news/upcoming-requirements/ | Nov 18, 2026 |
| Privacy details on the product page (the privacy "nutrition label") and privacy manifests | Always | https://developer.apple.com/app-store/app-privacy-details/ | Nov 18, 2026 |
| Offering account deletion in your app, with Sign in with Apple and subscriptions | The app has accounts | https://developer.apple.com/support/offering-account-deletion-in-your-app/ | Nov 18, 2026 |

**Apple's terms for its sites: settled.** Every page above links Apple's Website Terms of Use in its footer (https://www.apple.com/legal/internet-services/terms/site.html, seen on the guidelines page Nov 18, 2026). As quoted in search results (www.apple.com couldn't be opened from Launchwright's build environment), those terms bar any "robot", "spider" or other automatic device used to access, copy or monitor the site; the same terms are why Launchwright never opens App Store or Apple Podcasts pages. developer.apple.com's robots.txt doesn't exclude these pages (read Nov 18, 2026). Karthick decided on Nov 18, 2026 that the rules check keeps reading these developer guideline pages (decision D-24 in Launchwright's own build), so the list above stands as it is. App Store pages (apps.apple.com) stay never read.

Sections of the guidelines that most often shape a Launchwright app: 2.1 (complete apps, a demo account for review), 3.1.1 (in-app purchase), 3.1.2 (subscriptions), 4.5.4 (push notifications), 4.8 (login services), 5.1.1 (privacy policy, permissions, data, account sign-in and deletion), 5.1.2 (data use and sharing, including with outside AI).

## Google (every app for Android)

| Topic | Read it when | Page | Last read by Launchwright |
| --- | --- | --- | --- |
| Testing before launch for new personal developer accounts (12 testers, 14 days) | Always, unless the user's Play account is an organisation's or older than Nov 13, 2023 | https://support.google.com/googleplay/android-developer/answer/14151465 | Nov 18, 2026 |
| Target API level for new apps and updates | Always | https://developer.android.com/google/play/requirements/target-sdk | Nov 18, 2026 |
| The Data safety form | Always (it's needed even when the app collects nothing) | https://support.google.com/googleplay/android-developer/answer/10787469 | Nov 18, 2026 |
| Account deletion, in the app and from a web link | The app has accounts | https://support.google.com/googleplay/android-developer/answer/13327111 | Nov 18, 2026 |
| Payments policy: when Google Play's billing must be used | The app charges for anything | https://support.google.com/googleplay/android-developer/answer/9858738 | Nov 18, 2026 |
| Subscriptions policy: clear offer terms, cancelling from the app | The app sells a subscription | https://support.google.com/googleplay/android-developer/answer/9900533 | Nov 18, 2026 |
| Android developer verification | Always, briefly: Google registers most Play apps itself | https://developer.android.com/developer-verification | Nov 18, 2026 |

Google's whole policy list is the Policy Center in Play Console Help, https://support.google.com/googleplay/android-developer/topic/9858052 (read Nov 18, 2026). Google's other copy of it, on play.google.com, couldn't be reached from Launchwright's build environment that day; use the Help copy. Open the policy for any feature the app has that the pages above don't cover (health, money, children, location in the background, user-made content, AI-generated content).

**Google's terms for its sites** (checked Nov 18, 2026). Google's Terms of Service bar automated access only "in violation of the machine-readable instructions on our web pages (for example, robots.txt files that disallow crawling, training, or other activities)" (https://policies.google.com/terms, as quoted in search results; policies.google.com and Google's Transparency Center, https://transparency.google/, couldn't be opened from Launchwright's build environment). So a Google page may be read when its site's robots.txt allows it. support.google.com's robots.txt disallows only its search, API and forum-attachment paths, so the Play Console Help pages above may be read by their address, never through the site's search. developer.android.com's robots.txt allows its documentation, which its Content License (https://developer.android.com/license) puts under Apache 2.0 and Creative Commons Attribution 2.5. Read again before relying on them if this date is more than a month old.

## Expo (every app built with Launchwright's Expo template)

| Topic | Read it when | Page | Last read by Launchwright |
| --- | --- | --- | --- |
| Which Android and iOS versions each Expo version targets, and the Xcode it needs | Always: check the template's Expo version meets Apple's and Google's current minimums | https://docs.expo.dev/versions/latest/ | Nov 18, 2026 |
| Plans: what the free plan includes, and what costs money | Always | https://expo.dev/pricing, https://docs.expo.dev/billing/plans/ and the billing FAQ, https://docs.expo.dev/billing/faq/ | Nov 18, 2026 |

## Each outside service the app uses

No starting list: every service is different. For each one in the description or the decisions, find on the service's own site, and read:
- its terms of use or developer terms: what an app may do with its data (showing it, keeping copies, how long), whether a credit line or logo must be shown, whether commercial use needs a paid plan, and whether the terms forbid reading by AI tools (if they do, stop and tell the user; don't use the page)
- its price page: what's free, and what costs money and when
- its privacy or data page: what it keeps about the app's users, which the app's own privacy answers must cover

## Web apps

For a web app, the stores' pages don't apply. Read the hosting service's terms and price page as an outside service, and the privacy and cookie rules of the countries the app is for first, when the question sweep has answered that.
