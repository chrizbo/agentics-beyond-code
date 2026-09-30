#!/usr/bin/env python3
"""Offline packaging regression tests; no credentials or service calls."""
import hashlib
import importlib.util
import json
from pathlib import Path
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('builder', Path(__file__).with_name('build-claude-plugin.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class PackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = builder.payload()

    def test_canonical_skills_and_templates_unchanged(self):
        root = builder.ROOT
        for path in (root / '.github/skills').rglob('*'):
            name = path.relative_to(root).as_posix()
            if path.relative_to(root / '.github/skills').parts[0] in builder.EXCLUDED_SKILLS:
                self.assertNotIn(name, self.data)
            elif path.is_file():
                self.assertEqual(self.data[name], path.read_bytes())
        self.assertEqual(sum(name.endswith('/SKILL.md') for name in self.data), 6)
        self.assertNotIn('.github/skills/agentic-workflows/SKILL.md', self.data)

    def test_no_runtime_or_discovery_paths(self):
        for name in self.data:
            self.assertFalse(name.startswith(('.github/workflows/', '.github/scripts/', '.agents/', '.claude/')))
            self.assertNotIn('.DS_Store', name)
        manifest = json.loads(self.data['.claude-plugin/plugin.json'])
        self.assertIn(manifest['icon'].removeprefix('./'), self.data)

    def test_provenance_and_external_dependencies(self):
        info = json.loads(self.data['.claude-plugin/build-info.json'])
        for name, digest in info['sha256'].items():
            self.assertEqual(hashlib.sha256(self.data[name]).hexdigest(), digest)
        index = json.loads(self.data['source-index.json'])
        for name in ('.github/workflows/friday-feedback-trends-report.md',
                     '.github/scripts/fetch-feedback-queue.mjs',
                     '.github/scripts/fetch-launch-data.sh', 'docs/strategy.md'):
            self.assertIn(name, index['files'])
            self.assertIn(index['revision'], index['files'][name]['raw_url'])

    def test_generated_drift_and_symlinks_rejected(self):
        original = builder.ROOT
        try:
            with tempfile.TemporaryDirectory() as temp:
                builder.ROOT = Path(temp)
                builder.sync(self.data)
                builder.check(self.data)
                readme = builder.ROOT / builder.PACKAGE / 'README.md'
                readme.write_text('stale')
                with self.assertRaisesRegex(ValueError, 'stale'):
                    builder.check(self.data)
                builder.sync(self.data)
                readme.unlink()
                readme.symlink_to('LICENSE')
                with self.assertRaisesRegex(ValueError, 'Symlink'):
                    builder.check(self.data)
        finally:
            builder.ROOT = original

    def test_zip_matches_directory_and_is_reproducible(self):
        builder.check(self.data)
        with tempfile.TemporaryDirectory() as temp:
            first = builder.build(Path(temp) / 'a', self.data)
            second = builder.build(Path(temp) / 'b', self.data)
            self.assertEqual(first.read_bytes(), second.read_bytes())
            with zipfile.ZipFile(first) as archive:
                self.assertEqual({n: archive.read(n) for n in archive.namelist()}, self.data)


if __name__ == '__main__':
    unittest.main()
