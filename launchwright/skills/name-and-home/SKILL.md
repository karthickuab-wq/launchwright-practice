---
name: name-and-home
description: Suggests three names for a confirmed app idea and checks each against Google Play, a web search and the stores' name rules, never reading App Store, Spotify, YouTube or Apple Podcasts pages; the user picks. Then gives the app its own home - its own place on GitHub from the Launchwright starter and its own Claude project - through the user's own taps with Where, Do and You'll see, and moves the idea's files across. Use after the market check (or when it's skipped), when the user asks to name or rename an app, or when they say set up followed by the new app's name in its new project.
---

# The name, and the app's own home

Spec screen 6. The idea has a confirmed description and, usually, a market check. Now it gets its final name, chosen by the user from three that Claude has checked, and then its own home: its own place on GitHub, made from Launchwright's starter, and its own Claude project, where every later stage runs. Ideas live in the home project until this moment; only the one the user picks gets a home of its own (spec section 3, and choice 2 in its section 14).

This is the Researcher's job for the name check (spec section 2.2; top model, medium effort), and the coordinator's for the home. Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message: one question at a time, two to four tap options with the recommended one first, and **Where / Do / You'll see** for anything done outside the chat. As there, every line the user sees is written below as a quoted line; adapt the words to the moment, keep the shape.

## What's in this folder

| File | What it is |
| --- | --- |
| `skills/name-and-home/sources.md` | The stores' name rules, what the name check may and may never read, and what GitHub's and Expo's docs say about the home, each with its source and date |
| `skills/name-and-home/examples/usewell.md` | A dry run on the walkthrough's sample idea, with real searches and pages read on Nov 18, 2026. It made nothing real |

In a project, the kit keeps this folder as launchwright/skills/name-and-home/. It writes to the home project's ideas folder (ideas/<idea>/), and, in the app's new project, to the kit's settings (launchwright/kit.json) and the project folder (project/).

## The rules for the name check

1. **The name is the user's.** Claude suggests and checks; the user chooses, and may type a name of their own, which is checked the same way. Claude never picks for them, and never goes on without their tap.
2. **Never read these pages,** for any reason, by any tool: Apple's App Store pages (apps.apple.com) and Apple's other media pages, Spotify, YouTube, and Apple Podcasts (D-23; Apple's terms). Nor sites that copy App Store pages, such as app-tracking sites that show an App Store listing's text and ratings: they're the App Store's content by another road. `skills/market-check/sources.md`, "Never read these pages", has the reasons and dates; `sources.md` here, "What the check never reads", adds the copying sites. Any other site, such as a company's own website or a trademark listing: before opening a page there for the first time, check the site's terms for automated reading and AI use and honour its robots.txt, as the market check does (its rule 4). If the terms forbid it, or can't be read, use the search result's title only.
3. **iPhone apps are found only through web search results.** A result's title and link may be used to say an app with that name exists, and nothing more: never a rating, a download count or a description from the result, and never by opening its page.
4. **Google Play: one listing at a time,** only `/store/apps/details` pages, found through web search, never through the store's own search (its robots.txt disallows it; `skills/market-check/sources.md`, "Google Play"). Open only the listings that bear on a clash: an app with the same or nearly the same name, closest first, at most three per name.
5. **It isn't a trademark search,** and Claude says so every time it shows the names. If a web search happens to show a trademark for the same word, say so as "seen in search results", with what it covers if the result says, and nothing more: never a judgement on whether it matters. Whether to ask a lawyer is the user's call.
6. **Every finding has its source and its date,** in the user's time zone (the kit's settings), and is copied exactly: "10+ downloads", "Updated on Jan 28, 2026".
7. **Nothing is sent anywhere.** The check only runs web searches and reads public pages. It never signs in, never registers a name, a web address or an account, and never uses a paid tool.

## 1. When it runs

| When | What happens |
| --- | --- |
| **The market check is done** (screen 5 answered), or the user skipped it | Section 2, in the home project |
| **The user asks** to name the app, or for more names | Section 2; "Suggest more" gives three new names |
| **The user wants to rename** an app that already has its home | Only the name check (sections 2 to 4). Renaming its place on GitHub, its project or its store listing is the user's step, and a store name may already be in use: say both in one line, and record the new name in the decisions |
| **The user says "set up" and the app's name** in the app's new project | Section 7 |
| **The idea started in an app's own project** (the kit's type is expo or web, not home) | Only the name (sections 2 to 4, then section 5's records); it already has its home |

## 2. Three names

Read first, without saying anything to the user yet: the confirmed description (the working name, the pitch, who it's for, what version 1 does, where it runs), the market check (the closest apps' names, so none of the three sounds like them), and the source note (anything the user said about names).

Then pick three names that:
- say something true about what the app does or how it feels, for the people in the description
- are easy to say aloud and to spell after hearing them once, since people recommend apps by voice
- are 30 characters or fewer, the store name limit (`sources.md`, "The stores' name rules"), and shorter is better
- don't use words the stores refuse in a name, such as "Free", "No Ads", "#1" or a price, and no emoji
- don't sound like a closest competitor from the market check, or a big brand
- differ from each other: one plain, one made-up word, one that says what it does, for example

Keep the working name as one of the three only if it still fits. Recommend the one with the fewest clashes and the clearest meaning, and say why in one line.

## 3. Check each name

For each name, in this order:

1. **The stores' rules.** Count the characters, and check the words against `sources.md`, "The stores' name rules". A name that breaks one is replaced before anything is shown.
2. **Google Play.** A web search for the name limited to play.google.com. Open the closest listings (rule 4), one at a time, as `https://play.google.com/store/apps/details?id=<app id>&hl=en_US&gl=US` (change gl to the country the app is for first). Note each one's name as shown, maker, downloads, last updated, and what it does in a few words.
3. **iPhone.** A web search for the name and "app". Note any App Store result whose title is the same or nearly the same name, from the result's title only (rules 2 and 3). The App Store holds each name for one app only, so an exact match there may mean the name can't be used as it is (`sources.md`); the only sure check is when the app is set up in App Store Connect, at launch preparation.
4. **The web.** A web search for the name on its own, and as a company or brand. Note anything big with the same name, especially in the same field, and any trademark the results show (rule 5).

Then sort each name into one of three:
- **Clear:** no app or business with the same name in the same field.
- **Worth a look:** the same name on a small app in another field, a near match, or a trademark seen in search results.
- **Clash:** an app or brand with the same name in the same field, or an exact App Store match. Replace it with another name and check that one, so the user always sees three that can be picked.

## 4. Screen 6 · The names

> Three names for <working name>, checked in Google Play and on the web:
> • **<Name 1>**: <one line: clear, or what was found>
> • **<Name 2>**: <one line>
> • **<Name 3>**: <one line>
> I can't read the App Store, so for iPhone I checked search results only. This isn't a trademark search.
> The name is yours to choose. Or type one of your own, and I'll check it the same way.
>
> • <Name 1> *(recommended: <why, in a few words>)*
> • <Name 2>
> • <Name 3>
> • Suggest more

Name the most important finding in each line, plainly: "a book-tracking app with only a handful of downloads uses it in Google Play", "a trademark for kitchen appliances shows up in search results". Keep the sources for the decisions file (section 5), not the message.

**The user picks a name with a finding** (worth a look): take it, say the finding once more in one line, and record it. Never ask twice.

**The user types their own name:** check it (section 3), then show it alone:

> **<Their name>**: <what was found>. This isn't a trademark search.
>
> • Use <their name> *(recommended)*
> • Show me the three again

If it's a clash, say so plainly and recommend one of the three instead; it's still their choice.

## 5. Record the name

In the home project, in the idea's folder (ideas/<idea>/), then commit and push to the home project's working branch, as its `AGENTS.md` says:

1. **The description:** under Working name, add one line: "Chosen name: <Name> (screen 6, <date>)." Nothing else in the confirmed description changes.
2. **The source note** (source.md): "Named <Name> on <date>; moving to its own home, <home name>." The home name is the name in lowercase with hyphens: usewell, nibble-soon.
3. **The check itself,** in a file named names.md next to the description: each name, its sort (clear, worth a look, clash), and every finding with its source and date. The user's choice goes in the project's decisions later (section 7), with this file.

Then section 6, in the same message as the next step.

## 6. Screen 6 · The app's own home

Three steps by the user, each checked before the next. Claude can't make them: it has no way to make a place on GitHub or a Claude project in the user's account, and its access reaches only places that already exist (`skills/setup-assistant/sources.md`, "O4"). All three are on websites, so they should work in the phone's browser; that isn't tried yet, so each offers the computer too.

**Private or public.** Ask once, before the first step. Making something public is the user's call (spec choice 12):

> <Name> gets its own home now: a place on GitHub for its files, and its own Claude project. It's private unless you choose otherwise.
>
> • Keep it private *(recommended: it holds your plans and your time zone)*
> • Make it public

**Step 1, its place on GitHub, from the starter:**

> **Where:** github.com, signed in, on the launchwright-starter page, github.com/karthickuab-wq/launchwright-starter. Your phone's browser should work; a computer is easier.
> **Do:** tap "Use this template", then "Create a new repository". Name it <home name>, choose "Private", and tap "Create repository".
> **You'll see:** your new <home name> page on GitHub, with a folder called launchwright.
>
> • Done *(recommended)*
> • It says the name is taken
> • I'll do it on a computer later

Write "Public" instead of "Private" if they chose public. If the name is taken (they already have something called that), suggest the name with "-app" on the end, and record the home name they used.

**Step 2, Claude's access to it.** Only if setup recorded "only the ones I pick" for GitHub access (the home project's decisions, under Setup). With "all", skip it.

