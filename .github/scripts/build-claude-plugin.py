#!/usr/bin/env python3
"""Build a deterministic, self-contained Claude plugin from repository sources."""
import argparse
import hashlib
import json
from pathlib import Path
import re
import subprocess
import zipfile

ROOT = Path(__file__).resolve().parents[2]


def build(output):
    manifest = json.loads((ROOT / '.claude-plugin/plugin.json').read_text())
    if manifest['skills'] != './.github/skills/':
        raise ValueError('Expected canonical skill directory')
    if not re.fullmatch(r'\d+\.\d+\.\d+', manifest['version']):
        raise ValueError('Expected a semantic release version')
    marketplace = json.loads((ROOT / '.claude-plugin/marketplace.json').read_text())
    if marketplace['plugins'][0]['name'] != manifest['name'] or marketplace['plugins'][0]['source'] != './':
        raise ValueError('Marketplace must reference the root plugin')
    # Git's tracked inventory avoids shipping local credentials, caches, or build output.
    # Read working-tree bytes so maintainers can test edits before committing them.
    tracked = subprocess.check_output(['git', 'ls-files', '-z'], cwd=ROOT).decode().split('\0')
    files = {p for p in tracked if p and not p.startswith(('.agents/', '.claude/', 'dist/'))}
    files.update({'.claude-plugin/plugin.json', 'docs/claude-cowork-plugin.md'})
    files.discard('.claude-plugin/marketplace.json')
    skills = sorted((ROOT / '.github/skills').glob('*/SKILL.md'))
    if not skills:
        raise ValueError('No skills found')
    for skill in skills:
        if skill.relative_to(ROOT).as_posix() not in files:
            raise ValueError(f'Add new skills to Git before building: {skill}')
    # Supporting resources must not silently disappear from an otherwise valid ZIP.
    for path in (ROOT / '.github/skills').rglob('*'):
        if path.is_file() and path.relative_to(ROOT).as_posix() not in files:
            raise ValueError(f'Add skill resources to Git before building: {path}')
    payload = {}
    for name in sorted(files):
        path = ROOT / name
        if path.is_symlink() or not path.is_file():
            raise ValueError(f'Expected regular source file: {name}')
        payload[name] = path.read_bytes()
    provenance = {
        'plugin_version': manifest['version'],
        'base_commit': subprocess.check_output(
            ['git', 'rev-parse', 'HEAD'], cwd=ROOT).decode().strip(),
        'content_origin': 'working-tree bytes; base_commit alone does not identify local edits',
        'gh_aw_skill_version': (ROOT / '.github/skills/agentic-workflows/.upstream-version').read_text().strip(),
        'sha256': {name: hashlib.sha256(data).hexdigest() for name, data in payload.items()},
    }
    payload['.claude-plugin/build-info.json'] = (json.dumps(provenance, indent=2) + '\n').encode()
    output.mkdir(parents=True, exist_ok=True)
    archive = output / f"{manifest['name']}-{manifest['version']}.zip"
    with zipfile.ZipFile(archive, 'w', compression=zipfile.ZIP_DEFLATED) as bundle:
        for name, data in payload.items():
            path = ROOT / name
            info = zipfile.ZipInfo(name, date_time=(2020, 1, 1, 0, 0, 0))
            info.compress_type = zipfile.ZIP_DEFLATED
            executable = name in files and path.stat().st_mode & 0o111
            info.external_attr = (0o100755 if executable else 0o100644) << 16
            bundle.writestr(info, data)
    with zipfile.ZipFile(archive) as bundle:
        if bundle.testzip() is not None:
            raise ValueError('Archive integrity check failed')
    print(f'{archive} ({len(skills)} skills, {len(payload)} files)')
    return archive


if __name__ == '__main__':
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--output-dir', type=Path, default=ROOT / 'dist')
    args = parser.parse_args()
    build(args.output_dir.resolve())
