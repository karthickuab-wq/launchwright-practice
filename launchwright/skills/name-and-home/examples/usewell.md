# Dry run: the name and the home for Use It Up

A dry run of the name-and-home skill on the walkthrough's sample idea, done on Nov 18, 2026, from Launchwright's own cloud build environment. The idea and its description are made up (idea intake's dry run, `skills/idea-intake/examples/podcast-link.md`, and the market check's, `skills/market-check/examples/usewell.md`), but the name check is real: every search, page and date below was really read that day. The user's time zone is America/Chicago, so every date is Chicago's. Lines starting with `>` are what Claude shows the user.

**These findings were true on Nov 18, 2026.** They are an example of the method, not facts to reuse; a real check searches again that day (the skill, rule 6).

**Nothing real was made.** The home steps (sections 6 and 7 below) are shown as the user would see them; no place on GitHub, Claude project or environment was created, and no file was written outside this example.

## 1. What Claude read first

- **The description:** Use It Up, an app that tells you what to cook tonight from the food in your kitchen that's about to go off. For busy households. iPhone and Android first.
- **The market check:** closest apps NoWaste, SuperCook, Friio and, from search results, AI Fridge, so no name should sound like them; both tweaks taken, including "lead with tonight's dinner".
- **The source note:** nothing said about names.

## 2. The names Claude picked first

| Name | Why | Characters |
| --- | --- | --- |
| Usewell | Made-up word: use your food well. Easy to say and spell | 7 |
| Shelfmate | A friendly helper for the shelf | 9 |
| Nibble Soon | Says what to do: eat it soon | 11 |

All three are under 30 characters and use no word the stores refuse (`skills/name-and-home/sources.md`, "The stores' name rules", read Nov 18, 2026).

## 3. What the check found

Searches run (Nov 18, 2026): "Usewell" app; "Shelfmate" app; "Nibble Soon" app; each name limited to play.google.com; "usewell" as a company, brand or product. Then, for the replacement name, "Cook It Soon" app, and "Cook It Soon" limited to play.google.com.

**Google Play listings opened,** one at a time, each at `https://play.google.com/store/apps/details?id=<id>&hl=en_US&gl=US`:

| Listing | Name as shown | Maker | Downloads | Updated | What it does |
| --- | --- | --- | --- | --- | --- |
| io.prod.shelfmate | ShelfMate | ShelfMate | 10+ | Jan 28, 2026 | Stock and inventory tracking for businesses |
| com.shelfmate.app | Shelfmate | Kunaynay | 10+ | Feb 7, 2026 | Cataloguing your paper books |
| com.uwell.care | Uwell Care | Uwell Inc. | 1K+ | May 13, 2026 | A paid health care service |
| com.nibblet.app | Nibblet - Recipe Saver | Nibblet | 100+ | Feb 11, 2026 | Saving recipes (Food & Drink) |
| yt.thirtynine.cookitnow | (none) | | | | Search results named it "Cook It Now. Recipes"; the page was "Not Found" in the US store, and gone without a country too. Left out, like market check's out-of-date result |