> Claude can only reach the places on GitHub you've added. Let's add <home name>.
> **Where:** github.com, signed in, then your picture, Settings, Applications, Installed GitHub Apps, then Configure next to Claude.
> **Do:** under "Repository access", add <home name> to the list, and tap Save.
> **You'll see:** <home name> in the list.
>
> • Done *(recommended)*
> • I can't find it

The place's own settings page can't do this; only the Configure page can (lesson 17).

**Step 3, its own Claude project,** on the app's own place only. The home project's place isn't added: every thread would load its rules too. The first thread fetches the idea's files from it by itself (section 7).

> **Where:** claude.ai/code in your browser, then "Projects", then "New project". The Claude app on your phone may work too.
> **Do:** name it "<Name>". Under Context, tap the plus button and pick <home name>. Tap Create. Then open the project's settings, "Environment", and choose "Launchwright".
> **You'll see:** "<Name>" open, with Launchwright as its environment.
>
> • Done *(recommended)*
> • I'm stuck

If setup found a Plugins section in a project's settings (the home project's decisions, under Setup: the plugin's path), add one line to the Do: "Then, in the project's settings, Plugins, add Launchwright." Otherwise say nothing about plugins.

**"I'm stuck"** asks for a screenshot and works through it. **"On a computer later"** records a user task with a do-by date of the next day, with the kit's status script's ask command at the do-by level, under the id U-home; nothing else for this idea can start until it's done, so say so in one line. Another idea can carry on meanwhile.

