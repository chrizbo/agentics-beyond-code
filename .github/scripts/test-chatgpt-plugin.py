#!/usr/bin/env python3
"""Offline checks for the OpenAI package, relocation, and shared version."""
import hashlib
import importlib.util
import json
from pathlib import Path
import posixpath
import re
import tempfile
import unittest
import zipfile

spec = importlib.util.spec_from_file_location('chatgpt_package', Path(__file__).with_name('build-chatgpt-plugin.py'))
builder = importlib.util.module_from_spec(spec)
spec.loader.exec_module(builder)


class ChatGPTPackageTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.data = builder.payload()

    def test_inventory_and_version(self):
        manifest = json.loads(self.data[builder.MANIFEST])
        release = json.loads((builder.ROOT / 'packaging/claude/plugin.json').read_text())
        self.assertEqual(manifest['version'], release['version'])
        self.assertEqual(manifest['name'], builder.PACKAGE.name)
        self.assertEqual(manifest['skills'], './skills/')
        self.assertEqual(sum(n.endswith('/SKILL.md') for n in self.data), 7)
        self.assertNotIn('skills/agentic-workflows/SKILL.md', self.data)
        self.assertFalse(any(n.startswith(('.github/', '.claude-plugin/')) for n in self.data))
        self.assertNotIn('mcpServers', manifest)
        for field in ('composerIcon', 'logo'):
            self.assertIn(manifest['interface'][field].removeprefix('./'), self.data)

    def test_public_listing_limits_and_icon(self):
        manifest = json.loads(self.data[builder.MANIFEST])
        interface = manifest['interface']
        for field, limit in [('displayName', 30), ('shortDescription', 30),
                             ('longDescription', 4000), ('developerName', 80)]:
            self.assertLessEqual(len(interface[field]), limit, field)
        self.assertLessEqual(len(interface['defaultPrompt']), 3)
        for prompt in interface['defaultPrompt']:
            self.assertLessEqual(len(prompt), 128)
        import struct
        icon = self.data[interface['logo'].removeprefix('./')]
        self.assertEqual(icon[:8], b'\x89PNG\r\n\x1a\n')
        width, height = struct.unpack('>II', icon[16:24])
        self.assertEqual(width, height)
        self.assertTrue(48 <= width <= 4096)
        self.assertLessEqual(len(icon), 5 * 1024 * 1024)

    def test_references_resolve_after_relocation(self):
        for name, content in self.data.items():
            if not name.startswith('skills/') or not name.endswith('.md'):
                continue
            text = content.decode()
            for link in re.findall(r'\]\(([^)]+)\)', text):
                if '://' in link or link.startswith('#'):
                    continue
                path = posixpath.normpath(posixpath.join(posixpath.dirname(name), link.split('#')[0]))
                self.assertIn(path, self.data, (name, link))
            if name.endswith('/SKILL.md'):
                self.assertNotIn('three directories above', text)
                self.assertIn('docs/source-access.md', self.data)

    def test_shared_resources_and_integrity(self):
        source = builder.shared.payload()
        for name in ('source-index.json', 'docs/source-access.md', 'docs/privacy.md', 'LICENSE'):
            self.assertEqual(self.data[name], source[name])
        info = json.loads(self.data[builder.INFO])
        for name, digest in info['sha256'].items():
            self.assertEqual(hashlib.sha256(self.data[name]).hexdigest(), digest)
        for name, content in source.items():
            if name.startswith('.github/skills/'):
                self.assertEqual(self.data[name.removeprefix('.github/')], builder.adapt_skill(name, content))

    def test_drift_unknown_files_and_reproducibility(self):
        shared = builder.shared
        original = shared.ROOT
        try:
            with tempfile.TemporaryDirectory() as temp:
                shared.ROOT = Path(temp)
                shared.sync(self.data, builder.PACKAGE, builder.INFO)
                shared.check(self.data, builder.PACKAGE)
                path = shared.ROOT / builder.PACKAGE / 'README.md'
                path.write_text('stale')
                with self.assertRaisesRegex(ValueError, 'stale'):
                    shared.check(self.data, builder.PACKAGE)
                shared.sync(self.data, builder.PACKAGE, builder.INFO)
                unknown = path.parent / 'user-file.txt'
                unknown.write_text('preserve me')
                with self.assertRaisesRegex(ValueError, 'refusing to delete'):
                    shared.sync(self.data, builder.PACKAGE, builder.INFO)
                self.assertEqual(unknown.read_text(), 'preserve me')
                a = shared.build(Path(temp) / 'a', self.data, builder.MANIFEST, '-chatgpt')
                b = shared.build(Path(temp) / 'b', self.data, builder.MANIFEST, '-chatgpt')
                self.assertEqual(a.read_bytes(), b.read_bytes())
                with zipfile.ZipFile(a) as archive:
                    self.assertEqual({n: archive.read(n) for n in archive.namelist()}, self.data)
        finally:
            shared.ROOT = original


if __name__ == '__main__':
    unittest.main()