**Never opened:** every apps.apple.com result (Apple's terms), and the sites that copy App Store listings that the searches returned (appgoblin.info, mwm.ai, appshunter.io; `skills/name-and-home/sources.md`, "What the check never reads"). The App Store names below are from search results' titles only.

**Seen in search results, page not opened:**
- App Store results titled "Shelfmate: Book Tracker" and "ShelfMateApp".
- App Store results titled "Uwell" (a health service) and similar health apps, "Youwell", "Uwell Care". None is "Usewell".
- App Store results titled "Nibble: Your Bite of Knowledge", "Nibble Food", "BLW Baby Food: Nibble" and "Nibblet - Recipe Saver". None is "Nibble Soon".
- A trademark: results from trademark-listing sites (markinton.com, trademarks.justia.com) show "USEWELL" registered to Yiwu Hongmeng Electronic Technology Co., Ltd., for appliances that include lamps, refrigerators, rotisseries and fans.
- App Store results titled "Cook It NOW. Recipes" (recipes from what's in your fridge) and "Cook It Later". None is "Cook It Soon".

**Sorted** (the skill, section 3):
- **Shelfmate: clash.** The same name on two Google Play apps and in two App Store results; the App Store holds each name for one app only. Replaced by **Cook It Soon** and checked the same way.
- **Usewell: worth a look.** No app with the name in either store; a trademark for the word, for home appliances, seen in search results.
- **Nibble Soon: worth a look.** No app with the name; several food apps start with "Nibble", the closest Nibblet - Recipe Saver.
- **Cook It Soon: worth a look.** No app with the name; "Cook It NOW. Recipes" in App Store results does the same job with a near name.

## 4. Screen 6, as the user saw it

> Three names for Use It Up, checked in Google Play and on the web:
> • **Usewell**: no app uses it in either store. A trademark for the word, for home appliances like fridges, shows up in search results.
> • **Nibble Soon**: no app uses it, but several food apps start with "Nibble".
> • **Cook It Soon**: no app uses it, but an iPhone app called "Cook It NOW" does the same job.
> I can't read the App Store, so for iPhone I checked search results only. This isn't a trademark search.
> The name is yours to choose. Or type one of your own, and I'll check it the same way.
>
> • Usewell *(recommended: no app uses it, and it says what it does)*
> • Nibble Soon
> • Cook It Soon
> • Suggest more

The user tapped **Usewell**. It has a finding, so one line, once:

> Usewell it is. I've noted the trademark in your decisions, in case you want someone to look at it before you spend money on the name.

## 5. What was recorded in the home project

- ideas/use-it-up/description.md, under Working name: "Chosen name: Usewell (screen 6, Nov 18, 2026)."
- ideas/use-it-up/source.md: "Named Usewell on Nov 18, 2026; moving to its own home, usewell."
- ideas/use-it-up/names.md:

```markdown
# The name check

Checked on Nov 18, 2026, for Use It Up. Times are America/Chicago. Not a trademark search.
The App Store's pages and sites that copy them weren't read (Apple's terms); iPhone names are from web search results only.

## Usewell: worth a look (chosen)
- Google Play: no app named Usewell. Closest, Uwell Care by Uwell Inc., 1K+ downloads, a health service. Source: [Uwell Care, Google Play](https://play.google.com/store/apps/details?id=com.uwell.care&hl=en_US&gl=US), read Nov 18, 2026.
- iPhone: no result named Usewell; "Uwell" and "Youwell" health apps. Seen in search results, page not opened.
- The web: a USEWELL trademark held by Yiwu Hongmeng Electronic Technology Co., Ltd., for appliances including lamps, refrigerators, rotisseries and fans. Seen in search results (markinton.com, trademarks.justia.com), page not opened.

## Nibble Soon: worth a look
- Google Play: no app named Nibble Soon. Closest in food, Nibblet - Recipe Saver by Nibblet, 100+ downloads. Source: [Nibblet - Recipe Saver, Google Play](https://play.google.com/store/apps/details?id=com.nibblet.app&hl=en_US&gl=US), read Nov 18, 2026.
- iPhone: "Nibble: Your Bite of Knowledge", "Nibble Food", "BLW Baby Food: Nibble". Seen in search results, page not opened.

## Cook It Soon: worth a look
- Google Play: no app named Cook It Soon. "Cook It Now. Recipes" showed in search results, but its page was not found on Nov 18, 2026.
- iPhone: "Cook It NOW. Recipes", recipes from what's in your fridge, and "Cook It Later". Seen in search results, page not opened.

## Shelfmate: clash, replaced
- Google Play: ShelfMate by ShelfMate, 10+ downloads, inventory for businesses; Shelfmate by Kunaynay, 10+ downloads, book cataloguing. Sources: [ShelfMate](https://play.google.com/store/apps/details?id=io.prod.shelfmate&hl=en_US&gl=US) and [Shelfmate](https://play.google.com/store/apps/details?id=com.shelfmate.app&hl=en_US&gl=US), Google Play, read Nov 18, 2026.
- iPhone: "Shelfmate: Book Tracker" and "ShelfMateApp". Seen in search results, page not opened.
```

## 6. The home steps, as the user would see them

Not done in this dry run. The user would see, one at a time, each after the last was done:

> Usewell gets its own home now: a place on GitHub for its files, and its own Claude project. It's private unless you choose otherwise.
>
> • Keep it private *(recommended: it holds your plans and your time zone)*
> • Make it public

> **Where:** github.com, signed in, on the launchwright-starter page, github.com/karthickuab-wq/launchwright-starter. Your phone's browser should work; a computer is easier.
> **Do:** tap "Use this template", then "Create a new repository". Name it usewell, choose "Private", and tap "Create repository".
> **You'll see:** your new usewell page on GitHub, with a folder called launchwright.
>
> • Done *(recommended)*
> • It says the name is taken
> • I'll do it on a computer later

The sample user chose "only the ones I pick" at setup, so step 2 comes next:

> Claude can only reach the places on GitHub you've added. Let's add usewell.
> **Where:** github.com, signed in, then your picture, Settings, Applications, Installed GitHub Apps, then Configure next to Claude.
> **Do:** under "Repository access", add usewell to the list, and tap Save.
> **You'll see:** usewell in the list.
>
> • Done *(recommended)*
> • I can't find it

> **Where:** claude.ai/code in your browser, then "Projects", then "New project". The Claude app on your phone may work too.
> **Do:** name it "Usewell". Under Context, tap the plus button and pick usewell. Tap Create. Then open the project's settings, "Environment", and choose "Launchwright".
> **You'll see:** "Usewell" open, with Launchwright as its environment.
>
> • Done *(recommended)*
> • I'm stuck

The sample user's projects have no Plugins section (the setup dry run), so nothing about plugins.

> All set. Now open Usewell's own project and say "set up Usewell". Everything for Usewell happens there from now on.
> **Where:** the Claude app, the Code tab, then Projects, then Usewell.
> **Do:** start a new chat there and say "set up Usewell".
> **You'll see:** Claude checks its new home and moves your idea across.
>
> • Got it *(recommended)*

## 7. "set up Usewell", as it would run

Not done in this dry run. The first thread in the Usewell project would:
1. Find usewell with the starter's files and an empty type in its kit settings, then add launchwright-home to itself only, and find ideas/use-it-up/.
2. Set the kit's settings: name Usewell, type expo (the description says iPhone and Android), appPath app, timeZone America/Chicago from the home project. The review window stays empty for the question sweep.
3. Copy description.md, market.md, source.md and names.md from ideas/use-it-up/ into project/, and add to project/decisions.md, under "Decided by the user":
   - "Nov 18, 2026: named Usewell, from Usewell, Nibble Soon and Cook It Soon; see names.md. Chosen knowing a USEWELL trademark for home appliances shows in search results."
   - "Nov 18, 2026: home kept private."
4. Commit and push to main, the starter's working branch, and say:

> Usewell's home is ready, and your idea is in it.

followed by the rules check's screen 7 (`skills/rules-check/examples/usewell.md`).

## 8. Later

- **The keys environment:** none yet. The recipe service's key, at the question sweep, makes "Usewell keys" (`skills/keys/SKILL.md`, section 4).
- **Expo's link:** after the first test builds from the computer (U-first-build, Thu Nov 19 in the build plan's dry run), the user links usewell on Usewell's GitHub settings page on expo.dev, with "Base directory" set to app (the skill, section 8).

## 9. What this dry run showed

- **The walkthrough's sample was too tidy.** Its screen 6 said Usewell had "no clash on the web"; a real search found a trademark for the word, and Shelfmate, one of its three names, turned out to be a clash, not a "similar name". The skill shows such findings plainly and leaves the choice to the user.
- **Search results go stale:** "Cook It Now. Recipes" was in Google Play's search results but its page no longer exists. Pages prove; results only find.
- **Sites that copy App Store listings turn up in almost every name search.** They're now on this skill's never-read list.
