#!/usr/bin/env python3
"""Exercise the collector end-to-end with fixture GitHub responses; no network."""
import contextlib
import io
import json
from pathlib import Path
import subprocess
import sys
import tempfile
from types import SimpleNamespace
import unittest
from unittest.mock import patch
from datetime import datetime, timezone

SCRIPT = Path(__file__).with_name('fetch-workflow-health-data.sh')


def token_line(model=None, scale=1):
    prefix = f'model={model} ' if model else ''
    return prefix + ' '.join(
        f'codex.turn.token_usage.{key}={value * scale}'
        for key, value in {
            'input_tokens': 1000000, 'cached_input_tokens': 200000,
            'non_cached_input_tokens': 800000, 'output_tokens': 100000,
            'total_tokens': 1100000,
        }.items()
    )


class WorkflowHealthTests(unittest.TestCase):
    def collect(self, logs, configured='gpt-5-mini', artifacts=None):
        source = SCRIPT.read_text().split("<<'PY'\n", 1)[1].rsplit('\nPY', 1)[0]
        now = datetime.now(timezone.utc).isoformat().replace('+00:00', 'Z')

        def github(args, **kwargs):
            self.assertEqual(args[0], 'gh')
            if args[1:3] == ['run', 'download']:
                if artifacts is None:
                    return SimpleNamespace(returncode=1, stdout='', stderr='artifact not found')
                directory = Path(args[args.index('--dir') + 1])
                for component, records in artifacts.items():
                    target = directory / component / 'token_usage.jsonl'
                    target.parent.mkdir(parents=True, exist_ok=True)
                    target.write_text(''.join(json.dumps(r) + '\n' for r in records))
                return SimpleNamespace(returncode=0, stdout='', stderr='')
            if args[1:3] == ['run', 'list']:
                result = json.dumps([
                    dict(databaseId=i, status='completed', conclusion='success',
                         createdAt=now, updatedAt=now, event='workflow_dispatch',
                         headBranch='test', url=f'https://example.test/runs/{i}')
                    for i in range(1, len(logs) + 1)
                ])
            elif args[1:3] == ['run', 'view'] and '--log' in args:
                result = logs[int(args[3]) - 1]
            elif args[1:3] == ['run', 'view'] and '--json' in args:
                result = '{"jobs": []}'
            else:
                self.fail(f'Unexpected GitHub command: {args}')
            return SimpleNamespace(returncode=0, stdout=result, stderr='')

        with tempfile.TemporaryDirectory() as directory:
            workspace = Path(directory)
            workflows = workspace / '.github/workflows'
            workflows.mkdir(parents=True)
            (workflows / 'sample.md').write_text(
                f'---\nengine:\n  id: codex\n  model: {configured}\n'
                'on:\n  workflow_dispatch:\n---\nFixture workflow\n'
            )
            output = workspace / 'health.json'
            args = ['collector', 'test/repo', '', str(output), '7', '100', '60']
            with patch.object(sys, 'argv', args), patch.object(Path, 'cwd', return_value=workspace), \
                    patch.object(subprocess, 'run', side_effect=github), \
                    contextlib.redirect_stderr(io.StringIO()):
                exec(compile(source, str(SCRIPT), 'exec'), {'__name__': '__main__'})
            return json.loads(output.read_text())

    def test_known_model_prices_cached_and_uncached_tokens(self):
        result = self.collect([token_line('gpt-5-mini')])
        row = result['workflowSummaries'][0]
        self.assertEqual(row['observedOpenAICostUsd'], 0.405)
        self.assertEqual(row['projectedOpenAICostUsd'], 0.405)
        self.assertEqual((row['tokenRunsObserved'], row['costRunsPriced'], row['costRunsUnpriced']), (1, 1, 0))

    def test_unknown_models_do_not_inherit_gpt_55_rates(self):
        for model in ('gpt-4o', 'gpt-5-codex', 'gpt-5.4-mini', 'future-model'):
            with self.subTest(model=model):
                result = self.collect([token_line(model)], configured=model)
                row = result['workflowSummaries'][0]
                self.assertIsNone(row['observedOpenAICostUsd'])
                self.assertIsNone(result['totals']['observedOpenAICostUsd'])
                self.assertIsNone(row['projectedOpenAICostUsd'])
                self.assertEqual(row['tokenRunsObserved'], 1)
                self.assertEqual(row['costRunsUnpriced'], 1)
                self.assertIn(model, row['modelsObserved'])

    def test_provider_prefix_is_preserved_and_openai_snapshot_is_priced(self):
        model = 'openai/gpt-5-mini-2025-08-07'
        row = self.collect([token_line(model)])['workflowSummaries'][0]
        self.assertIn(model, row['modelsObserved'])
        self.assertEqual(row['observedOpenAICostUsd'], 0.405)

    def test_other_provider_is_not_openai_api_spend(self):
        for observed, configured in [
            ('copilot/gpt-5-mini', 'copilot/gpt-5-mini'),
            ('gpt-5-mini', 'copilot/gpt-5-mini'),
            ('copilot/gpt-5-mini', 'gpt-5-mini'),
        ]:
            with self.subTest(observed=observed, configured=configured):
                row = self.collect([token_line(observed)], configured)['workflowSummaries'][0]
                self.assertIsNone(row['observedOpenAICostUsd'])
                self.assertEqual(row['costRunsUnpriced'], 1)

    def test_missing_log_model_does_not_infer_historical_config(self):
        row = self.collect([token_line()])['workflowSummaries'][0]
        self.assertIsNone(row['observedOpenAICostUsd'])
        self.assertEqual(row['costRunsUnpriced'], 1)

    def test_mixed_models_in_one_run_are_not_majority_priced(self):
        log = token_line('gpt-5-mini') + '\n' + token_line('gpt-5.5', 2)
        row = self.collect([log])['workflowSummaries'][0]
        self.assertIsNone(row['observedOpenAICostUsd'])
        self.assertEqual(row['costRunsUnpriced'], 1)

    def test_partial_model_telemetry_is_not_fully_priced(self):
        log = token_line('gpt-5-mini') + '\n' + token_line(scale=2)
        row = self.collect([log])['workflowSummaries'][0]
        self.assertIsNone(row['observedOpenAICostUsd'])
        self.assertEqual(row['costRunsUnpriced'], 1)

    def test_partial_pricing_suppresses_projection_and_reports_coverage(self):
        result = self.collect([token_line('gpt-5-mini'), token_line('gpt-4o'), 'No token telemetry'])
        row = result['workflowSummaries'][0]
        self.assertEqual(row['observedOpenAICostUsd'], 0.405)
        self.assertIsNone(row['projectedOpenAICostUsd'])
        self.assertEqual((row['tokenRunsObserved'], row['tokenRunsMissing']), (2, 1))
        self.assertEqual((row['costRunsPriced'], row['costRunsUnpriced']), (1, 1))
        self.assertEqual(result['totals']['workflowsWithProjectedCost'], 0)

    def test_known_model_can_project_missing_usage(self):
        row = self.collect([token_line('gpt-5-mini'), 'No token telemetry'])['workflowSummaries'][0]
        self.assertEqual(row['projectedOpenAICostUsd'], 0.81)
        self.assertEqual(row['tokenRunsMissing'], 1)

    def test_model_change_across_runs_suppresses_projection(self):
        row = self.collect([token_line('gpt-5-mini'), token_line('gpt-5.5'), 'No telemetry'])['workflowSummaries'][0]
        self.assertIsNotNone(row['observedOpenAICostUsd'])
        self.assertIsNone(row['projectedOpenAICostUsd'])

    def test_usage_artifact_includes_detection_and_deduplicates_requests(self):
        def record(rid, model='gpt-5-mini-2025-08-07', provider='openai'):
            return dict(event='token_usage', request_id=rid, provider=provider, model=model,
                        input_tokens=1000000, output_tokens=100000, cache_read_tokens=200000)
        a, b = record('agent'), record('detection')
        result = self.collect(['no legacy telemetry'], artifacts={'agent': [a, a], 'detection': [b]})
        row = result['workflowSummaries'][0]
        self.assertEqual(row['tokenTotals']['inputTokens'], 2000000)
        self.assertEqual(row['observedOpenAICostUsd'], 0.81)
        run = result['workflows']['sample']['runs'][0]
        self.assertEqual(run['tokenUsage']['source'], 'usage-artifact')

    def test_artifact_other_provider_remains_unpriced(self):
        r = dict(event='token_usage', request_id='one', provider='copilot', model='gpt-5-mini',
                 input_tokens=100, output_tokens=10, cache_read_tokens=0)
        row = self.collect([''], artifacts={'agent': [r]})['workflowSummaries'][0]
        self.assertEqual(row['tokenRunsObserved'], 1)
        self.assertIsNone(row['observedOpenAICostUsd'])
        self.assertIn('copilot/gpt-5-mini', row['modelsObserved'])

    def test_empty_artifact_falls_back_to_legacy_logs(self):
        row = self.collect([token_line('gpt-5-mini')], artifacts={'agent': []})['workflowSummaries'][0]
        self.assertEqual(row['observedOpenAICostUsd'], 0.405)

    def test_no_runs_has_unavailable_inference_cost(self):
        result = self.collect([])
        self.assertEqual(result['totals']['runs'], 0)
        self.assertIsNone(result['totals']['observedOpenAICostUsd'])
        self.assertEqual(result['workflowSummaries'][0]['health'], 'inactive')


if __name__ == '__main__':
    unittest.main()
