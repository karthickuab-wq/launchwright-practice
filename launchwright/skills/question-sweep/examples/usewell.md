# Dry run: the question sweep for Usewell

A dry run of the question-sweep skill on the walkthrough's sample app, done on Nov 18, 2026. The app, its market check and its recipe service (Spoonbase) are made up, as in the walkthrough, so no service page was read; in a real sweep, the account's **Where / Do / You'll see** comes from the service's own sign-up page, read that day. Lines starting with `>` are what Claude shows the user; the user's replies are in plain text.

## What Claude read first (section 1)

- **The description** (from the idea-intake voice dry run, `skills/idea-intake/examples/voice.md`; Usewell is the name the user chose at screen 6 for the idea first called Use It Up): money is "free, with a paid monthly plan; the user expects about a couple of dollars a month. The price is set later, at the question sweep". Outside services: a recipe service, receipt reading, and the stores' in-app purchases. Open questions: none.
- **The market check** (`skills/market-check/examples/usewell.md`): the closest apps' Google Play pages show only the range of all their in-app purchases, not a plan's price, so the check found no monthly prices to compare with. The price question gives no comparison (rule 6).
- **The rules list:** not made for this dry run (the rules check's own dry run makes the sample's list). In a real sweep, a store rule that shapes an option, for example around sign-in, is read from the list and shown with its source; rules that need no choice from the user (such as letting people delete their account) go to the build, not to a question.
- **The mockup's notes:** "the sign-in method is a question-sweep decision"; "the price is a sample, the question sweep asks". The Plus screen's three features were approved with the mockup, so what Plus includes isn't asked again.
- **The project's decisions:** none yet. **The kit's settings:** time zone America/Chicago, from setup.

## The list Claude made

| # | Id | Group | Question | Holds up | Why it's asked |
| --- | --- | --- | --- | --- | --- |
| 1 | Q-signin | decision | How do people sign in? | the sign-in screens | Left to the sweep by the mockup |
| 2 | Q-receipts | decision | How are receipts read? | adding food by receipt | Decides whether a receipt service, an account and a key are needed at all |
| 3 | Q-price | decision | What should Plus cost? | the Plus screen | A price is always the user's |
| 4 | Q-countries | decision | Where is Usewell for, first? | store preparation | Sets the stores' countries, the currency and the recipes' units |
| 5 | A-recipes | account | A recipe service account | recipes | The description's recipe service |
| 6 | K-recipes | key | The recipe service's test key | recipes | The app's recipe screens call the service through the app's own server code, and the recipe work's tests call it too, so the key goes on Expo and on Usewell keys (the keys skill, section 3, rows 2 and 1) |
| 7 | R-window | review window | When can you usually review? | the plan | Always last |

Decided under the go-ahead rule, not asked: the reminder's default time (6 pm, as in the mockup; the user can change it in the app) and the recipes' language (English). Both go under "To review" in the project's decisions.

The stores' in-app purchases need no account here: the Apple and Google accounts came from setup, and the store entries are the user's tasks in the plan.

## The conversation

> Now everything the build needs from you, asked once: 4 decisions, 1 account, 1 key, then when you can review. One at a time.

> Question 1 of 7 · a decision · holds up the sign-in screens
> **How do people sign in?**
> • Sign in with Apple and Google *(recommended: one tap, and no password to lose)*
> • Email and password *(adds an email service to your accounts)*
> • No accounts in version 1 *(simpler, but the kitchen stays on one phone)*

Sign in with Apple and Google

> Question 2 of 7 · a decision · holds up adding food by receipt
> **How should receipts be read?**
> • On the phone itself *(recommended: free, and the photos never leave the phone)*
> • By a receipt service *(adds an account and a key, and may cost money)*

On the phone

> Question 3 of 7 · a decision · holds up the Plus screen
> **What should Plus cost?** You said about a couple of dollars a month.
> • $2.99 a month *(recommended: close to what you said, easy to say yes to)*
> • $1.99 a month
> • $19.99 a year
> • Something else

$2.99 a month

> Question 4 of 7 · a decision · holds up store preparation
> **Where is Usewell for, first?** It sets the stores' countries, the prices' currency and the recipes' units.
> • The US only *(recommended: one currency and one set of units for version 1)*
> • English-speaking countries
> • Everywhere the stores reach

The US only

The decisions didn't change the list: "On the phone" means no receipt service, so the count stays.

> Question 5 of 7 · an account · holds up recipes
> Recipes come from a recipe service. It needs a free account in your name.
> **Where:** Spoonbase's website, the sign-up page.
> **Do:** make a free developer account.
> **You'll see:** a dashboard showing your key.
> Don't paste the key here. The next question says where it goes.
>
> • Done
> • Later *(only the recipe work waits)*

Done

