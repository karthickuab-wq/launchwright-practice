---
name: launch-prep
description: Gets a finished app ready for the App Store and Google Play, and sends it only after the user's own tap. Use in the plan's launch phase, about three weeks before launch for Google's tester plan, and when the user asks "how do I get it in the stores?". Prepares every store answer on a page with a copy button per field, the store screenshots, the tester plan with its do-by date, and the one-time store steps, re-runs the rules check, and holds the store versions at an Approve tap on Expo's website that only the user can give. For a web app, it does the same for putting the site live.
---

# Launch preparation

The last stretch: the app works, and now it has to get into the stores. Launchwright does everything that can be prepared, and the user does what's theirs: making the app's entry on each store's website, approving their own text, recruiting Google's testers, and the tap that sends the app (brief F12; spec screens 16 and 17, section 10, open point O5).

Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message, and its section 5 on what's always the user's. As there, every line the user sees is written below as a quoted line; adapt the words to the moment, keep the shape.

In a project, this skill lives in the kit: read this file at launchwright/skills/launch-prep/SKILL.md, and run the scripts from the repo's top folder, as the kit's AGENTS.md shows. What Apple's, Google's and Expo's pages say about each step, with sources and dates, is `sources.md` in this skill's folder. `make-answers.mjs`, beside it, builds the store answers page; `examples/usewell-listing.md` is a filled-in answers file.

## The rules

1. **Prepare everything; send nothing.** Claude never submits, never sends a version to a store, never releases one, and never puts a web app live. The guard refuses each of those (spec section 2.3). The one way a version reaches a store is a run on Expo that waits for the user's Approve tap (section 6).
2. **Never say it's live** or "submitted" until the store says so: "uploaded" is what Expo did, "in review" and "live" are what Apple and Google say. When unsure, ask the user for a screenshot of the store's page.
3. **The user's text stays theirs.** Prices, the privacy policy and any legal text are drafts until the user approves them. Once approved, they're recorded (section 3) and never changed without asking again.
4. **Every fact comes from a page read for this launch.** The rules check reads every source again first (section 1). `sources.md` says where things are and what they said on its date; the page read today wins.
5. **Nothing costs money without a yes,** each time, with the free way alongside (the front door, section 5). The stores' own fees are the user's, paid at setup.

## 1. When it opens

| When | What |
| --- | --- |
| **The tester plan's day,** about three weeks before launch (the plan's U-testers task), for an app on Android when the user's Google account is a personal one made after Nov 13, 2023 | Section 5: the closed test with 12 testers |
| **The plan's launch phase** (its store answers piece, usually P4.1) | Sections 2 to 4: the rules check again, the one-time store steps, the store answers and screenshots (screen 16) |
| **The store-ready piece** (usually the last one) | Section 6: the store versions, held at the Approve tap (screen 17) |
| **The user asks** ("how do I get it in the stores?") | Say where launch stands, in three lines, and what's next |

**First, the rules check again.** At the start of the launch phase, run the rules check's before-launch round (`skills/rules-check/SKILL.md`, section 7) as its own piece, before the store answers piece. Its one line goes into screen 16. A rule that changed and needs the build goes into the plan before the store-ready piece; one that's the user's is a blocking question.

## 2. The one-time store steps

Each new app needs these once, before its first store version. Check which are done (the project's decisions and questions files, and the status script's show command). Each one not done is a task of the user's, recorded with the status script's ask command at the do-by level, with a do-by date worked back from the store-ready piece (`skills/build-plan/SKILL.md`, section 6). The plan usually has the first two; add the others the same way if it doesn't, and say so in the report.

| Task | Who | What |
| --- | --- | --- |
| **U-store-entries:** the app's entry on each store's website | The user, on a computer if they can | Section 3's answers, pasted in. Apple: App Store Connect, Apps, the add button, New App. Google: Play Console, Create app, then the Dashboard's setup tasks |
| **U-privacy:** approve the privacy policy, and the prices if the app charges | The user | Drafted from the description, the sweep's answers and the rules list, in the app's own words |
| **U-store-credentials:** the first store versions and Apple's upload key, from their computer | The user, with Claude opening the window | Section 2a |
| **U-google-key:** Google's upload key on Expo | The user, on a computer | Section 2b |

