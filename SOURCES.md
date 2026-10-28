# Sources

The rules dzkit-js implements, the official texts behind them and how closely each was checked are kept in one place, shared by every dzkit package: **[dzkit-spec](https://github.com/dzkit/dzkit-spec)**.

- **[Trust report](https://github.com/dzkit/dzkit-spec/blob/main/TRUST.md)**: the trust level of every rule, its strongest source, when it was last checked and when it must be checked again
- **[sources.yaml](https://github.com/dzkit/dzkit-spec/blob/main/sources.yaml)**: every text, with its Journal officiel issue and links to the official PDFs
- **[hierarchy.yaml](https://github.com/dzkit/dzkit-spec/blob/main/hierarchy.yaml)**: how Algerian legal texts rank, from the Constitution to circulars
- **[Shared test cases](https://github.com/dzkit/dzkit-spec/tree/main/vectors)**: inputs and expected values every dzkit package must reproduce; dzkit-js passes all of them

To report a rule change or a wrong value, open an issue in [dzkit-spec](https://github.com/dzkit/dzkit-spec/issues/new/choose).
