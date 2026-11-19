# Dry run: the rules check for Usewell

A dry run of the rules-check skill on the walkthrough's sample app, done on Nov 18, 2026. The user's time zone is America/Chicago, so every date is Chicago's. Apple's, Google's and Expo's pages below were really read that day, from this build's cloud environment. The recipe service, Spoonbase, is made up, as in the walkthrough, so its pages weren't read; in a real check they would be (section 2, point 5). Lines starting with `>` are what Claude shows the user.

## 1. What Claude read first

- **The description** (from the idea-intake dry runs): iPhone and Android first, the web later. Version 1: add food by scanning a receipt or typing; what to use first; 15-minute recipes; a reminder the evening before. Money: free, with a paid monthly plan (Plus). Outside services: a recipe service, receipt reading, the stores' in-app purchases.
- **The decisions:** none yet. At screen 7 the question sweep hasn't run, so how people sign in, how receipts are read and where the app is offered first are still open. Rules that hang on those are filed with "if…".
- **The kit's settings:** an Expo app; time zone America/Chicago. Setup made the user's Google Play account in 2026, as a personal account.

## 2. The topics Claude listed (section 2 of the skill)

| Topic | Why |
| --- | --- |
| Apple's App Review Guidelines, current requirements, privacy details | Runs on iPhone |
| Google's tester rule, target API level, Data safety form | Runs on Android; a personal Play account made after Nov 13, 2023 |
| Expo's versions and free plan | Built from the Expo template |
| Apple's in-app purchase and subscription rules; Google's payments and subscriptions policies | Plus is a monthly subscription |
| Apple's push notification rule | The evening reminder |
| Apple's permission rules (the camera) | Receipts are scanned with the camera |
| Apple's and Google's account deletion rules; Apple's login services rule | Plus must reach all of a person's devices, so accounts are likely (the sweep decides) |
| Apple's rule on sharing data with outside AI | Only if receipts go to a service (the sweep decides) |
| Spoonbase's terms, price page and privacy page | The recipe service |

## 3. The rules list, as saved

This is the project folder's rules file after the first check, and after the short check the question sweep's answers started (section 5 below). The rules the sweep added are marked "added after the sweep".

