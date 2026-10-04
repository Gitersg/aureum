# Aureum

A personal capital-class ledger.

You set the monthly amount you want to receive. Then you write the paths that can get you there, and the ones that would spend you to do it. S class is the summit. D class is the fail path, named so it cannot pose as a plan.

Project lead: [Shrinjoy Ghosh](https://github.com/Gitersg)

## Download the file

No install. No account. One file, then a browser.

**[Download aureum.html](https://github.com/Gitersg/aureum/releases/latest/download/aureum.html)**

Save it and open it. That is the whole application. Your ledger is written into this browser’s local storage for that file. It is not sent anywhere. Closing the tab does not clear it. Clearing the browser’s site data does, so export a JSON backup when the notes matter.

The same file sits in this repository: [`aureum.html`](aureum.html). The release link above is the direct download.

| Class | What belongs there |
| --- | --- |
| S | The summit. Ownership, yield, and a life that stays intact. |
| A | Excellent leverage. A skill or product that can fund the summit. |
| B | Sound work that protects you and still feeds the portfolio. |
| C | Caution. The number arrives, and growth does not. |
| D | The fail path. Name it so it cannot pose as a plan. |

Everything is editable: the amount, the dedication, each class note, and every strategy. Mark the amount reached when it is true, and unmark it if it is not.

## On your own machine

1. Download `aureum.html`.
2. Open it in Chrome, Firefox, Safari, or Edge.
3. Write. The browser keeps the ledger under the key `aureum-capital-classes-v1`.
4. Use **Export JSON** for a backup you can move. **Import JSON** restores it, including on another browser.

Starter notes are an example — about ₹15,000 a month, and the kind of capital that could carry that as income rather than hours. Change every word.

If a browser refuses storage for a page opened straight from disk, the studio says so. Export the JSON before you close the tab. Opening the downloaded file from Firefox, or from a normal local address, keeps the ledger in that browser.

## Layout of the repository

```
aureum.html          the file people download and open
src/ledger.js        classes, score, money, backup checks
src/studio.js        the page
src/studio.css
scripts/build.mjs    writes aureum.html from the source
```

```bash
npm test
npm run build
```

Node is only for the checks and the build. The downloaded file does not need it.

## Licence

[MIT](LICENSE). Copyright © 2026 Shrinjoy Ghosh.

You can use, copy, and change Aureum, including in your own projects. Keep the copyright notice with the copies.

This is a ledger, not advice. The paths you write are yours.
