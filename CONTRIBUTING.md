# Contributing to Arcadia

Thanks for wanting to help! Bug reports, ideas, translations and pull requests
are all welcome.

## Reporting a bug or suggesting an idea

Open an [issue](https://github.com/SametEge/Arcadia/issues/new/choose) and pick
the template that fits. For bugs, the Arcadia version (Settings → About), your
Windows version and the store involved save a lot of back-and-forth.

Security problems are the exception — please follow [`SECURITY.md`](SECURITY.md)
instead of opening a public issue.

## Setting up

You need Windows 10/11 and [Node.js](https://nodejs.org) 18 or newer.

```bash
git clone https://github.com/SametEge/Arcadia.git
cd Arcadia
npm install
npm start
```

The headless tests (`npm test`) run on any OS, so you can work on the library,
parsers and account code from Linux or macOS too. Scanning for and launching
real games needs Windows.

## Making a change

1. Fork the repo and create a branch from `main`.
2. Keep the change focused — one fix or feature per pull request.
3. Run `npm test` before pushing. CI runs it again, and also builds the
   installer on Windows.
4. Open a pull request and fill in the template.

### Guidelines

- **Match the surrounding code.** Plain CommonJS, no build step, no framework in
  the renderer. Comments explain *why*, not *what*.
- **Six languages, always.** Every new UI string goes into all six tables of
  `I18N` in `renderer/app.js` (and `src/i18n.js` for native dialogs and the
  tray). `build/test_i18n.js` fails if a language is missing a key. If you
  can't translate a string, add the English text and say so in the PR.
- **Never handle passwords.** Store sign-in always happens on the store's own
  page; tokens only go through `src/accounts/tokens.js`, which encrypts them.
- **Changelog.** Note user-facing changes under **Unreleased** in
  [`CHANGELOG.md`](CHANGELOG.md).

### Adding a store

A linked account is one file in `src/accounts/` exporting
`{ id, signIn, signOut, status, fetchLibrary }`, listed in
`src/accounts/index.js`. Installed games come from a scanner in
`src/scanners/`, registered in `src/scanners/index.js`. The existing providers
are good templates — `gog.js` is the smallest.

## License

By contributing, you agree that your contributions are licensed under the
[MIT License](LICENSE).
