<div align="center">

<img src="assets/icon.png" width="120" alt="Arcadia" />

# Arcadia

**All your games in one beautiful library.**

Arcadia finds the games on your PC and the ones you own in Steam, Epic, Xbox, GOG, EA and Ubisoft Connect,<br>
shows them with real cover art, and launches or installs any of them with a single click.

[![Release](https://img.shields.io/github/v/release/SametEge/Arcadia?color=8b5cff&label=release)](https://github.com/SametEge/Arcadia/releases/latest)
[![Downloads](https://img.shields.io/github/downloads/SametEge/Arcadia/total?color=0d9bf0)](https://github.com/SametEge/Arcadia/releases)
[![CI](https://github.com/SametEge/Arcadia/actions/workflows/ci.yml/badge.svg)](https://github.com/SametEge/Arcadia/actions/workflows/ci.yml)
![Platform](https://img.shields.io/badge/platform-Windows%2010%20%7C%2011-0d9bf0)
![Electron](https://img.shields.io/badge/Electron-42-47848f)
[![License](https://img.shields.io/badge/license-MIT-8b5cff)](LICENSE)

### [⬇ Download the latest release](https://github.com/SametEge/Arcadia/releases/latest)

**English** · [Türkçe](README.tr.md)

<img src="assets/screenshot.png" width="860" alt="Arcadia screenshot" />

</div>

---

## Contents

- [Features](#-features)
- [Supported stores](#-supported-stores)
- [Download & install](#%EF%B8%8F-download--install)
- [Privacy](#-privacy)
- [Build from source](#-build-from-source)
- [How it works](#-how-it-works)
- [Project structure](#%EF%B8%8F-project-structure)
- [Contributing](#-contributing)
- [License](#-license)

## ✨ Features

**Your whole library, found for you**

- 🔍 **Automatic scanning** — Steam, Epic Games, Xbox / Game Pass, GOG, EA app, Ubisoft Connect, Riot (VALORANT, League of Legends) and desktop shortcuts, plus any folders you add. A silent re-scan on every launch adds new games and drops uninstalled ones while keeping your data.
- 🔗 **Linked store accounts** — hit **Link Account**, sign in to Steam, Epic, Xbox, GOG, EA or Ubisoft Connect, and the games you *own but haven't installed* join the library with their store artwork. A game that shows up in several stores stays a single entry.
- 🖼️ **Real cover art** — Steam games use the store's own capsules; everything else is looked up on **SteamGridDB**. Minecraft ships with hand-drawn tiles, and anything left gets a clean branded tile. You can always pick your own image.

**Play and install**

- ▶️ **One-click launch** — through the store's own protocol (so overlays, cloud saves and DRM keep working) or straight from the `.exe`.
- ⬇️ **Install from Arcadia** — click a game you own and the store's client starts installing it while Arcadia's download panel shows live progress: percentage, speed and time left for Steam. When it finishes, the card turns playable on its own.
- 🟢 **Running indicator & force-close** — a running game is marked live; the red **×** closes it (and its companion apps) instantly.
- 🤝 **Launch together** — link Discord, FACEIT, overlays… to a game so they open with it. Discord has its own quick button in the sidebar.

**Organise**

- 📚 **Lists** — make your own lists with drag-and-drop ordering. Your **Steam collections** can be imported too, and deleting one from Arcadia deletes it in Steam.
- ⭐ **Favorites, categories & search** — installed / not installed, per-store views, sorting by name, recently added, recently played or **Metacritic** score.
- 🎲 **Random game** — can't decide? Let Arcadia pick.

**Feels like yours**

- 🎨 **Accent color & logo** — change the color, shape and symbol of the logo; the Windows taskbar icon updates live.
- 🌍 **6 languages** — auto-detected from Windows, switchable any time.
- 🗔 **System tray** — keeps running in the background with your most-played games one right-click away. Optional launch at startup.
- 🔄 **Automatic updates** — new releases download in the background and install the next time you quit (**Settings → Updates** to be asked instead).
- 🌙 **Minimalist dark UI** — cover grid, smooth hover effects, frameless window, first-run tour.

## 🎮 Supported stores

| Store | Installed games | Linked account | Install from Arcadia | Download progress |
|---|:---:|:---:|:---:|---|
| **Steam** | ✅ | ✅ | ✅ | percentage, speed, time left |
| **Epic Games** | ✅ | ✅ | ✅ | percentage when the size is known, otherwise state |
| **Xbox / Game Pass** | ✅ | ✅ PC titles | ✅ via Microsoft Store | when finished |
| **GOG** | ✅ | ✅ | ✅ via GOG Galaxy | when finished |
| **EA app** | ✅ | ✅ | ✅ | when finished |
| **Ubisoft Connect** | ✅ | ✅ games played at least once¹ | ✅ | when finished |
| **Riot Games** | ✅ | — | — | — |
| **Shortcuts, folders, manual** | ✅ | — | — | — |

¹ Ubisoft only lets its own launcher read the full ownership list; the web API Arcadia uses lists the games you've launched.

No store offers an API that lets another app download a game, so Arcadia asks the store's own client to install it — the same hand-off Playnite makes — and follows the progress from there.

## ⬇️ Download & install

1. Download the latest **`Arcadia-Setup-<version>.exe`** from [Releases](https://github.com/SametEge/Arcadia/releases/latest).
2. Run it (see the SmartScreen note below).
3. Follow the installer — Arcadia adds Start-menu and desktop shortcuts, opens, and scans your games.

Releases built by the release workflow also carry a `SHA256SUMS.txt`, so you can check the file you downloaded:

```powershell
Get-FileHash .\Arcadia-Setup-<version>.exe -Algorithm SHA256
```

> Uninstalling keeps your library and settings (they live in `%APPDATA%\Arcadia`).

<details>
<summary><b>⚠️ "Windows protected your PC" (SmartScreen)?</b></summary>

<br>

This warning is **normal and expected** — it does **not** mean anything is wrong with Arcadia. To continue:

> **More info → Run anyway**

Windows SmartScreen warns about *any* installer that isn't signed with a **paid** code-signing certificate. Code signing has nothing to do with whether a project is open source — many trustworthy open-source apps show the same warning.

Arcadia is fully open source, so you don't have to take the installer on trust: read the code and [build it yourself](#-build-from-source). New releases are built by [GitHub Actions](.github/workflows/release.yml) straight from the tagged source. A Microsoft Store version — signed by Microsoft, so no warning at all — is on the way.

</details>

### Cover art (SteamGridDB)

Covers for non-Steam games work out of the box through a shared SteamGridDB key. That key is public and shared by every Arcadia user, so it can hit rate limits; for reliable covers add your own **free** key:

1. [steamgriddb.com](https://www.steamgriddb.com) → *Preferences → API* → copy your key.
2. Arcadia → **Settings → Cover Art (SteamGridDB)** → paste it and rescan.

Your key is stored only on your PC.

## 🔒 Privacy

**Arcadia has no server. There is no telemetry, no analytics and no advertising.** Everything it knows stays on your PC. It talks directly to the stores you use, to SteamGridDB for covers and to GitHub for updates — never to a server of ours.

- You sign in on each **store's own page** — Arcadia never sees or stores your password.
- Store sessions are kept in `%APPDATA%\Arcadia\accounts.dat`, encrypted with Windows DPAPI so only your Windows account can read them.

The full policy is in [`PRIVACY.md`](PRIVACY.md).

## 🚀 Build from source

Requirements: **Windows 10/11** and [Node.js](https://nodejs.org) 18 or newer. The tests also run on Linux and macOS.

```bash
git clone https://github.com/SametEge/Arcadia.git
cd Arcadia
npm install

npm start           # run the app
npm test            # headless tests (i18n, library merge, downloads, lists, accounts, covers…)
npm run test:login  # account sign-in window test (opens real windows)
npm run dist        # build the installer into dist/
npm run dist:store  # build the Microsoft Store package (dist/Arcadia-<version>-Store.appx)
```

### Releasing

Releases are cut by the [`release`](.github/workflows/release.yml) workflow:

1. Bump `version` in `package.json` and move the **Unreleased** notes in [`CHANGELOG.md`](CHANGELOG.md) under a new `## [x.y.z]` heading.
2. Commit, then tag and push: `git tag v1.1.0 && git push origin v1.1.0`.

The workflow runs the tests, builds the installer, and publishes a GitHub release with the installer, `latest.yml` (read by the auto-updater), the blockmap and `SHA256SUMS.txt`. The release notes come from the matching `CHANGELOG.md` section.

`npm run release` still builds and uploads from your own PC (needs a `GH_TOKEN`), but the workflow is the preferred route.

<details>
<summary><b>Microsoft Store build</b></summary>

<br>

The Store package is signed by Microsoft during certification, so it installs without SmartScreen or Smart App Control warnings — the same effect as a paid code-signing certificate, for free.

1. The Store name is **Arcadia Launcher** (Store ID `9N22381XP9S9`); its Partner Center identity is already in `build.appx` in `package.json`. `displayName` there has to stay exactly the reserved name.
2. `npm run dist:store` uses the Windows SDK installed on the PC (the tools electron-builder downloads either fail on Windows 11 or are blocked by Smart App Control). Tile images come from `build/appx`, regenerated by `npm run icon`.
3. Upload the `.appx`. Listing text, the `runFullTrust` justification and certification notes are drafted in [`store/LISTING.md`](store/LISTING.md); the privacy policy is [`PRIVACY.md`](PRIVACY.md).

In the Store build Arcadia's own updater is switched off — Store apps are updated by the Store — and launch at startup is left to Windows.

</details>

<details>
<summary><b>Regenerating the icon</b></summary>

<br>

The logo lives in `assets/logo.svg`. To regenerate the PNG/ICO files and the Store tiles (Python + Pillow):

```bash
npm run icon   # or: py build/make_icon.py
```

</details>

## 🧩 How it works

| Source | How it's found | How it launches |
|--------|----------------|-----------------|
| **Steam** | `libraryfolders.vdf` + `appmanifest_*.acf` | `steam://rungameid/<appid>` |
| **Epic** | `ProgramData\Epic\…\Manifests\*.item` | `com.epicgames.launcher://` deep link |
| **Xbox** | main `.exe` under `XboxGames\<Game>\Content\` | the `.exe` |
| **GOG** | `HKLM\…\GOG.com\Games` | GOG Galaxy, or the `.exe` (GOG games are DRM-free) |
| **EA app** | `.mfst` manifests under `ProgramData\EA Desktop` / `Origin` | `origin2://` |
| **Ubisoft Connect** | `HKLM\…\Ubisoft\Launcher\Installs` | `uplay://launch/<id>` |
| **Riot** | `ProgramData\Riot Games\RiotClientInstalls.json` | the Riot Client with `--launch-product` |
| **Shortcuts** | desktop `.lnk` / `.exe` of game clients and launchers | the shortcut |
| **Folders** | `.exe` files in folders you add | the `.exe` |
| **Manual** | a `.exe` / `.lnk` / `.url` you pick via **Add Game** | the file |

Linked accounts add what you own on top of that:

| Account | Library comes from |
|---------|--------------------|
| **Steam** | `IPlayerService/GetOwnedGames`, with the token the store page gives your session — no API key to create |
| **Epic** | the launcher's OAuth library API, DLC and soundtracks filtered out |
| **Xbox** | `titlehub` title history, limited to titles playable on PC |
| **GOG** | gog.com's account library, read through your gog.com session |
| **EA** | the EA app's own GraphQL service, with a short-lived token from your EA session |
| **Ubisoft** | the Ubisoft Connect web app's played-games list |

Your library and settings are stored in `%APPDATA%\Arcadia\library.json`; store sessions live separately in the encrypted `accounts.dat` and are never written into `library.json`.

## 🗂️ Project structure

```
Arcadia/
├── main.js                 # Electron main process: window, IPC, tray, icon
├── preload.js              # Secure bridge between the UI and the main process
├── renderer/               # UI (HTML / CSS / JS, with its own 6-language dictionary)
├── src/
│   ├── library.js          # Library & settings store (installed + owned merge, lists)
│   ├── launcher.js         # Game launching
│   ├── downloads.js        # Install hand-off + progress tracking
│   ├── updater.js          # Auto-update from GitHub releases
│   ├── ratings.js          # Metacritic scores (cached, fetched in the background)
│   ├── steamassets.js      # Steam cover art
│   ├── steamcollections.js # Steam collections: read and delete
│   ├── sgdb.js             # SteamGridDB cover lookup
│   ├── vdf.js              # Steam VDF/ACF parser
│   ├── i18n.js             # Strings the main process owns (dialogs, tray)
│   ├── accounts/           # steam, epic, xbox, gog, ea, ubisoft + encrypted token store
│   └── scanners/           # steam, epic, xbox, gog, ea, ubisoft, riot, shortcuts, folders
├── assets/                 # Logo, icons, screenshot
├── build/
│   ├── appx/               # Microsoft Store tile images
│   ├── make_icon.py        # Generates the app icon from the logo
│   ├── dist-store.js       # Microsoft Store package build
│   └── test_*.js           # Headless tests (npm test)
├── store/LISTING.md        # Microsoft Store listing drafts
└── .github/                # CI, release workflow, issue and PR templates
```

Adding another store means one file in `src/accounts/` exporting `{ id, signIn, signOut, status, fetchLibrary }`, listed in `src/accounts/index.js`, and a scanner in `src/scanners/`.

## 🤝 Contributing

Bug reports, ideas and pull requests are welcome — see [`CONTRIBUTING.md`](CONTRIBUTING.md). Found a security issue? Please report it privately as described in [`SECURITY.md`](SECURITY.md).

## 📄 License

[MIT](LICENSE) © 2026 Samet Ege

Arcadia is not affiliated with Valve, Epic Games, Microsoft, CD PROJEKT, Electronic Arts, Ubisoft or Riot Games. Game names, cover art and store logos belong to their respective owners.
