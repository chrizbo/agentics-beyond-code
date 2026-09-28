#!/usr/bin/env python3
"""Generate/check the minimal directory plugin and build its reproducible ZIP."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]
PACKAGE = Path('plugins/agentics-beyond-code')


def encoded(value):
    return (json.dumps(value, indent=2, ensure_ascii=False) + '\n').encode()


def git(*args):
    return subprocess.check_output(['git', *args], cwd=ROOT)


def source_index():
    source = json.loads((ROOT / 'packaging/claude/source.json').read_text())
    if source['repository'] != 'https://github.com/chrizbo/agentics-beyond-code':
        raise ValueError('Expected the public reference repository')
    revision = source['revision']
    if not re.fullmatch(r'[0-9a-f]{40}', revision):
        raise ValueError('Pin external source to a full commit SHA')
    files = {}
    for name in git('ls-tree', '-r', '--name-only', revision).decode().splitlines():
        if not (name == 'README.md' or name.startswith((
            '.github/workflows/', '.github/scripts/', '.github/policies/',
            '.github/ISSUE_TEMPLATE/', 'docs/', 'feedback-fixtures/',
            'google-calendar-fixtures/', 'google-docs-fixtures/', 'slack-fixtures/'))):
            continue
        if not name.endswith(('.md', '.yml', '.yaml', '.json', '.mjs', '.js', '.py', '.sh')):
            continue
        data = git('show', f'{revision}:{name}')
        files[name] = {
            'url': f"{source['repository']}/blob/{revision}/{name}",
            'raw_url': f'https://raw.githubusercontent.com/chrizbo/agentics-beyond-code/{revision}/{name}',
            'sha256': hashlib.sha256(data).hexdigest(),
        }
    if '.github/workflows/friday-feedback-trends-report.md' not in files:
        raise ValueError('Pinned revision is missing the reference workflow')
    return {**source, 'files': files}


def payload():
    manifest = json.loads((ROOT / 'packaging/claude/plugin.json').read_text())
    if manifest['skills'] != './.github/skills/' or manifest['icon'] != './.claude-plugin/icon.png':
        raise ValueError('Unexpected skill or icon path')
    if not re.fullmatch(r'\d+\.\d+\.\d+', manifest['version']):
        raise ValueError('Expected semantic version')
    market = json.loads((ROOT / '.claude-plugin/marketplace.json').read_text())
    if market['plugins'][0]['name'] != manifest['name'] or market['plugins'][0]['source'] != f'./{PACKAGE}':
        raise ValueError('Marketplace must reference the dedicated package')
    mapping = {
        '.claude-plugin/plugin.json': ROOT / 'packaging/claude/plugin.json',
        '.claude-plugin/icon.png': ROOT / 'packaging/claude/icon.png',
        'README.md': ROOT / 'packaging/claude/README.md',
        'LICENSE': ROOT / 'LICENSE',
        'docs/source-access.md': ROOT / 'packaging/claude/source-access.md',
        'docs/privacy.md': ROOT / 'packaging/claude/privacy.md',
    }
    skills = list((ROOT / '.github/skills').glob('*/SKILL.md'))
    if len(skills) != 4:
        raise ValueError('Review package scope when changing the four-skill inventory')
    for path in (ROOT / '.github/skills').rglob('*'):
        if path.is_symlink():
            raise ValueError(f'Canonical resources must be regular files: {path}')
        if path.is_file():
            if path.name == '.DS_Store' or '__pycache__' in path.parts:
                raise ValueError(f'Remove local metadata from canonical skills: {path}')
            mapping[path.relative_to(ROOT).as_posix()] = path
    data = {}
    for name, path in mapping.items():
        if path.is_symlink() or not path.is_file():
            raise ValueError(f'Expected regular source file: {path}')
        data[name] = path.read_bytes()
    data['source-index.json'] = encoded(source_index())
    data['.claude-plugin/build-info.json'] = encoded({
        'plugin_version': manifest['version'],
        'generated': True,
        'source_revision': json.loads(data['source-index.json'])['revision'],
        'gh_aw_skill_version': (ROOT / '.github/skills/agentic-workflows/.upstream-version').read_text().strip(),
        'sha256': {name: hashlib.sha256(content).hexdigest() for name, content in sorted(data.items())},
    })
    return dict(sorted(data.items()))


def sync(data):
    directory = ROOT / PACKAGE
    old_index = directory / '.claude-plugin/build-info.json'
    previous = set(json.loads(old_index.read_text())['sha256']) if old_index.is_file() else set()
    for path in directory.rglob('*') if directory.exists() else []:
        if path.is_symlink():
            raise ValueError(f'Unexpected symlink in generated package: {path}')
        if path.is_file() and path.relative_to(directory).as_posix() not in data:
            if path.relative_to(directory).as_posix() not in previous:
                raise ValueError(f'Unexpected file; refusing to delete: {path}')
            path.unlink()
    for name, content in data.items():
        path = directory / name
        path.parent.mkdir(parents=True, exist_ok=True)
        path.write_bytes(content)


def check(data):
    directory = ROOT / PACKAGE
    actual = {}
    for path in directory.rglob('*'):
        if path.is_symlink():
            raise ValueError(f'Symlink in generated package: {path}')
        if path.is_file():
            actual[path.relative_to(directory).as_posix()] = path.read_bytes()
    if actual != data:
        names = sorted(name for name in actual.keys() | data.keys() if actual.get(name) != data.get(name))
        raise ValueError('Generated plugin is stale; run --sync. Differences: ' + ', '.join(names))


def build(output, data):
    manifest = json.loads(data['.claude-plugin/plugin.json'])
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f"{manifest['name']}-{manifest['version']}.zip"
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
        for name, content in data.items():
            info = zipfile.ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            info.external_attr = 0o100644 << 16
            bundle.writestr(info, content)
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise ValueError('Archive integrity check failed')
    print(f'{archive} (4 skills, {len(data)} files)')
    return archive


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    actions = parser.add_mutually_exclusive_group()
    actions.add_argument('--sync', action='store_true', help='Regenerate the checked-in directory package, then build')
    actions.add_argument('--check', action='store_true', help='Verify generated files without writing')
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    data = payload()
    if args.sync:
        sync(data)
    check(data)
    if args.check:
        print('Generated plugin matches canonical sources.')
    else:
        build(args.output_dir.resolve(), data)


if __name__ == '__main__':
    main()