**Then, the hand-over:**

> All set. Now open <Name>'s own project and say "set up <Name>". Everything for <Name> happens there from now on.
> **Where:** the Claude app, the Code tab, then Projects, then <Name>.
> **Do:** start a new chat there and say "set up <Name>".
> **You'll see:** Claude checks its new home and moves your idea across.
>
> • Got it *(recommended)*

## 7. In the new project: "set up <Name>"

The first thread in the app's own project. Before saying anything to the user:

1. **Check the home.** The app's place is there, holds the starter (launchwright/kit.json, AGENTS.md, the project folder, the app folder), and its kit settings have no name yet. Then add launchwright-home to this thread only, the way a cloud thread adds a repository its task needs (`sources.md`, "The app's own home"): same GitHub owner, so no step for the user, and the next thread starts without it. If either is missing, say which step to look at, with its Where / Do / You'll see again, and stop:
   > I can't see <home name> yet. Check step 2: Claude's access on GitHub.
   > • I've fixed it, check again *(recommended)*
   > • I'm stuck
2. **Fill the kit's settings** (launchwright/kit.json) with a file edit: name is the chosen name; type is expo when the description says it runs on iPhone or Android, web when it runs only on the web; appPath is app; timeZone is copied from the home project's kit settings. The review window stays empty: the question sweep asks it.
   The app folder already holds the phone app starter and its Expo workflows (spec section 2.5). For a phone app, leave it as it is: the build plan's first piece makes it the app. For a web-only app, replace the app folder's files, except its .eas folder, with the web starter the kit keeps, and say in the report that the web workflows come with the next kit update, which the user accepts on GitHub. If the kit holds no web starter yet, record type web, leave the app folder alone, and say so in the report: the build plan's first piece then stops at its handoff check instead of building on the wrong starter.