When Apple's entry exists, ask for its Apple ID (a number, not a secret) with a screenshot:
> One number I need from Apple's site, so Expo knows where to send your app.
> **Where:** App Store Connect on the web, Apps, then your app.
> **Do:** tap App Information on the left, under General.
> **You'll see:** "Apple ID" under General Information, a long number. Send me a screenshot.

Claude writes it into the app's Expo settings file, in the submit profile's iOS part, as the app's App Store Connect id, and commits it.

**The workflows are in place.** The kit puts the send-to-stores workflows (a phone app) or the release workflow (a web app) in the project's Expo workflows folder at setup. If they aren't there (a project set up before they existed), the kit update that adds them is a change the user accepts on GitHub (spec, open point O7): say so in the report, and the coordinator asks the user.

**Production keys** for the app's services (payments, email) go in at launch too, by the user, straight into the service or Expo's production environment (`skills/keys/SKILL.md`, row 4). Bring each up one at a time, through the keys skill.

### 2a. The first store versions and Apple's upload key

Expo's docs say a build must first run once from a computer, for each platform, so Expo's tool can ask what it needs and make the signing, before builds run without questions (`sources.md`, "Store builds and versions"). The test versions did that for test builds (the plan's U-first-build). Store versions are signed differently (for the App Store, not for the user's own phones), so Launchwright plans that run once more for them; the docs don't say whether it's strictly needed, and the first real launch will tell (say so in the report). Expo also needs Apple's upload key before a workflow can send anything to Apple.

The guard refuses store builds and Expo's credentials tool from Claude, by design, so the user types these. Claude opens a terminal window in the app's folder on their computer; the user types each line Claude sends.

> Two last steps on your computer before Apple can get your app. About 20 minutes, most of it waiting.
> • Start now *(recommended)*
> • Later today

On "Start now", open the window, then:
> **Where:** the window I just opened.
> **Do:** copy the line I send next, paste it in the window, and press Return. Answer Expo's questions there: your Expo sign-in, your Apple ID, password and the code Apple sends, and yes to making what it needs.
> **You'll see:** "Build finished" for iPhone and for Android. These first store versions stay on Expo; nothing goes to a store.

Send this line on its own, so it can be copied in one go:
```
npx eas-cli build --platform all --profile production
```
When both builds are done, the upload key:
> **Do:** copy the next line into the same window. Choose iOS and "production", then "App Store Connect: Manage your API Key", then "Set up your project to use an API Key for Expo Submit". Sign in to Apple if it asks.
> **You'll see:** it says the key is set up for your app.

```
npx eas-cli credentials --platform ios
```
An Android-only app needs only the first line, with android in place of all; an iPhone-only app, ios.

### 2b. Google's upload key on Expo

> Google needs a key so Expo can upload your app. You make it on Google's site and give it to Expo's site; I never see it. About 15 minutes, easier on a computer.
> **Where:** Expo's guide, at the link I send next. It walks through Google Cloud and Play Console.
> **Do:** follow it until a key file downloads. Then on expo.dev, open your project, Credentials, Android, your app's name, Service credentials, "Add a Google service account key", "Upload new key", pick the file, and Save.
> **You'll see:** the key listed under Service credentials on Expo.

Send `https://expo.fyi/creating-google-service-account` on its own line. Then ask the user to delete the downloaded file from their computer.

## 3. Store answers (screen 16)

Every answer Apple's and Google's websites ask for, in the project folder's store answers file, under the kit's headings, in the order each website asks. The format is in `make-answers.mjs`'s header: one "### " field per answer, with its limit, where it goes on the store's site, and "*Draft:*" on anything waiting for the user.

1. **Write every field** `sources.md` lists for each store the app is in, from the description, the design guide, the decisions and the rules list. The words are the app's and the description's: plain, true, and no promise the app doesn't keep. Name no other app. Never put "Best", "#1", "Free" or a price in a graphic.
2. **Mark the user's text as a draft:** the privacy policy and its link, the prices, any terms, and anything the rules list's "Who acts" gives to launch preparation.
3. **Check it** with the page script's check mode: every field answered, nothing over its limit, no placeholder, nothing like a key.
4. **The screenshots:** from the web build at phone size, the same way the checkpoint makes its design review's screenshots (`skills/checkpoint/SKILL.md`), with the app's sample data: Apple's iPhone size (a 402 × 874 screen at three times, which gives 1206 × 2622) and Google's phone size (360 × 640 at three times, 1080 × 1920). Five or six screens, the main flow first. Save them in the project's store folder and list them under "Screenshots". If a screen looks different on a phone than on the web (a native camera or map, for example), say so, and ask the user for that one from the test version on their phone.
5. **Google's two graphics:** the feature graphic (1024 × 500) and the store icon (512 × 512), made from the design guide the same way, as a page at that size. The real app icon replaces the starter's placeholder now.
6. **The page:** build it with the page script into the session's scratch folder (`--only apple` or `--only google` if the app is in one store), then publish it as a Claude artifact page, the way the status page is published (`skills/status-page/publish-claude.md`), titled "<the app's name>: store answers", icon "list". Record its link in the store answers file. Republish it when an answer changes.

