---
name: rules-check
description: Gathers the current rules from Apple, Google, Expo and every service an app will use, and saves each one in the project's rules list with its source and the date it was read. Use for every new project once its description is confirmed and it has its own home, again when a decision adds a service or a feature, and again before launch, when it flags every rule that changed. Shows the user only the rules that change something for them, in plain words.
---

# The rules check

Store and service rules change, and a rule found late can cost weeks: a missing account-deletion button gets an app turned down, and Google's tester rule adds two weeks before launch. So every project starts with the current rules, read that day from the official pages, and reads them again before it goes to the stores (brief F5; spec screen 7, and screen 16 for the check before launch).

This is the Researcher's job (spec section 2.2; top model, medium effort). It runs in the background: the user sees one short message at the end, and nothing while it reads.

Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message. As there, every line the user sees is written below as a quoted line; adapt the words to the moment, keep the shape.

A worked example, a dry run on the walkthrough's sample app, is `examples/usewell.md` in this skill's folder. Where the rules usually are is `sources.md`, also in this skill's folder.

## The rules for every check

1. **Read it today, from the official page.** Every rule comes from Apple's, Google's, Expo's or the service's own page, read during this check. `sources.md` says where to look, never what the rule is: Launchwright's own notes, rules lists from other projects, and what you remember are all out of date until a page confirms them (lesson 7).
2. **Every rule has its source and its date.** The page's name, the section (such as "5.1.1(v)"), its address, and the date you read it, in the user's time zone. If the page shows its own "last updated" date, note that too.
3. **Never guess.** If a page can't be read (the site is blocked, it needs a sign-in, it won't load), the rule is "not read", not guessed. Say so in the list, and ask the user once for the page (section 6).
4. **Don't use a page whose terms forbid AI tools reading it.** Say which page and why in the list, and ask the user to read that part themselves, with **Where**, **Do** and **You'll see**.
5. **A rule is about this app.** Read the whole page, but list a rule under "Rules that change something" only if it changes what the app does, what the user must do, what the plan or the question sweep needs, or what launch needs. Rules read that need nothing go under "Other rules checked", one line each, so the next check knows they were read.
6. **Write rules in plain words,** one or two sentences, close to the page's meaning. Never make a rule stricter or softer than the page says. Quote the few words that decide it when the meaning is close.
7. **Facts and money are said exactly.** A number, a date or a price is copied from the page as it is ("12 testers", "14 days in a row", "15 Android and 15 iOS builds a month").

## 1. When it runs

| When | What it reads | What the user sees |
| --- | --- | --- |
| **A new project:** the description is confirmed and the app has its own home (spec screen 6). Before the design direction | Everything in section 2 | Screen 7 (section 5) |
| **A decision adds a service or a feature:** the question sweep, a change to the description, or a new feature later | Only the pages for what was added | A line, only if a new rule changes something for them |
| **Before launch:** launch preparation starts (spec screen 16) | Every source in the list again, plus anything added since | One line in store preparation: nothing changed, or what changed (section 7) |
| **The user asks** ("check the rules again", "what do the stores need?") | As before launch | As before launch |

## 2. Make the list of what to read