```markdown
# The rules list

Every rule from Apple, Google and each service the app uses that affects this app. Read again before launch.

First check: Nov 18, 2026. Updated after the question sweep: Nov 18, 2026. Next check: before launch, when launch preparation starts.

## Rules that change something for this app

### R-apple-iap · Plus is bought with Apple's in-app purchase (Apple)
- **The rule:** anything that unlocks features in the app, subscriptions included, must be sold with Apple's in-app purchase. Apps should have a way to restore what people bought.
- **For this app:** Plus is an in-app purchase subscription on iPhone, with a "Restore purchases" button on the Plus screen.
- **Who acts:** the build (the Plus screen)
- **Applies because:** Money: free, with a paid plan
- **Source:** [Apple App Review Guidelines, 3.1.1](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-apple-subs · What a subscription must give and say (Apple)
- **The rule:** a subscription must give ongoing value, last at least seven days, and work on all of the person's devices. Before asking anyone to subscribe, the app must say clearly what they get for the price.
- **For this app:** Plus is monthly. The Plus screen shows the price, "every month", and the three things Plus adds, before the subscribe button. Plus follows the person to a new phone.
- **Who acts:** the build; the mockup (the Plus screen)
- **Applies because:** Plus is a monthly subscription
- **Source:** [Apple App Review Guidelines, 3.1.2(a) and 3.1.2(c)](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-google-billing · Plus is bought with Google Play's billing (Google)
- **The rule:** apps on Google Play that charge for features or subscriptions must use Google Play's billing system. Other payment methods are allowed only in some countries, after enrolling in Google's programs for them. In-app prices must match what Google Play's payment screen shows.
- **For this app:** Plus is a Google Play subscription on Android. No other payment method in version 1.
- **Who acts:** the build (the Plus screen)
- **Applies because:** Money: free, with a paid plan
- **Source:** [Google Play Console Help, "Payments"](https://support.google.com/googleplay/android-developer/answer/9858738)
- **Read:** Nov 18, 2026

### R-google-subs · Subscription terms, and cancelling from the app (Google)
- **The rule:** before someone subscribes, the app must say clearly the price, how often it's billed, that it renews by itself, and whether the app works without it. The app must say how to manage or cancel, with an easy online way to cancel, such as a link to Google Play's subscription center in the app's settings.
- **For this app:** the Plus screen says "$2.99 a month, renews every month, cancel any time", and that Usewell is free without Plus. Settings has "Manage Plus", which opens Google Play's subscriptions page.
- **Who acts:** the build; the mockup (the Plus and settings screens)
- **Applies because:** Plus is a monthly subscription
- **Source:** [Google Play Console Help, "Subscriptions"](https://support.google.com/googleplay/android-developer/answer/9900533), "Subscription Management, Cancellation and Refunds"
- **Read:** Nov 18, 2026

### R-google-testers · 12 testers for 14 days before launch (Google)
- **The rule:** a personal Play account made after Nov 13, 2023 must run a closed test with at least 12 testers opted in for at least 14 days in a row before it can apply to launch. Testers who leave and come back start their 14 days again. Google's review of the application usually takes seven days or less.
- **For this app:** about three weeks between the testers starting and the Play Store launch. The user finds the 12 testers; Claude drafts the invitation for the user to send.
- **Who acts:** the plan (the user's task, with a do-by date about three weeks before launch); launch preparation (the invitation)
- **Applies because:** the user's Play account is personal and was made in 2026
- **Source:** [Google Play Console Help, "App testing requirements for new personal developer accounts"](https://support.google.com/googleplay/android-developer/answer/14151465)
- **Read:** Nov 18, 2026

### R-both-privacy · A privacy policy, and the stores' privacy answers (Apple and Google)
- **The rule:** Apple: every app links to its privacy policy in App Store Connect and inside the app; the policy says what's collected, how it's used, who it's shared with, how long it's kept, and how to ask for it to be deleted. Apple's product page shows what the app and its outside services collect. Google: every app fills in the Data safety form, even one that collects nothing, and gives a privacy policy link.
- **For this app:** a privacy policy page, a link to it in Settings, and the answers to Apple's privacy questions and Google's Data safety form. The policy is the user's text: Claude drafts it, the user approves it.
- **Who acts:** launch preparation (the user's text to approve; the store answers); the build (the link in Settings)
- **Applies because:** every app
- **Source:** [Apple App Review Guidelines, 5.1.1(i)](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026; [Apple, "App privacy details on the App Store"](https://developer.apple.com/app-store/app-privacy-details/); [Google Play Console Help, "Provide information for Google Play's Data safety section"](https://support.google.com/googleplay/android-developer/answer/10787469)
- **Read:** Nov 18, 2026

### R-apple-camera · Asking for the camera (Apple)
- **The rule:** the app asks before using personal data or the phone's sensors, explains why in its permission message, asks only for what its main job needs, and offers another way when someone says no.
- **For this app:** the camera is asked for only when someone first scans a receipt, with the message "Usewell uses the camera to read your receipt. The photo stays on your phone." Typing the food in always works without it.
- **Who acts:** the build (the scan screen)
- **Applies because:** add food by scanning a receipt
- **Source:** [Apple App Review Guidelines, 5.1.1(ii) to (iv)](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-apple-notify · The reminder can't be required (Apple)
- **The rule:** push notifications must not be required for the app to work, must not carry sensitive information, and can't be used for promotion unless people opted in to that inside the app, with a way to opt out.
- **For this app:** the evening reminder is asked for, not required; everything works with it off. It never advertises Plus.
- **Who acts:** the build (the reminder)
- **Applies because:** a reminder the evening before
- **Source:** [Apple App Review Guidelines, 4.5.4](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-apple-delete · Deleting an account in the app (Apple), added after the sweep
- **The rule:** an app that lets people make an account must let them start deleting it in the app: the whole account and its personal data, not only turning it off. Someone with a subscription is told that billing goes on through Apple and is asked to cancel it first. An app with Sign in with Apple should revoke the person's sign-in with Apple's service when they delete.
- **For this app:** "Delete my account" in Settings, with a note about cancelling Plus and a link to Apple's subscriptions page; deleting also ends the account's link with Sign in with Apple.
- **Who acts:** the build (Settings); the mockup (Settings)
- **Applies because:** sign in with Apple and Google (Q-signin)
- **Source:** [Apple App Review Guidelines, 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026; [Apple, "Offering account deletion in your app"](https://developer.apple.com/support/offering-account-deletion-in-your-app/)
- **Read:** Nov 18, 2026

### R-google-delete · Deleting an account in the app and from a web page (Google), added after the sweep
- **The rule:** an app that lets people make an account must give them a way in the app to delete the account and its data, and a web link where they can ask for it too. The Data safety form has questions about deletion.
- **For this app:** the same "Delete my account" in Settings, and a small web page where people can ask for deletion without the app. That page is published only with the user's approval.
- **Who acts:** the build (Settings); launch preparation (the web page, and the Data safety answers)
- **Applies because:** sign in with Apple and Google (Q-signin)
- **Source:** [Google Play Console Help, "Understanding Google Play's app account deletion requirements"](https://support.google.com/googleplay/android-developer/answer/13327111)
- **Read:** Nov 18, 2026

### R-apple-login · Sign in with Google needs a private option too (Apple), added after the sweep
- **The rule:** an app that uses an outside sign-in, such as Google's, for people's main account must also offer an equal option that collects only name and email, lets people keep their email private, and doesn't track them for ads without consent.
- **For this app:** Sign in with Apple sits beside Sign in with Google, so this is met. Taking Apple's option out later would break the rule.
- **Who acts:** the question sweep (Q-signin; the chosen option meets it); the build
- **Applies because:** sign in with Apple and Google (Q-signin)
- **Source:** [Apple App Review Guidelines, 4.8](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-apple-review · A way in for Apple's reviewer (Apple), added after the sweep
- **The rule:** an app with sign-in gives Apple's review an active demo account or a full demo mode, with its back end turned on.
- **For this app:** a demo account with a few foods and Plus switched on, made at launch preparation and given only in App Store Connect's review notes.
- **Who acts:** launch preparation
- **Applies because:** sign in with Apple and Google (Q-signin)
- **Source:** [Apple App Review Guidelines, 2.1](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026

### R-expo-versions · The Expo version meets both stores' minimums (Expo, Apple and Google)
- **The rule:** Google: new apps and updates must target Android 16 (API level 36) or higher, since Aug 31, 2026. Apple: apps must be built with Xcode 26 or later and an iOS 26 SDK, since Apr 28, 2026, and target iOS 13 or later. Expo: SDK 56, 57 and 58 target Android API level 36 and need Xcode 26.4 or later.
- **For this app:** built on Expo SDK 56 or later. An older Expo version can't be sent to either store.
- **Who acts:** the build (the template's Expo version)
- **Applies because:** an Expo app for iPhone and Android
- **Source:** [Android Developers, "Meet Google Play's target API level requirement"](https://developer.android.com/google/play/requirements/target-sdk); [Apple, "Upcoming requirements"](https://developer.apple.com/news/upcoming-requirements/); [Expo, "Reference: SDK versions"](https://docs.expo.dev/versions/latest/)
- **Read:** Nov 18, 2026

### R-expo-free · What Expo's free plan covers (Expo)
- **The rule:** Expo's free plan includes up to 15 Android and 15 iOS builds a month, in a low-priority queue, and updates for up to 1,000 monthly users. A free account can't run up extra charges: once the month's free builds are used, new builds wait until the first day of the next calendar month. Paid plans start at $19 a month plus usage.
- **For this app:** the plan keeps test versions within 15 per store per month, and says so; going past it is a money question for the user.
- **Who acts:** the plan
- **Applies because:** built with Expo's build service
- **Source:** [Expo, "Pricing"](https://expo.dev/pricing); [Expo docs, "Plans and billing"](https://docs.expo.dev/billing/plans/) and its billing FAQ, "What happens when I use up the Free plan's monthly quota?" (https://docs.expo.dev/billing/faq/)
- **Read:** Nov 18, 2026

## Other rules checked

| Rule | Why nothing is needed | Source | Read |
| --- | --- | --- | --- |
| Apple: sharing personal data with outside AI needs clear disclosure and permission | Receipts are read on the phone (Q-receipts); nothing goes to an AI service | [App Review Guidelines, 5.1.2(i)](https://developer.apple.com/app-store/review/guidelines/) | Nov 18, 2026 |
| Apple: links to other ways of paying are allowed on the US storefront | Usewell uses only in-app purchase | [App Review Guidelines, 3.1.1(a)](https://developer.apple.com/app-store/review/guidelines/) | Nov 18, 2026 |
| Apple: answer the age rating questions honestly | A store form, filled in at launch preparation; no rule for the app itself | [App Review Guidelines, 2.3.6](https://developer.apple.com/app-store/review/guidelines/); [Upcoming requirements](https://developer.apple.com/news/upcoming-requirements/) | Nov 18, 2026 |
| Apple: Sign in with Apple's server notifications are required for developers based in South Korea | The user is in the US | [Offering account deletion in your app](https://developer.apple.com/support/offering-account-deletion-in-your-app/) | Nov 18, 2026 |
| Google: Android developer verification | Google registers almost all Play apps itself; nothing to do for an app sold only on Google Play | [Android developer verification](https://developer.android.com/developer-verification) | Nov 18, 2026 |
| Google: subscriptions with student or other eligibility discounts must explain who qualifies | Plus has no such discount | [Subscriptions](https://support.google.com/googleplay/android-developer/answer/9900533) | Nov 18, 2026 |
| Spoonbase: terms of use, price page, privacy page | **Not read:** Spoonbase is made up for the sample app. In a real project, its terms decide whether recipes can be kept on the phone, whether a credit line must show, and what a commercial app pays | (none) | Not read |

## Changes since the last check

First check: Nov 18, 2026.
```

