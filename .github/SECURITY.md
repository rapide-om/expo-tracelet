# Security Policy

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x     | :white_check_mark: |

While the package is on 0.x, only the latest minor receives security patches.

## Reporting a Vulnerability

If you discover a security vulnerability, **do not open a public issue**.

1. Email: dev@rapide.om
2. Include:
    - Description of the vulnerability
    - Steps to reproduce or proof-of-concept
    - Affected versions
    - Suggested fix (if any)

Expected response window:

-   Initial acknowledgement within 72 hours
-   Status updates at least weekly during triage
-   Public disclosure after a fix ships, with credit to the reporter (if desired)

## Scope

This package is a thin Expo Modules bridge over the [Tracelet SDK](https://github.com/Ikolvi/Tracelet). Vulnerabilities in the upstream native engines (Android AAR / iOS Pod) should be reported to the [upstream project](https://github.com/Ikolvi/Tracelet/security). Vulnerabilities in this bridge layer (the TypeScript public API, the config plugin, the Kotlin/Swift glue code) are in scope.

## Security best practices for consumers

-   Keep this package and the upstream Tracelet SDK pin up to date.
-   Never log or expose API tokens or driver IDs that you pass to `Tracelet.ready({ http })`.
-   The Tracelet SDK persists locations in a SQLite database on the device. If your threat model requires it, enable the upstream `encryptDatabase` option (see Tracelet docs).