Read, without saying anything to the user yet:
- the confirmed description: where it runs (iPhone, Android, web), what version 1 does, the money line, the outside services
- the project's decisions and the question sweep's answers, if any (how people sign in, where the app is offered, how it's paid for)
- the kit's settings, for the project's type and the user's time zone
- the project's rules list, if there is one (a later check)

Then list the topics, from the description up:

1. **Every app for iPhone:** Apple's App Review Guidelines, Apple's current requirements (Xcode, SDK, minimum iOS, age rating), and the privacy details on the product page.
2. **Every app for Android:** Google's tester rule for new personal accounts, the target API level, and the Data safety form.
3. **Built with Expo:** which Android and iOS versions the template's Expo version targets, checked against points 1 and 2, and what Expo's free plan includes.
4. **Each thing the app does that a store has rules for.** The usual ones, with the topic to read:

| If the app… | Read |
| --- | --- |
| lets people make an account | Apple's and Google's account-deletion rules; Apple's login services rule if it signs in with Google or another outside sign-in |
| charges for anything | Apple's in-app purchase rules; Google's payments policy |
| sells a subscription | Apple's subscription rules; Google's subscriptions policy |
| sends notifications | Apple's push notification rule |
| uses the camera, photos, location, contacts, the microphone or health data | Apple's privacy and permission rules; Google's policy for that kind of data |
| sends what people type or photograph to an AI service | Apple's rule on sharing personal data with outside AI; the service's own terms |
| lets people post things others can see | Both stores' rules on user-made content |
| is for children, or about health, money or betting | That category's rules in both stores (these are long; read them all) |

5. **Each outside service** in the description or the decisions: its terms, its price page and its privacy page (`sources.md`, "Each outside service").
6. **Where the app is offered first,** once the sweep has answered it: anything the stores require only there (Apple's guidelines name some rules for single countries).

Not sure whether a topic applies? Read it: a rule read and filed under "Other rules checked" costs little; a rule missed costs a store rejection.

## 3. Read each page

For each topic, open its page from `sources.md`, or find it on the official site with a web search limited to that site. Then:
- Note the page's title, address, the date and time you read it, and its own "last updated" date if it shows one.
- Find the parts that touch this app, and write each rule (section 4).
- If the address has moved, use the new one and say so in the list.
- If you can't read it, write it as "not read" with the reason, and go on with the rest (section 6).

Read the pages, not summaries of them: a blog post or a forum answer can point you to a rule, but the rule comes from the official page.

## 4. Write the rules list

The list is the project folder's rules file, under the kit's three headings. Save it as you go, so a session that stops part-way leaves what it read.

**Under "Rules that change something for this app",** one entry per rule:

```markdown
### R-apple-delete · People can delete their account in the app (Apple)
- **The rule:** if the app lets people make an account, it must let them start deleting it from inside the app. Turning it off for a while isn't enough.
- **For this app:** a "Delete my account" button in Settings, with a warning that a Plus subscription must be cancelled with Apple.
- **Who acts:** the build (the settings screen)
- **Applies because:** sign-in with Apple and Google (the question sweep, Q-signin)
- **Source:** [Apple App Review Guidelines, 5.1.1(v)](https://developer.apple.com/app-store/review/guidelines/), page dated Oct 16, 2026
- **Read:** Nov 18, 2026
```

- **The id** is "R-", who made the rule (apple, google, expo, or the service's name), and a short word for it. The plan, the mockup and launch preparation use these ids.
- **Who acts** is one or more of: the build (a screen or a feature), the mockup (a screen the user should see now), the question sweep (a choice that's the user's), the plan (a task of the user's, with a do-by date), launch preparation (a store form or the user's text to approve).
- **Applies because** names the line of the description or the decision that brings the rule in. When a rule depends on a choice the sweep hasn't made yet, write "if…" and the choice's id, and file it anyway: the sweep uses it to explain the options.

**Under "Other rules checked",** a table: the rule in a few words, why nothing is needed, the source with its address, and the date read. Pages that couldn't be read go here too, marked **Not read**, with the reason and what it leaves open.

**Under "Changes since the last check",** nothing on the first check except "First check: <date>". Later checks write here (section 7).

At the top, one line: when this check ran, and the next time it runs ("Before launch, when launch preparation starts").

## 5. Tell the user (screen 7)

Show only the rules that need the user: **Who acts** names the question sweep (a choice that's theirs), the plan (a task of theirs) or launch preparation (their text to approve), or the rule changes what the app does in a way they'd notice. Three to five lines at most, each with its source in a few words. Say what you've already done about it.

> 3 store rules shape your app:
> • Apple: if people can sign up, they must be able to delete their account in the app. I've added it to the settings screen.
> • Google: a new personal account needs 12 testers for 14 days in a row before launch. I've planned for it.
> • Apple and Google: Plus is paid for through each store's own payment system, the standard way. I've planned for it.
> The full list, each with its source and the date I read it, is saved and read again before launch.
>
> • Got it *(recommended)*
> • Show me the full list

**Show me the full list:** send the rules that change something, one line each with its source and the date read, then "and 12 more that need nothing from this app". Never send the file itself.

**If no rule changes anything for them,** say so in one line and go on:

> I read Apple's, Google's and Expo's current rules for an app like yours. Nothing needs you. The list is saved and read again before launch.

Then go on to the design direction (`skills/design-direction/SKILL.md`).

## 6. When a page can't be read

Carry on with the rest. Then ask once, in its own message right after the user answers screen 7, so they never get two questions at once. Ask them to open the page and send a screenshot of the part that matters, or paste its text:

> I couldn't open one page from here: Google's subscription rules. Could you open it and send me a screenshot?
> **Where:** support.google.com, Play Console Help, the page called "Subscriptions".
> **Do:** scroll to "Subscription Management, Cancellation and Refunds" and take a screenshot.
> **You'll see:** a section about cancelling and refunds.
>
> • Here it is
> • Later *(only that rule waits; it's read again before launch)*

If a whole site is blocked, the cloud environment probably doesn't allow it. That's usually an outside service's site, which setup couldn't know about. Ask in the same way, one site at a time:
> I couldn't open Spoonbase's website from where your app is built. May I show you how to let it in? It takes a minute.
> • Show me *(recommended: I read its terms and prices myself)*
> • Later *(only that service's rules wait)*

On "Show me":
> **Where:** claude.ai/code in your browser, on the new-session screen.
> **Do:** tap the environment button under the message box. Find "Launchwright" under "Cloud" and tap the settings icon on its right. Tap "Network access" and add the site I send next on a line of its own under "Allowed domains". Tap "Save changes".
> **You'll see:** the site in the list of allowed domains when you open it again.

Send the site's address on a line of its own, then read its pages again once the user says it's done (a change reaches running sessions within about a minute; `skills/setup-assistant/sources.md`, "Cloud environment"). If the blocked site is one of Apple's, Google's or Expo's, which setup already allows, note it under "For Launchwright" as well (section 8), since the setup's list of sites is out of date.

Save what the user sends as the source ("a screenshot of <page> the user sent, Nov 18, 2026").

## 7. Before launch: the check again

When launch preparation starts (`skills/launch-prep/SKILL.md`), or when the user asks:

1. **Read every source in the list again,** on the day, and any topic the app has gained since (a new feature, a new service, the countries chosen).
2. **Compare** each rule with what the page says now. A rule changed when its meaning changed, not when its wording did.
3. **Write the result under "Changes since the last check"**, newest first, with the date: each changed, new or removed rule, what it now says, the source, and what it means for the app. Update the rule's own entry and its "Read" date; keep the old wording in the change note.
4. **Update every rule's "Read" date** that didn't change, so the list shows it was checked.
5. **Act on what changed:**
   - a change the build can make (a screen, a setting): add it to the plan as a piece before submission
   - a change that's the user's (their text, a price, a choice): a blocking question through the kit's status script (ask, level blocking), because launch waits on it
   - a change to a date (a deadline, a waiting period): update the user's task and its do-by date in the plan
6. **Tell the user** in store preparation, in one line:
   > I also read the store rules again: nothing changed.

   or, when something did:
   > I read the store rules again. One changed: Google now asks for 12 testers for 21 days, not 14. I've moved your testers' date to Dec 2.

## 8. Rules that change Launchwright itself

The brief asks that rule changes feed updates to the plugin. A project can't change the kit or the plugin (the project's `AGENTS.md`), so when a check finds that a page in `sources.md` has moved, or a rule changed that Launchwright's skills or templates rely on (the tester rule in the plan, the Expo version in the template, the store answers in launch preparation):
- write it in the project folder's lessons file, under "For Launchwright": what changed, the source, the date, and which part of Launchwright relies on it
- say so in the piece's report, so the coordinator tells the user once:
  > Heads up: Apple changed a rule that Launchwright itself relies on. I've noted it for Launchwright's next update. Your app already follows the new rule.

Launchwright never sends this anywhere by itself. The plugin's own list of rules, with sources and dates, is updated when Launchwright is updated.

## 9. Saving

1. **The rules list** is saved after each page is read (section 4), so a check that stops part-way leaves what it read.
2. **Hand-offs,** after the list is done:
   - rules for the **mockup** (a screen the stores require, such as account deletion or the subscription's terms): nothing to write; the mockup reads the rules list for every rule whose **Who acts** names the mockup. Don't put them under "To review" in the project's decisions: that list is for choices the user looks over, not rules
   - rules for the **question sweep:** nothing to write; the sweep reads the rules list (`skills/question-sweep/SKILL.md`, section 1)
   - rules for the **plan:** the user's tasks with how long they take (12 testers for 14 days, then a review of usually 7 days or less); the plan reads the rules list and sets the do-by dates (`skills/build-plan/SKILL.md`)
   - rules for **launch preparation:** nothing to write; it reads the rules list
3. **Commit and push** to the project's working branch, as the project's `AGENTS.md` says. If the project has no working branch (only the user pushes), commit and say so at the end.
4. **The status:** a rules check run as its own piece starts and finishes with the kit's status script, like any piece. A page waiting on the user is a status ask at level fyi, with no alert, unless launch waits on it (then blocking).