## 4. What the user saw (screen 7)

Shown after the first check, before the question sweep:

> 4 store rules shape your app:
> • Google: a new personal account needs 12 testers for 14 days in a row before launch. I've planned for it.
> • Apple and Google: Plus is paid for through each store's own payment system, the standard way. I've planned for it.
> • Apple and Google: if people can sign up, they must be able to delete their account in the app. If you choose sign-in, it goes in the settings screen.
> • Apple and Google: Usewell needs a privacy policy. I'll draft it for you to approve before launch.
> The full list, each with its source and the date I read it, is saved and read again before launch.
>
> • Got it *(recommended)*
> • Show me the full list

The user taps: Got it. Claude goes on to the design direction.

The other rules (the camera message, the reminder, the Expo version, the subscription wording) change only what the build does, so the user isn't told about them here; the mockup shows the Plus and settings screens that carry them.

## 5. After the question sweep

The sweep (its own dry run, `skills/question-sweep/examples/usewell.md`) answered: sign in with Apple and Google; receipts read on the phone; $2.99 a month; the US only. Sign-in adds a feature, so the rules check ran again for that topic only: Apple's account deletion page, Apple's guidelines 4.8 and 2.1, and Google's account deletion page. It added R-apple-delete, R-google-delete, R-apple-login and R-apple-review, and moved Apple's outside-AI rule to "Other rules checked" because receipts stay on the phone.