> Question 6 of 7 · a key · holds up recipes
> Recipes need a test key from Spoonbase. It goes in two safe places: your app's settings on Expo, and Usewell's own keys in Claude's settings. I can use it, but I never see it. Never paste it here.
> • Show me how *(recommended)*
> • Later *(only the recipe work waits)*

"Show me how" would go on with the keys skill's steps (`skills/keys/SKILL.md`, section 4): the name SPOONBASE_KEY on its own line, then the Expo variable (development and preview, Sensitive), then the Usewell keys environment and its network secret for Spoonbase's host, each with Where / Do / You'll see. The user taps Later.

> Fine. Only the recipe work waits; everything else goes ahead.

> Question 7 of 7 · the last one · holds up the plan
> **When can you usually look at something new?** I'll book every checkpoint into that time.
> • Weekday evenings, 7 to 9 pm *(recommended: builds finish overnight, you check after work)*
> • Weekend mornings
> • Any time, alert me

Weekday evenings

> That's everything. 6 answered, 1 for later: the recipe key, which holds up recipes.
> Next, the plan: what version 1 includes, how long it takes, and when you'll check it.
> • Show me the plan *(recommended)*
> • Not now

## What was saved

**The project's questions file** (after the last answer; each answer was saved and committed as it came):

```markdown
# The question sweep

Everything the build needs from the user, asked once before it starts, with the answers in the user's words.

## Decisions

### Q-signin · How do people sign in?
- **Asked:** Nov 18, 2026. Options: Sign in with Apple and Google (recommended); Email and password; No accounts in version 1
- **Answer:** Sign in with Apple and Google
- **Holds up:** the sign-in screens

### Q-receipts · How should receipts be read?
- **Asked:** Nov 18, 2026. Options: On the phone itself (recommended); By a receipt service
- **Answer:** On the phone
- **Holds up:** adding food by receipt

### Q-price · What should Plus cost?
- **Asked:** Nov 18, 2026. Options: $2.99 a month (recommended); $1.99 a month; $19.99 a year; Something else. No price comparison shown: the market check found no plan prices
- **Answer:** $2.99 a month
- **Holds up:** the Plus screen

### Q-countries · Where is Usewell for, first?
- **Asked:** Nov 18, 2026. Options: The US only (recommended); English-speaking countries; Everywhere the stores reach
- **Answer:** The US only
- **Holds up:** store preparation

## Accounts

### A-recipes · A recipe service account
- **Asked:** Nov 18, 2026. Service: Spoonbase, free account
- **Answer:** Done (the user made it)
- **Holds up:** recipes

## Keys

### K-recipes · The recipe service's key
- **Asked:** Nov 18, 2026. Key name: SPOONBASE_KEY. Service: Spoonbase, a test key, for recipes. Where it goes: Expo, development and preview, sensitive, for the app's server code; and a network secret on Usewell keys, for Spoonbase's host (from its docs), for the recipe work's tests
- **Answer:** skipped (not added yet)
- **Holds up:** recipes

## Review window

### R-window · When can you usually look at something new?
- **Asked:** Nov 18, 2026. Options: Weekday evenings, 7 to 9 pm (recommended); Weekend mornings; Any time, alert me
- **Answer:** Weekday evenings
- **Holds up:** the plan

## Skipped

- **K-recipes,** the recipe service's key. Holds up recipes. The build relay asks it again when the recipe work is next.
```

**The project's decisions,** under "Decided by the user": Q-signin, Q-receipts, Q-price and Q-countries, each with its date and options. Under "To review": the reminder's default time (6 pm; undo by changing one setting) and the recipes' language (English; undo by changing one setting).

**The kit's settings:**

```json
"timeZone": "America/Chicago",
"reviewWindow": { "label": "Weekday evenings, 7 to 9 pm", "days": ["mon", "tue", "wed", "thu", "fri"], "from": "19:00", "to": "21:00" }
```

## Checked against the skill

- The questions came in spec section 6's order: decisions (1 to 4), then the account (5), then the key (6), then the review window (7, last).
- One question at a time; each shows its number, its kind and what it holds up; two to four options, the recommended one first with one line on why.
- The price question shows no comparison, because the market check found no plan prices; its reason rests on what the user said in the description. "Something else" was offered; the price is the user's.
- The receipt decision came before the accounts, because it decided whether a receipt service was needed.
- Nothing was asked that the mockup had already settled (what Plus includes), and two cheap choices were decided and listed under "To review" instead of asked.
- The key was never asked for in the chat. Where it goes came from the keys skill: on Expo for the app's server code, and on Usewell keys for the build's tests, never the Project's environment. Only its name and where it goes were saved. Skipping it held up only recipes.
- Each answer was saved as it came, and the user's decisions also went into the project's decisions.
