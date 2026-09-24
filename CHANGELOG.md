# Changelog

All notable changes to Arcadia are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and the project uses
[Semantic Versioning](https://semver.org/).

GitHub release notes are generated from the matching section of this file, so
before tagging a release, move the **Unreleased** notes under a new
`## [x.y.z] — YYYY-MM-DD` heading.

## [Unreleased]

## [1.0.3] — 2026-09-24

### Added

- **Linked store accounts** — link Steam, Epic Games, Xbox, GOG, EA and Ubisoft
  Connect, and the games you own but haven't installed join the library with
  their store artwork. You sign in on each store's own page; sessions are kept
  encrypted with Windows DPAPI. A game that shows up in several stores stays a
  single entry.
- **Install from Arcadia** — the store's own client installs the game while a
  download panel shows the progress (percentage, speed and time left for
  Steam) and can cancel it. The card turns playable when the install finishes.
- **Automatic updates** from GitHub releases, with an on/off switch in
  **Settings → Updates**.
- **Lists** with drag-and-drop ordering, and Steam collection sync. Deleting a
  Steam-backed list deletes it in Steam too, once Steam is closed.
- Installed / not installed categories, favorites first, **Metacritic** scores
  with sorting by rating, and a **random game** picker.
- Local scanners for **GOG**, the **EA app** and **Ubisoft Connect**.
- Real store logos, a redrawn app icon, and Steam covers taken from the
  store's own assets.
- **Microsoft Store** package ("Arcadia Launcher") via `npm run dist:store`,
  in all six languages, with tile assets, a [privacy policy](PRIVACY.md) and
  listing texts for every language.
- Headless test suite under `build/` (`npm test`).

### Project

- GitHub Actions: tests and an installer build on every push and pull
  request; tagged releases are built and published automatically, with
  release notes from this file and a `SHA256SUMS.txt`.
- Issue and pull request templates, contributing guide, security policy and
  Dependabot updates.
- A much more detailed README, in English and Turkish, with new screenshots.
- `electron . --store-shots` renders the Store and README screenshots for
  every language.

### Removed

- The dead `src/src` copy of the sources.
- The `--shot` helper and the old README screenshot, which was packaged into
  the app for nothing.

## [1.0.2] — 2026-06-22

### Added

- Riot games (VALORANT, League of Legends) are detected automatically, even
  without per-game desktop shortcuts.
- Games without a store cover (e.g. Zenless Zone Zero) get cover art from
  SteamGridDB automatically.

### Fixed

- Arcadia no longer lists itself; tools (FACEIT, Blitz, Wand) keep their real
  icons instead of a wrong cover.
- Running games are detected with far less CPU (focus-gated polling instead of
  a constant PowerShell query).

## [1.0.1] — 2026-06-16

### Added

- First-run intro tour, and a **Replay tour** button in Settings.

### Fixed

- The app shows up as **Arcadia** with its own icon in Task Manager instead of
  "Electron".

## [1.0.0] — 2026-06-16

First release.

### Added

- Automatic detection of Steam, Epic Games, Xbox / Game Pass and
  desktop-shortcut games, with a silent re-scan on every launch.
- Real cover art: Steam store covers, optional SteamGridDB for the rest, and
  hand-drawn Minecraft tiles.
- One-click launch, a live running indicator and instant force-close.
- Companion apps that open and close together with a game.
- System tray with a most-played list, and optional launch at startup.
- Customizable logo (color, shape, symbol) that updates the taskbar icon live.
- Six languages, detected automatically: Türkçe, English, Deutsch, 日本語,
  한국어, Español.
- Minimalist dark UI.

[Unreleased]: https://github.com/SametEge/Arcadia/compare/v1.0.3...HEAD
[1.0.3]: https://github.com/SametEge/Arcadia/compare/v1.0.2...v1.0.3
[1.0.2]: https://github.com/SametEge/Arcadia/compare/v1.0.1...v1.0.2
[1.0.1]: https://github.com/SametEge/Arcadia/compare/v1.0.0...v1.0.1
[1.0.0]: https://github.com/SametEge/Arcadia/releases/tag/v1.0.0