The user had already heard about account deletion at screen 7, so the only new thing for them is the web page, which they approve at launch:

> One more store rule, now that people sign in: Google also wants a small web page where people can ask to delete their account. I'll make it; you approve it before launch.

## 6. Before launch: the check again

Run in this dry run on the same day, so it shows the steps rather than real changes. Claude opened every source in the list again: the guidelines still showed "Last Updated: October 16, 2026", and each rule's part of each page said the same. Every "Read" date stayed Nov 18, 2026, and this was added at the top of "Changes since the last check":

```markdown
### Nov 18, 2026 · before launch
Every source read again. Nothing changed.
```

and in store preparation the user saw:

> I also read the store rules again: nothing changed.

## Checked against the skill

- Every rule names its page, the section where there is one, the address, and the date read; the guidelines' own date is noted.
- Each rule says what it changes for Usewell, who acts, and the line of the description or the decision that brings it in.
- Rules that hung on the sweep were filed with "if…" at screen 7 and settled after it; nothing was asked twice.
- The made-up service is listed as "not read", with what its pages would decide, not guessed.
- The user saw four lines at screen 7 and one after the sweep: only what involves them, each with its source in a few words.
- Numbers are as the pages give them: 12 testers, 14 days in a row, seven days or less, 15 Android and 15 iOS builds a month, API level 36, Xcode 26.
