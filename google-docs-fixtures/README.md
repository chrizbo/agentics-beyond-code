# Fake Google Docs Scope

This directory models a small configured Google Docs scope for fixture-first
integration work. In a real setup, the scope may be either a shared folder in
My Drive or a Google shared drive. The documents are synthetic and belong to
the same fictional team as the rest of the repository.

The corpus intentionally contains useful tension across functions:

- Product wants to ship a smaller Audit Log Export beta quickly.
- A strategic customer needs longer retention.
- Security policy sets a stronger default than the launch plan currently
  supports.
- The launch plan and weekly brief are appropriate narrow report-back targets.

Use `manifest.json` as the source of document metadata. Use the Markdown files
under `documents/` as normalized snapshots of Google Docs content.

The fixture IDs and URLs are fake. When the demo folder or shared drive is
created, keep the same logical document keys while replacing IDs and URLs with
real values.
