# Publishing the status page on Claude

The Claude-only part of the status-page skill (`skills/status-page/SKILL.md`, section 2, step 2). A port to another platform replaces this file and nothing else (spec section 12). It publishes the page as a Claude artifact page: private to the user, at a claude.ai link that opens on the phone. Claude Project threads have the tool for it (`skills/status-page/sources.md`, "Claude artifact pages"); a plain cloud session may not, and then the next Project thread publishes instead.

The tools below are named as Claude's artifact tools name them (read Nov 18, 2026, `skills/status-page/sources.md`, "Claude artifact pages"). If a session lists them under other names, use the ones that do the same job.

## Before the first publish in a session

Read the artifact tools' own guide, its "pages" topic, once per session: it holds the rules a published page must meet, and they can change.

## The first time

1. Build the page with the page script, into the session's scratch folder (the skill, section 2, step 1).
2. **Publish it from the file:** the tool that publishes an artifact from files on disk, with the file served as index.html, the title "<the app's name>: status", and the icon "chart". No slug: this makes a new artifact, private to the user.
3. The result carries the page's **url** (a claude.ai/artifact link) and its **version**. Record the url with the status script's page-link command. That link never changes again.
4. If publishing from a file is refused (the client won't send a file from that folder), publish the same page's text with the tool that publishes a whole page as content, with the same title and icon.

## Every time after

1. **Read the live version** with the tool that reads an artifact's state without its content (get_artifact), given the link recorded with page-link. It returns the slug, the live **version**, and **read**: who it's shared with.
2. **Rebuild the page** with the page script, after the status command that just ran (it pulls and pushes by itself), so the page holds every thread's latest record.
3. **Republish** with the file tool. That tool asks for the artifact's file list first, unless this session made the artifact or already listed it, so call the tool that lists an artifact's files (list_files) with the slug; if it refuses, carry on with index.html. Then republish: the slug, base_version set to the live version, and the file as index.html. Leave out title and icon to keep them. If read was users, org or public (the user shared it), also pass shared_live with that same word: it only states the current sharing and changes nothing.
4. **A conflict** means another thread published in between. Read the live version again, rebuild the page from the latest status files, and republish once. The newest status files always win, so nothing is lost by rebuilding.

## Never

- Change who can see the page, or publish it anywhere else. Sharing is the user's, from the page's own menu on claude.ai.
- Publish anything but the page script's output: no hand edits to the page.
- Delete the page. If it's ever lost, publish a new one and record its link with page-link.
