# Contributing

Aureum is led by Shrinjoy Ghosh.

Small, concrete patches are welcome. Open an issue before a large rewrite so the work stays one ledger, not two products.

## What a change should do

- Keep `aureum.html` usable on its own. No install, no account, no network call for the ledger.
- Keep notes in the browser (`localStorage`, key `aureum-capital-classes-v1`). Do not add a server that receives someone's strategies.
- Keep backup files compatible. A JSON export from an older 1.0 file should still import.
- Run `npm test` and `npm run build`, and open the built `aureum.html` before you ask for review.

## Review

Pull requests land on `main` after the project lead looks at them. Match the tone already in the studio: plain sentences, no slogans in the interface.

Copyright in new source files stays:

```
Copyright (c) 2026 Shrinjoy Ghosh
MIT License. See LICENSE in the repository root.
```
