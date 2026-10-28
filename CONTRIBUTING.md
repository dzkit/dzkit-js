# Contributing

Thanks for helping! Issues and pull requests are welcome in English, French or Arabic.

## Setup

```bash
npm install
npm test          # run the tests
npm run coverage  # with coverage
npm run typecheck
npm run build
npm run demo      # build the playground into ./site, then serve it (e.g. npx serve site)
```

## Rules of thumb

- **Every rule needs a source.** When you add or change a rule (a tax bracket, a prefix, a key algorithm), link the official text or a reliable article in the PR, and add the reference values from that source as tests.
- **Real examples beat theory.** A RIP from a real document, an IRG amount from a real payslip: anonymise them, then add them to the tests.
- **No dependencies.** The package stays dependency-free.
- **Format-only checks say so.** If there is no public check-digit algorithm, document that the function checks the format only.

## Yearly maintenance

After each finance law (loi de finances), check whether article 104 of the CIDTA changed. If it did, add a new `IRG_RULES_<year>` object rather than editing the old one, so past payslips can still be recomputed.

## Releasing

1. Update `CHANGELOG.md` and the version in `package.json`
2. `npm publish` (runs typecheck, tests and build first)
3. Tag the release on GitHub
