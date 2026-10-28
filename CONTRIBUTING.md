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
- **No dependencies.** The published package stays dependency-free. Development tools (tests, build, dzkit-spec) are `devDependencies` and are never installed for users.
- **Format-only checks say so.** If there is no public check-digit algorithm, document that the function checks the format only.

## Shared test cases (dzkit-spec)

The rules and their official sources live in [dzkit-spec](https://github.com/dzkit/dzkit-spec), shared by every dzkit package. `test/spec.test.ts` runs all of its test cases against this package; the version is pinned in `package.json`.

To follow a new dzkit-spec release (for example after a finance law):

```bash
npm install -D dzkit-spec@https://github.com/dzkit/dzkit-spec/archive/refs/tags/v<version>.tar.gz
npm test
```

Failing cases show what changed. Fix the code (or add a runner for a new operation in `test/spec.test.ts`), note it in `CHANGELOG.md`, and open a pull request.

## Yearly maintenance

After each finance law (loi de finances), check whether article 104 of the CIDTA changed. If it did, add a new `IRG_RULES_<year>` object rather than editing the old one, so past payslips can still be recomputed.

## Releasing

Releases are published to npm by GitHub Actions (`.github/workflows/release.yml`), with provenance, so npmjs.com shows which commit and workflow built each version. Nobody publishes from their own computer.

1. In a pull request, update the version in `package.json` (following [semantic versioning](https://semver.org)) and move the "Unreleased" notes in `CHANGELOG.md` under that version.
2. Merge it once CI is green.
3. On GitHub, go to **Releases → Draft a new release**, create the tag `v<version>` on `main` (for example `v0.2.0`), paste the changelog notes, and click **Publish release**.
4. The Release workflow checks that the tag matches `package.json`, runs the type check, tests and build, and publishes to npm. Follow it in the **Actions** tab.

Publishing uses npm trusted publishing: no npm token is stored in the repository.
