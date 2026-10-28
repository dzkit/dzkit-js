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

## Data from dzkit-spec

The rules, their values and their official sources live in [dzkit-spec](https://github.com/dzkit/dzkit-spec), shared by every dzkit package. This package uses it in two ways, both at development time only (it is a `devDependency`, never installed for users):

- **Data:** `npm run generate` writes `src/generated/spec-data.ts` from the spec. Never edit that file by hand; CI fails if it doesn't match the pinned spec.
- **Tests:** `test/spec.test.ts` runs every shared test case against this package.

The logic (how a key is computed, how the IRG steps apply) stays in `src/`; only the values come from the spec. To change a value itself, open an issue or pull request in dzkit-spec, with its source, rather than here.

### Following a new dzkit-spec release

For example after a finance law changes the IRG scale:

```bash
npm install -D dzkit-spec@https://github.com/dzkit/dzkit-spec/archive/refs/tags/v<version>.tar.gz
npm run generate
npm test
```

Review the diff of `src/generated/spec-data.ts`: it shows exactly which values changed. If the generator or a test fails, the spec added something new (a rule, an operation, a format change): adapt `scripts/generate-data.mjs`, `src/` or `test/spec.test.ts`. Note the change in `CHANGELOG.md` and open a pull request.

## Yearly maintenance

After each finance law (loi de finances), dzkit-spec is updated first: its weekly Journal officiel watch flags new texts that mention a watched rule. Then follow the new dzkit-spec release here, as described above.

## Releasing

Releases are published to npm by GitHub Actions (`.github/workflows/release.yml`), with provenance, so npmjs.com shows which commit and workflow built each version. Nobody publishes from their own computer.

1. In a pull request, update the version in `package.json` (following [semantic versioning](https://semver.org)) and move the "Unreleased" notes in `CHANGELOG.md` under that version.
2. Merge it once CI is green.
3. On GitHub, go to **Releases → Draft a new release**, create the tag `v<version>` on `main` (for example `v0.2.0`), paste the changelog notes, and click **Publish release**.
4. The Release workflow checks that the tag matches `package.json`, runs the type check, tests and build, and publishes to npm. Follow it in the **Actions** tab.

Publishing uses npm trusted publishing: no npm token is stored in the repository.
