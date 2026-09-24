# Security policy

Arcadia keeps store sessions for the accounts you link, so security reports are
taken seriously.

## Supported versions

Only the [latest release](https://github.com/SametEge/Arcadia/releases/latest)
receives fixes. Arcadia updates itself, so most users are on it already.

## Reporting a vulnerability

**Please don't open a public issue.** Report it privately through
[GitHub's security advisories](https://github.com/SametEge/Arcadia/security/advisories/new)
instead.

Helpful things to include:

- what an attacker could do, and what they need first (local access, a
  malicious website, a crafted game manifest…)
- steps to reproduce, or a proof of concept
- the Arcadia version and how it was installed

Reports are answered as soon as possible. Once a fix is released, the advisory
is published with credit to you, unless you'd rather stay anonymous.

## Scope

In scope: anything that exposes linked-account sessions (`accounts.dat`),
lets web content reach the main process, runs unexpected code through
scanning or launching, or tampers with updates.

Out of scope: the stores' own services and clients, and the SmartScreen
warning on unsigned installers (see the README).
