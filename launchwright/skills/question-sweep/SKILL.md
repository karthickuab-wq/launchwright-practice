---
name: question-sweep
description: Asks everything a Launchwright build will need from the user, once, before the plan is made, so the build can run without stopping for small things. Use when the mockup is approved, or when the user comes back to finish the sweep. Asks the decisions, then the accounts, then the keys, then when the user can review, one question at a time, each with a recommendation, tap options and what it holds up.
---

# The question sweep

After the mockup is approved, the build still needs a few things only the user can give: decisions, accounts in their name, keys, and when they can look at progress. The sweep asks all of them now, one at a time, so the build that follows runs through the night instead of stopping for small things (spec section 6, screen 11; brief F8; lessons 13 and 16).

Follow the front door's phone and voice rules (`skills/launchwright/SKILL.md`, section 4) in every message. As there, every line the user sees is written below as a quoted line; adapt the words to the moment, keep the shape.

A worked example, a dry run on the walkthrough's sample app, is `examples/usewell.md` in this skill's folder.

## The rules for every question

1. **One question at a time,** two to four tap options, the recommended one first and marked, with one line on why. Typing or talking an answer always works too.
2. **Each question says what it holds up,** in the user's words: a screen of the mockup or a thing the app does ("the sign-in screens", "recipes"), never a piece id.
3. **Every question has a way to leave it for later.** For a decision, typing "later" works; for an account or a key, "Later" is one of the options. Only the work it holds up waits (section 6).
4. **Ask only what the build truly needs from the user** (lesson 16). If a choice is cheap to undo and isn't the user's (section 2), decide it under the go-ahead rule, write it in the project's decisions under "To review", and don't ask.
5. **Never ask again what's already answered:** in the description, the mockup's comments, the project's decisions, or an earlier sweep. Read them first.
6. **Never guess a fact.** A number or a claim in a question (what similar apps charge, what a service costs, what a store requires) comes from the market check, the rules list, or the service's own page read today, and you can say where it came from if asked. If you can't find it, leave the claim out rather than guess.
7. **Never ask for a key, a password or a code in the chat.** If the user pastes one, don't repeat it; ask them to make a new one, because the old one has been seen.
8. **Money is asked every time.** If an account or a choice costs money, say so before the user does anything, with the free way first and recommended when there is one (the front door, section 5).

## 1. Before the first question: make the list

Read, without saying anything to the user yet:
- the confirmed description (its money line, its outside services, its open questions)
- the market check, for what similar apps do and charge
- the rules list, for anything the stores or a service require that needs a choice
- the design guide and the mockup's notes and comments, for anything they left to the sweep (for example a note saying "the sign-in method is a question-sweep decision")
- the project's decisions, and the sweep's own file if an earlier sweep began
- the kit's settings, for the user's time zone

Make the list of questions in this order, the order of spec section 6:

1. **Decisions.** The choices the build needs that are the user's (section 2). The usual ones: how people sign in, what's free and what's paid, the price, which countries the app is for first, anything the description's open questions name, and any choice that decides whether a service is needed at all. Ask a choice that removes or adds a service before the accounts, so the accounts list is right.
2. **Accounts.** One for each outside service this app needs that the user doesn't have yet, after the decisions are in. Not the accounts setup already made (GitHub, Expo, Apple, Google); check the kit's records, and only if one is missing add it here.
3. **Keys.** One for each key those services need, by name only, and only test keys that version 1 or its build really uses. Production keys never go to the cloud (spec section 10), so they're not asked here; the launch preparation covers them.
4. **When the user can review.** Always last. If the kit's settings have no time zone, ask it first, as part of this question.

Give each question a short id, such as Q-signin, Q-price, A-recipes or K-recipes (Q for a decision, A for an account, K for a key, R-window for the review window). The plan uses these ids for the work each one holds up.

Then open with the count, so the user knows how long it is:

> Now everything the build needs from you, asked once: 4 decisions, 1 account, 1 key, then when you can review. One at a time.

If a decision changes the list (for example "Email and password" adds an email service), say the new count in one line when the accounts start:

> That adds one account, an email service. 2 accounts to go.

## 2. What's the user's, and what isn't

Ask the user about:
- names, prices and money: free or paid, what the paid plan includes, the price
- who the app is for and where it's offered first
- how people sign in, and what personal information the app keeps
- anything that changes what version 1 does
- accounts in their name, keys, and anything that costs money
- anything hard to undo

Decide yourself, and list under "To review": colours, wording, layout details, which free library or approach the builders use, the order of the work, and anything else the user would shrug at. A price is always the user's: suggest it with a reason, and always offer "Something else".

## 3. Asking a decision

Show the question number, what kind it is, and what it holds up on one line, then the question:

> Question 1 of 7 · a decision · holds up the sign-in screens
> **How do people sign in?**
> • Sign in with Apple and Google *(recommended: one tap, and no password to lose)*
> • Email and password
> • No accounts in version 1

When an option has a cost the user can't see (it adds an account, a service or a price), say so in its line:

> • Email and password *(adds an email service to your accounts)*

When the question rests on a fact, give the fact first, from the market check or the rules list:

> Question 3 of 7 · a decision · holds up the Plus screen
> **What should Plus cost?** The closest apps charge $4.99 to $7.99 a month.
> • $2.99 a month *(recommended: under the others, easy to say yes to)*
> • $1.99 a month
> • $19.99 a year
> • Something else

## 4. Asking for an account

One service at a time. Say what it's for and what it costs, then **Where**, **Do** and **You'll see**, read from the service's own sign-up page today. If the page can't be read from here, say so and ask the user to open it and send a screenshot; never write the steps from memory (lesson 7).

