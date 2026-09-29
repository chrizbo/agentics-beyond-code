# Accessing repository source from the plugin

The installed package contains skills, references, and blank templates. It does
not contain `.github/workflows`, `.github/scripts`, integration code, or demo
artifacts. Those paths in the skills refer to the external source repository.
This is a real package boundary, not a relocation of executable files to evade
review: no downloaded integration code runs as part of plugin installation.

1. Prefer a source checkout explicitly supplied by the user. Read its current
   files and report that checkout's revision or local edits when known.
2. Otherwise read `source-index.json` at the plugin root. Its `repository`,
   `revision`, and file entries identify public reference files. Search the
   entries for the requested workflow or dependency; the list includes agentic
   Markdown, deterministic YAML, compiled YAML, scripts, docs, and fixtures.
3. Read only the selected file using its `raw_url` or `url`, with available
   read-only web/file tools. Public source retrieval needs no credential; do
   not inspect local tokens or include user data in these requests. If fetching
   raw bytes, compare their SHA-256 with the index when practical. Browser text
   extraction is not byte-identical; do not claim hash verification from it.
4. Follow selected dependencies at that same revision when needed: helper
   scripts establish data shapes and runtime requirements, compiled workflows
   establish generated behavior, and docs explain conventions. Read source as
   reference material. Do not download and execute helpers just to draft a plan.
5. If the user requests latest source, use their current checkout or resolve
   the public repository's current revision and report it. The index is a pinned
   reference, not a live catalog. Do not silently combine revisions.
6. If retrieval fails, name the missing source and ask for a checkout or those
   specific files. Continue independent assessment/template work when useful;
   do not reconstruct source behavior from names or old summaries.

When implementation is requested, copy/adapt only needed files into the user's
workspace and review their dependencies and credentials for that target runtime.
GitHub Actions secrets, cloud routine credentials, and plugin user configuration
are distinct mechanisms. The plugin itself does not request or read credentials.
Do not add secret collection solely because a reference workflow mentions one.
Use authorized connectors or the selected runtime's explicit secret setup for
actual execution, and disclose what service receives each credential.

`build-info.json` hashes describe the installed package; `source-index.json`
hashes describe the external files. Neither proves that a file is the newest
upstream version. Report the plugin version separately from the workflow revision.

## Source-index lookup

The top-level `files` value is an object keyed by repository-relative path,
not a list of objects with a `path` field. Each value has `url`, `raw_url`,
and `sha256`. For example, this read-only lookup prints only the selected
workflow's metadata (it does not fetch or execute it):

```sh
python3 - "/absolute/path/to/plugin/source-index.json" <<'PYTHON'
import json
import sys

with open(sys.argv[1], encoding="utf-8") as source:
    index = json.load(source)
path = ".github/workflows/friday-feedback-trends-report.md"
entry = index["files"][path]
print(json.dumps({"revision": index["revision"], "path": path, **entry}, indent=2))
PYTHON
```

When searching by partial name, iterate `index["files"].items()` as
`for path, metadata in index["files"].items()`; the path is the key.
Do not dump the entire index when a targeted lookup is enough.
