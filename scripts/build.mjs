import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const css = readFileSync(join(root, "src/studio.css"), "utf8");
const ledger = readFileSync(join(root, "src/ledger.js"), "utf8");
const studio = readFileSync(join(root, "src/studio.js"), "utf8");

const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Aureum</title>
  <meta name="description" content="Aureum is a personal capital-class ledger. Set a monthly amount, write the paths from S to D, and keep the notes in this browser.">
  <meta name="theme-color" content="#121614">
  <meta name="author" content="Shrinjoy Ghosh">
  <link rel="icon" href="data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='8' fill='%23121614'/%3E%3Ctext x='16' y='22' text-anchor='middle' font-family='Georgia' font-size='16' fill='%23d4b072'%3EA%3C/text%3E%3C/svg%3E">
  <style>
${css}
  </style>
</head>
<body>
  <!--
    Aureum
    Copyright (c) 2026 Shrinjoy Ghosh
    MIT License — https://github.com/Gitersg/aureum

    This file is the application. Open it in a browser.
    The ledger is stored in localStorage for this file. It is not uploaded.
  -->
  <div id="app"></div>
  <script>
${ledger}
${studio}
  </script>
</body>
</html>
`;

writeFileSync(join(root, "aureum.html"), html);
console.log("wrote aureum.html", html.length);
