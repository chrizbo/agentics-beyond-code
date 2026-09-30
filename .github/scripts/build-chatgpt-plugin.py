#!/usr/bin/env python3
"""Build a ChatGPT/Codex compatibility package from the canonical skills."""
import argparse
import hashlib
import importlib.util
import json
from pathlib import Path

spec = importlib.util.spec_from_file_location('claude_package', Path(__file__).with_name('build-claude-plugin.py'))
shared = importlib.util.module_from_spec(spec)
spec.loader.exec_module(shared)
ROOT = shared.ROOT
PACKAGE = Path('plugins/chatgpt/agentics-beyond-code')
MANIFEST = '.codex-plugin/plugin.json'
INFO = '.codex-plugin/build-info.json'


def adapt_skill(name, content):
    # The OpenAI skills/ layout is one directory shallower than .github/skills/.
    # All other instructions/resources are copied without behavioral changes.
    if name.endswith('.md'):
        text = content.decode()
        text = text.replace('three directories above', 'two directories above')
        text = text.replace('(../../../README.md#living-documents)', '(../../README.md#living-documents)')
        return text.encode()
    return content


def payload():
    source = shared.payload()
    manifest = json.loads((ROOT / 'packaging/chatgpt/plugin.json').read_text())
    manifest['version'] = json.loads(source['.claude-plugin/plugin.json'])['version']
    data = {MANIFEST: shared.encoded(manifest),
            'assets/icon.png': source['.claude-plugin/icon.png'],
            'README.md': (ROOT / 'packaging/chatgpt/README.md').read_bytes()}
    for name, content in source.items():
        if name.startswith('.github/skills/'):
            data[name.removeprefix('.github/')] = adapt_skill(name, content)
        elif name in ('LICENSE', 'docs/source-access.md', 'docs/privacy.md', 'source-index.json'):
            data[name] = content
    data[INFO] = shared.encoded({
        'plugin_version': manifest['version'], 'generated': True,
        'source_revision': json.loads(data['source-index.json'])['revision'],
        'sha256': {name: hashlib.sha256(content).hexdigest() for name, content in sorted(data.items())},
    })
    return dict(sorted(data.items()))


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_mutually_exclusive_group()
    actions.add_argument('--sync', action='store_true')
    actions.add_argument('--check', action='store_true')
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    data = payload()
    if args.sync:
        shared.sync(data, PACKAGE, INFO)
    shared.check(data, PACKAGE)
    if args.check:
        print('Generated ChatGPT plugin matches canonical sources.')
    else:
        archive = shared.build(args.output_dir.resolve(), data, MANIFEST, '-chatgpt')
        archive.with_suffix('.zip.sha256').write_text(hashlib.sha256(archive.read_bytes()).hexdigest() + '  ' + archive.name + '\n')


if __name__ == '__main__':
    main()