3. **Move the idea's files.** Copy ideas/<idea>/description.md, market.md, source.md and names.md into the project folder (project/), over the kit's unfilled templates. Then:
   - project/decisions.md, under "Decided by the user": "<date>: named <Name>, from <the three names>; see names.md." Any finding they chose past goes with it. And "<date>: home kept private" (or public).
   - Read nothing else from the home project, and never write there. The home project's own thread recorded the move in its source note (section 5).
   - If the thread can't add launchwright-home to itself, ask the user to add it to this project for now:
     > I need to read your idea from your home project once. Can you add it here for a minute?
     > **Where:** this project's settings, then "Environment".
     > **Do:** add launchwright-home.
     > **You'll see:** launchwright-home listed with <home name>.
     Once the files are across, ask them to take it out again, by screenshot of the same page (the docs don't name the control), so later threads don't load the home project's rules.
4. **Commit and push** to this project's working branch, as its `AGENTS.md` says.
5. **Tell the user, and go on.** One message: what's done in one line, then the rules check, which runs next and shows screen 7 (`skills/rules-check/SKILL.md`):
   > <Name>'s home is ready, and your idea is in it.

The design direction comes after the rules check (`skills/design-direction/SKILL.md`).

## 8. Two parts of the home that come later

Screen 6's spec also gives the app its own keys environment and connects it to Expo's GitHub app. Neither can be done usefully now, so each waits for the stage that needs it, and screen 6 says nothing about them:

- **The keys environment** is made the first time the app needs a key, by the keys skill (`skills/keys/SKILL.md`, section 4, "Row 1"). Until then it would sit empty, and every app doesn't need one.
- **Expo's link to GitHub** needs an Expo project, which the app's first build from the user's computer makes (the build plan's task U-first-build; `skills/build-plan/SKILL.md`). Expo can start builds from GitHub only after that first build anyway (`sources.md`, "Expo's link to GitHub"). Right after it, in the same sitting:
  > One more step so Expo can build <Name> by itself from now on.
  > **Where:** expo.dev, signed in, on <Name>'s page, then its GitHub settings.
  > **Do:** link <home name>, the place on GitHub with <Name>'s files, and accept what Expo's GitHub app asks for if it asks. Then set "Base directory" to app, and save.
  > **You'll see:** <home name> linked, with app as the base directory.

  Expo's docs give the page's address (expo.dev, then accounts, the account, projects, the project, then github) but not the menu's labels, so if the user can't find it, ask for a screenshot and find it with them; record the labels in `sources.md`. The base directory is needed because the app's files sit in the app folder, not at the top (`sources.md`).

## 9. Picking up later

The user may stop anywhere. Everything is in files, so a new thread picks up from them:
- **ideas/<idea>/names.md is there, no name chosen:** show screen 6 again from it, if the check is less than a week old; otherwise check again.
- **A name is chosen, the home steps aren't done:** ask which step they reached, and go on from there.
- **In the new project, the kit's settings have a name:** the move is done; go on to the rules check if project/rules.md is still the kit's template.

## 10. Never

- Read an App Store, Spotify, YouTube or Apple Podcasts page, or a site that copies one (rule 2).
- Choose the name for the user, or say a name is free to use, safe, or not a trademark.
- Register, buy or reserve anything: a web address, a store name, an account.
- Make a place on GitHub, a Claude project or an environment for the user, or change their settings: they make each one, with Where / Do / You'll see.
- Make anything public without the user's choice.
- Write to the home project from the app's project, or anywhere else from the home project but its own place.
