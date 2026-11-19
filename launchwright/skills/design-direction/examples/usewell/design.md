# The design guide

The short guide every screen follows, made from the style the user chose.

<!-- Example: Usewell's design guide, written by the design-direction skill's dry run on Nov 18, 2026, from the "Calm and airy" style in styles.html next to this file. In a project it's saved as project/design.md. Usewell is the walkthrough's made-up sample app. -->

## The style chosen
**Calm and airy**, chosen Nov 18, 2026. Usewell is opened in the evening by tired people deciding dinner, so it should feel like a tidy kitchen: soft greens, lots of space, and only one thing that ever shouts (what goes off tomorrow).

## Colours

| Name | What it's for | Value |
| --- | --- | --- |
| bg | The screen's background, a warm off-white | #FBFAF6 |
| surface | Cards and list rows | #F1F3EC |
| ink | Titles and main text | #1F2A22 |
| muted | Second lines, times, amounts | #66706A |
| line | Dividers and input borders | #E3E6DE |
| accent | The one main button on a screen, links, the current tab | #3F7A5A |
| accent-ink | Words on the main button | #FFFFFF |
| accent-soft | Second buttons, icon tiles, the "done" circle | #E5F1E8 |
| warn, warn-soft | The "Tomorrow" tag only: words, then tint | #B2452C, #F8E6E0 |
| amber, amber-soft | The "2 days" tag: words, then tint | #8A5A00, #FBF1DA |
| good, good-soft | The "4 days" and later tag, and "uses 3 of yours": words, then tint | #2F6B45, #E5F1E8 |

Every text colour on its background is at least 4.5 to 1 (checked with the skill's contrast check). Food tiles use a soft tint that matches the food (green for greens, cream for dairy, pale yellow for lemons), never a strong colour.

## Type
The phone's own font: San Francisco on iPhone, Roboto on Android, so nothing is downloaded and text follows the phone's text-size setting.

| Use | Size | Weight |
| --- | --- | --- |
| Screen title | 30 | Bold (750), tight letter spacing |
| Section heading | 18 | Bold (700) |
| Body and list items | 16 | Regular; item names semibold (650) |
| Second lines, amounts | 14 | Regular, muted colour |
| Tags | 13 | Semibold (650) |
| Main button | 17 | Bold (700) |

Sizes are in points on the phone (pixels on the mockup page). Nothing anyone reads is smaller than 13.

## Spacing and shapes
- **Spacing steps:** 4, 8, 12, 16, 20, 24. Screens have 20 at the sides and 18 at the top; list rows sit 8 apart; sections start 22 below the last thing.
- **Corners:** 18 on cards, rows and buttons; 12 on icon tiles; tags and chips are fully round.
- **Tap targets:** at least 44 by 44. List rows are 60 tall, main buttons 52.
- **No borders or shadows on cards:** a card is set apart by its tint, not a line.
- **Pictures:** food as emoji on soft tinted tiles or a soft gradient; no stock photos.
- **Icons:** line icons for the tab bar and other controls, in the theme's colours (muted, and the accent for the screen you're on); never emoji for a control.

## Tone of voice
Kind, calm and short, like a friend who's good in the kitchen. Plain words, no guilt, no exclamation marks.
- "Use these first", not "Expiring items" or "Eat me first!"
- "Nice. 3 things used up.", not "Great job! You saved 3 items!"
- "It went off", not "Mark as wasted".

## Do's and don'ts
- **Do** put the one thing to act on at the top: what to use first.
- **Do** give each screen one main button, in the accent green, where a thumb reaches it.
- **Do** show times as people say them: "Tomorrow", "2 days", "6 pm".
- **Do** use real food, real amounts and real recipes on every screen, mockup included.
- **Don't** use red for anything but "use by tomorrow", so it keeps its meaning.
- **Don't** blame or keep score of waste: no wasted-food totals, no streaks lost.
- **Don't** fill space: if a screen feels empty, leave it airy rather than adding a banner.
