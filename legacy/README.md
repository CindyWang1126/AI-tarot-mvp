# Legacy Streamlit prototype

This folder preserves the pre-rebuild Streamlit implementation, original source JSON, retained Rider–Waite–Smith source scans, and the previous generated symbol deck for project history.

It is not the production application. The production entrypoint is the Next.js app at the repository root.

Production copies the audited 78-card source scan set from `assets/cards/` into stable public paths. The repository did not retain the scans' original download URLs; public-domain corroboration and this limitation are recorded in `docs/source-audit.md`.

`assets/generated-symbol-deck/` contains the previous abstract SVG production deck and is not loaded by the current UI.