Then screen 16, in one message:
> Your store answers are ready to paste, with a Copy button for each: [link]
> I also read the store rules again: nothing changed.
> Three things are yours:
> • Read and approve the privacy policy (10 minutes)
> • Make the app's entry on Apple's and Google's sites, pasting the answers (about 30 minutes, easier on a computer)
> • Google's upload key (15 minutes)
> I'll alert you on each one's day.

Each comes later as its own Where / Do / You'll see, one at a time, on its day (the status page's alerts). The privacy policy is shown to the user in full, as a page or in the chat, with:
> • I approve it *(recommended once you've read it)*
> • Change something (tell me what)

**Where the user's text lives.** Each piece the user approves has a file of its own in the project's store folder: the privacy policy in project/store/privacy-policy.md (made by launch preparation), the prices in project/store/prices.md (made by launch preparation), any terms likewise. The store answers file only points to them, because it keeps changing (the page's link, new screenshots, What's New).

**When the user approves** text: record it under "Approved by the user" in the store answers file, with the date and the file, and add that file to the guard's approvedText list in guard.json (agents may add to that list, never take from it). Never add the store answers file itself: the guard would then refuse every later edit to it. From then on the guard refuses any change to the approved file; a change is a new draft in a new file beside it, asked again.

## 4. What the stores really do

Say these plainly when they come up, and never more:
- **Apple:** Expo uploads the app to App Store Connect, where it shows in TestFlight after processing. Releasing it is the user's step there: they pick the build for the version and send it for App Review. Apple's review decides; the screen never guesses how long.
- **Google:** Expo uploads to the internal testing track only. Moving it to the closed test for the testers, and later to production, is the user's step in Play Console. A new personal account can't go to production before the tester rule is met (section 5).
- **A store version can't be pulled back** once people have it. A fix is a new version (the after-launch skill).

## 5. Google's tester plan

For an app on Android when the user's Google Play account is a personal one made after Nov 13, 2023 (ask once if the project doesn't say; it's in Play Console's account details). Google needs 12 testers opted in to a closed test for 14 days in a row before the app can apply for production, then a review that usually takes 7 days or less (`sources.md`, "Google's tester rule"). The plan's U-testers task has the date.

1. **About a week before, ask for names:** the plan's do-by alert already told the user to start asking people. Recommend 15, not 12, so one or two dropping out doesn't restart the 14 days; it's a recommendation, the rule is 12.
2. **The testers' version:** Claude prepares the Android store version (section 6) once Google's entry and its setup tasks are done; the closed test can't start before. The user approves the upload as in section 6.
3. **The closed test,** the user's step, one Where / Do / You'll see at a time:
   > **Where:** Play Console on the web, your app, Test and release, Testing, Closed testing.
   > **Do:** tap Manage track, then "Create new release", then "Add from library", and pick the newest version. Tap Next, then roll it out.
   > **You'll see:** the release listed on the closed testing page.

   Then the testers:
   > **Do:** open the Testers tab. Add an email list with your testers' emails, add your own email for feedback, and tap Save changes. Then tap "Copy link".
   > **You'll see:** the link copied. That's what your testers open to join.
4. **The invitation:** Claude drafts it in the user's voice: what the app is, the link, "stay in for 14 days, even if you stop using it", and how to send feedback. The user sends it; Claude never does (a message to real people).
5. **Record the dates:** the day the 12th tester joined is day 1 (ask the user for a screenshot of the Testers tab), so day 15 is the first day to apply. Record a do-by task for it. On that day, Claude drafts the three parts of Google's "Apply for production" form from what the testers said, and the user applies from the Dashboard.
6. **When Google says yes** (an email to the account owner), the app can go to production (section 6).

## 6. Sending to the stores (screen 17)