> Question 5 of 7 · an account · holds up recipes
> Recipes come from a recipe service. It needs a free account in your name.
> **Where:** Spoonbase's website, the sign-up page.
> **Do:** make a free developer account.
> **You'll see:** a dashboard showing your key.
> Don't paste the key here. The next question says where it goes.
>
> • Done
> • Later *(only the recipe work waits)*

If the service costs money, say what and link its price page first, and offer the free way when there is one:

> The receipt service charges after 500 scans a month. Here's its price page.
> • Read receipts on the phone instead *(recommended: free, and the photos stay on the phone)*
> • Yes, use the paid service

The user makes the account and enters any sign-in code themselves. Claude never makes an account for them and never sees their password.

## 5. Asking for a key

Every key follows the keys skill (`skills/keys/SKILL.md`), which this section doesn't repeat. Before the question, work out from its section 3 where this key goes, from the service's own docs, read today:
- **The app's own server code uses it** (a secret key the app needs to do its job): an environment variable on Expo, in the development and preview environments (its row 2)
- **The build's own sessions use it,** to set the service up or test against its test mode: a network secret on this app's own keys environment in Claude's settings (its row 1)
- **Both,** when the app uses it and the build tests against it: the user adds the same test key in both places, one after the other
- **Never** the environment the Project's threads use, never inside the app for a secret key, and never a production key (that waits for launch)

Then ask, saying where it goes in plain words:

> Question 6 of 7 · a key · holds up recipes
> Recipes need a test key from Spoonbase. It goes in two safe places: your app's settings on Expo, and Usewell's own keys in Claude's settings. I can use it, but I never see it. Never paste it here.
> • Show me how *(recommended)*
> • Later *(only the recipe work waits)*

"Show me how" goes on with the keys skill's steps (its section 4), one screen at a time, each with **Where**, **Do** and **You'll see** and a tap to say it's done, and the key's name sent on its own line to copy. The keys skill also checks the key works, without showing it, the first time a session needs it.

## 6. When the user can review

The last question. It books every checkpoint of the plan into a time the user really looks:

> Question 7 of 7 · the last one · holds up the plan
> **When can you usually look at something new?** I'll book every checkpoint into that time.
> • Weekday evenings, 7 to 9 pm *(recommended: builds finish overnight, you check after work)*
> • Weekend mornings
> • Any time, alert me

Offer times that fit what the user has said about their days, if anything; otherwise these three. If the kit's settings have no time zone, ask it first, in one line with their likely zone as the recommended option, worked out from what they've said (a city, a time) and never assumed:

> Which time zone are you in? I'll show every time in it.
> • Chicago time *(recommended: you mentioned Chicago)*
> • Somewhere else

## 7. Skipping, and stopping part-way

- **A skipped question** ("Later", or "skip"): say in one line what waits, then go on.
  > Fine. Only the recipe work waits; everything else goes ahead.

  Save it under "Skipped" with what it holds up. The plan marks the work that waits on it, and when the build reaches that work, the build relay asks it again as a blocking question, with a phone alert (`skills/build-relay/SKILL.md`, section 6).
- **"Not now," or the user goes quiet:** everything answered so far is already saved. Record the sweep as waiting on the user with the kit's status script: its ask command, id "sweep", level fyi, with no alert, holding up "the plan". The front door then shows it under "Waiting on you", and offers it first next time.
- **Coming back:** read the sweep's file, then carry on at the first question that isn't answered or skipped, with one line:
  > 4 of 7 answered. Next: one account.

## 8. Saving

Save after **every** answer, so a session started from the phone picks up exactly where this one stopped.

1. **The sweep's answers** go in the project folder's questions file, under the kit's headings (Decisions, Accounts, Keys, Review window, Skipped). One entry for each question:
   - a "###" heading with the id and the question, such as "### Q-signin · How do people sign in?"
   - **Asked:** the date, and the options offered, the recommended one marked
   - **Answer:** in the user's words, or "skipped" or "waiting"
   - **Holds up:** what the user was told it holds up
   - for an account: the service, what it costs, and whether it's made
   - for a key: what the keys skill records (its section 9): the key's name, the service, what it's for, where it's kept, test or live, and whether it's added; never the key itself

   Write the entries for the whole list the first time you save, with "waiting" as the answer, so the order and the count survive a new session.
2. **Every decision the user made** also goes in the project's decisions, under "Decided by the user": what was chosen, the date, and the options they had. Choices you made under the go-ahead rule go under "To review", with why and how to undo it.
3. **The review window and time zone** go in the kit's settings too: timeZone as a time zone name (such as America/Chicago), and reviewWindow as an object with label (the user's words), days (three-letter lowercase days, such as mon), and from and to as 24-hour times (both null for "any time"). For example: `{"label": "Weekday evenings, 7 to 9 pm", "days": ["mon","tue","wed","thu","fri"], "from": "19:00", "to": "21:00"}`.
4. **Don't rewrite the confirmed description.** A decision that changes what version 1 does or which services it uses is recorded as a decision; the plan reads the description and the decisions together.
5. **Commit and push** to the project's working branch, as the project's `AGENTS.md` says, after each answer. If the project has no working branch (only the user pushes), commit and say so at the end.

## 9. The end of the sweep

When the last question is answered or skipped, close the "sweep" item if one was recorded (the status script's answered command), and say what's in and what waits, in one short message:

> That's everything. 6 answered, 1 for later: the recipe key, which holds up recipes.
> Next, the plan: what version 1 includes, how long it takes, and when you'll check it.
> • Show me the plan *(recommended)*
> • Not now

Then hand over to the plan (`skills/build-plan/SKILL.md`). It reads the sweep's file for the review window, the skipped questions and what each holds up.
