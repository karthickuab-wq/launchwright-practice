# Where the market check looks, and what it never reads

The places the market check starts from, and the sites it must not read. Launchwright last checked each one on the date shown. **This list says where to look, not what you'll find.** In a project, every number comes from a page read that day (the skill, rules 1 and 2).

## Never read these pages

Their terms bar automated reading, or bar putting their content into AI. Don't open them, don't fetch them, and don't ask a tool to read them for you. A search engine's result that links to one may be used to *find* an app or a show (its name and its link), never as the source of a number.

| Site | Why | What to do instead | Checked |
| --- | --- | --- | --- |
| Spotify (open.spotify.com and every Spotify page) | Spotify's user guidelines forbid automated access and putting Spotify content into AI (Launchwright's rule, set by the user on Nov 18, 2026) | For a podcast, read the show's own website or RSS feed; or ask the user to paste what's needed | Nov 18, 2026 |
| YouTube (youtube.com, youtu.be) | YouTube's terms bar automated access except by search engines (Launchwright's rule, set by the user on Nov 18, 2026) | Ask the user to paste the description or transcript | Nov 18, 2026 |
| Apple's App Store pages (apps.apple.com), and Apple's other web pages for its media services, such as podcasts.apple.com | Apple's Website Terms of Use bar any "deep-link", "page-scrape", "robot", "spider" or other automatic device used to "access, acquire, copy or monitor" its site or content; the Apple Media Services Terms, which cover the App Store, bar "any software or automated process to scrape, copy, or monitor the Content or Services". ([Apple Website Terms of Use](https://www.apple.com/legal/internet-services/terms/site.html), [Apple Media Services Terms](https://www.apple.com/legal/internet-services/itunes/).) Both seen through web search results on Nov 18, 2026: Apple's own legal pages (www.apple.com) couldn't be reached from Launchwright's build environment that day, so read them again when they can be | Find iPhone-only apps through a web search, and use only the app's name and link from the result; read the app's own website for its price and features; for a rating or a price that only the App Store shows, ask the user for a screenshot (the skill, section 9) | Nov 18, 2026 |
| Sites that copy App Store listings, such as app-tracking and app-ranking sites whose pages show an App Store app's description, rating and price | Their content is the App Store's, so Apple's terms reach it by another road (added by P3.Z from the name check's rule, `skills/name-and-home/sources.md`) | Use the search result's title and link only, and the app's own website | Nov 18, 2026 |

Before using any other site for the first time, check its terms page for automated reading and AI use. If they forbid it, add it here (in the project's lessons, for Launchwright's next update) and treat it the same way.

## Finding things: web search

A web search with words from the description is how the check finds apps, numbers about the problem, and the official pages to read. Search results are short and can be out of date: on Nov 18, 2026, a search result still described an app called "Foil: Food Expiration tracker" whose Google Play page, opened that day, was a different app ("Nishi: My nutrition companion"). So:
- **Open the page** before using a number or a feature from it, when the site allows it.
- **A number only seen in a search result** is written as such ("seen in search results, page not opened") and never carries the verdict on its own.

## Google Play: apps on Android

| What | Page | Allowed | Checked |
| --- | --- | --- | --- |
| One app's listing: name, maker, short description, full description, rating, number of reviews, downloads, "Contains ads", in-app purchase price range, last updated, and the few reviews the page shows | `https://play.google.com/store/apps/details?id=<app id>&hl=en_US&gl=US` (change `gl` to the country the app is for first) | Yes. Google Play's robots.txt doesn't disallow `/store/apps/details` for any user agent (read again Nov 18, 2026), and Google's Terms of Service bar automated access only "in violation of the machine-readable instructions on our web pages (for example, robots.txt files…)" | Nov 18, 2026 |
| Store search, the full reviews list, "datasafety" pages | `/store/search`, `/store/getreviews`, `/store/apps/datasafety` | **No.** Google Play's robots.txt disallows them. Find app ids through web search instead | Nov 18, 2026 |

Notes for reading a listing:
- **Downloads** are bands ("500+", "50K+", "1M+"), not counts. Write them as shown.
- **The in-app purchase range** ("$6.99 - $44.99 per item") is for every purchase in the app together, not the price of the plan. Give it as the range, and look for the plan's price on the maker's own website.
- **No rating shown** means too few people have rated it. Write "no rating yet", not zero.
- Read one listing at a time, as a person would, and only the apps the check needs.

Google's Terms of Service were seen through web search results on Nov 18, 2026 (policies.google.com couldn't be reached from Launchwright's build environment that day).

## Numbers about the problem

Official figures come from the body that measured them: a government office, a statistics agency or a research body's own report, with the report's name and date. A blog repeating a figure points you to it; the figure's source is the report. Example, Nov 18, 2026: the US Environmental Protection Agency's report "Estimating the Cost of Food Waste to American Consumers" (April 2025), https://www.epa.gov/land-research/estimating-cost-food-waste-american-consumers.

## Sites the cloud environment must allow

Every page above is read from the project's cloud environment, which reaches only the sites it allows. On Nov 18, 2026, Launchwright's own build environment allowed play.google.com, but not www.epa.gov, www.apple.com or policies.google.com. A site that can't be reached is "not read" (the skill, section 9); the check never asks the user to change their environment in the middle of a check.