**The route (open point O5, settled by P3.C2).** Each store has its own workflow on Expo, placed by the kit: one starts for a version to Apple, the other for Google. Claude starts one by committing to the working branch with its word in the message: "[store-ios]" or "[store-android]" (both, for both stores). The run builds the store version, then **waits for an Approve tap on its page on expo.dev**. Only someone signed in to the user's Expo account can give it, and the project's Claude has no Expo sign-in at all, so a push by Claude can build a store version but can never send one. Reject, or 30 days without an answer, and nothing is sent (`sources.md`, "The user's tap to send"). The store's own last step (App Review, Google's tracks) is the user's too.

**The store-ready piece:**
1. Check: section 2's tasks done, the rules check's changes handled, the last checkpoint answered, every draft approved.
2. Set the version the store shows (1.0.0 for the first, then as the after-launch skill says) in the app's settings file. Build numbers count up by themselves on Expo.
3. Commit that with the store words in the message, and push. That starts the builds: one per platform, counted against Expo's free builds like any other (the plan counts them).
4. Record the ask: the status script's ask command, at the blocking level, id S-send, text "Send <the app> to the stores?". That alerts the phone.

**Screen 17,** right after the push. Claude can't see Expo's pages, so the user's tap on Expo comes once Expo shows the build done:
> Version 1.0 is ready for the App Store and Google Play. Your store answers are ready to paste.
> • Send it to the stores
> • Not yet

On "Send it to the stores", one platform at a time:
> **Where:** expo.dev, your app's project, Workflows, the newest "send-to-stores-ios" run.
> **Do:** tap the job "Send this version to Apple?" and tap Approve.
> **You'll see:** the next job, "Upload to App Store Connect", starts and turns green. If the first job is still building, the Approve button comes when it's done.

On "Not yet": leave the runs waiting (they keep for 30 days), record nothing as answered, and ask again when the user says. If a run is past 30 days, commit with the store words again.

**After the upload,** Apple first, one step at a time:
> Uploaded to Apple. Apple says it usually shows in TestFlight within 10 to 15 minutes. One last step is Apple's own:
> **Where:** App Store Connect on the web, Apps, your app, the version on the left.
> **Do:** in the Build section, tap the add button, pick the new build, tap Done, then Save. Then tap "Add for Review", then "Submit for Review".
> **You'll see:** the status says "In Review".

If App Store Connect asks export compliance questions for the build, ask the user for a screenshot and suggest the answer from what the app does, with the reason; the user picks it. Before "Submit for Review", ask how to release it once approved (Apple's Version Release setting):
> When Apple approves it, should it go out at once?
> • Yes, automatically *(recommended: no extra step)*
> • I'll release it myself

Google: the upload lands in internal testing. Before production access, it goes to the closed test (section 5). After it, the user creates the production release from the same library:
> **Where:** Play Console on the web, your app, Test and release, Production.
> **Do:** tap "Create new release", then "Add from library", pick the newest version, add what's new in a line, tap Next, then send it for review.
> **You'll see:** the release on the Publishing overview.

**Then, and only then:** when the user sends a screenshot or the store's email showing it approved and live, record the ask as answered, tell the user, and hand over to the after-launch skill. Until then, say "in review", never "live".

### A web app

There's no store. Its release workflow starts on a commit with "[release-web]" in the message: it puts this version at the release link (the preview name, then "--release", on expo.app), then waits for the Approve tap, then puts it at the production address. Screen 17 for a web app:
> Your site is ready to go live. Have a look first: [the release link]
> • Put it live
> • Not yet

On "Put it live", the same Where / Do / You'll see on expo.dev, the job "Put this version live?". A custom domain needs a paid Expo plan: a money question, asked first, with the free address alongside.

## 7. Saving

- **The store answers file** and its screenshots, as they're written; the answers page's link in it.
- **Decisions** made under the go-ahead rule (wording, which screens are screenshots), under "To review" in the project's decisions file.
- **Lessons:** anything a store or Expo did that this skill didn't expect goes in the project's lessons file, under "For Launchwright" (`skills/rules-check/SKILL.md`, section 8).
- **Commit and push** to the working branch after each step, as the kit's AGENTS.md says. The commit that carries a store word is the only one that starts a store build: never put "[store-ios]", "[store-android]" or "[release-web]" in any other commit message.
- **The status:** each piece starts and finishes with the status script; the user's tasks are do-by asks, the send is a blocking ask (section 6).
