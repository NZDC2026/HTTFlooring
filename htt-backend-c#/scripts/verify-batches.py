#!/usr/bin/env python3
"""Run every discovered integration case in bounded, independent test-host processes.
Requires an already built Release solution and the four HTT_TEST_*_CONNECTION values.
Each parallel invocation must use its own isolated database. No third-party modules.
"""
import argparse
from collections import defaultdict
import json
import os
from pathlib import Path
import re
import subprocess
import sys
import tempfile
import xml.etree.ElementTree as ET

NS = {"t": "http://microsoft.com/schemas/VisualStudio/TeamTest/2010"}
ROOT = Path(__file__).resolve().parents[1]


def execute(args, log, env):
    with log.open("w") as stream:
        result = subprocess.run(args, cwd=ROOT, env=env, stdout=stream, stderr=subprocess.STDOUT)
    return result.returncode


def passed_names(path, expected):
    tree = ET.parse(path)
    counters = tree.find(".//t:Counters", NS).attrib
    rows = tree.findall(".//t:UnitTestResult", NS)
    actual = [r.attrib["testName"] for r in rows]
    if (int(counters["total"]) != len(expected)
            or int(counters["passed"]) != len(expected)
            or int(counters["failed"]) != 0
            or int(counters["notExecuted"]) != 0
            or any(r.attrib["outcome"] != "Passed" for r in rows)
            or set(actual) != set(expected) or len(actual) != len(set(actual))):
        raise RuntimeError(f"Incomplete, skipped, duplicated or failed cases: {path}")
    return actual


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--dotnet", default=os.environ.get("HTT_DOTNET", "dotnet"))
    parser.add_argument("--results", type=Path)
    parser.add_argument("--batch-size", type=int, default=24)
    parser.add_argument("--shard-count", type=int, default=1)
    parser.add_argument("--shard-index", type=int, default=0)
    parser.add_argument("--skip-unit", action="store_true")
    parser.add_argument("--selection", type=Path, help="Exact discovered test-name allowlist; final audit use only")
    args = parser.parse_args()
    if not 1 <= args.batch_size <= 50 or not 0 <= args.shard_index < args.shard_count:
        parser.error("Use batch size 1..50 and a valid shard index/count.")
    for role in ("OWNER", "APP", "WORKER", "PORTAL"):
        value = os.environ.get(f"HTT_TEST_{role}_CONNECTION", "")
        if not re.search(r"(?:^|;)\s*Database\s*=\s*[^;]*test[^;]*", value, re.I):
            parser.error(f"HTT_TEST_{role}_CONNECTION must name an isolated test database.")
    results = args.results or Path(tempfile.mkdtemp(prefix="htt-verify-"))
    results.mkdir(parents=True, exist_ok=True)
    if (results / "summary.json").exists() or (results / "discovery.log").exists():
        parser.error("Choose a fresh results directory; old evidence is never reused.")
    env = dict(os.environ)
    env.setdefault("DOTNET_PROCESSOR_COUNT", "2")
    env.setdefault("DOTNET_GCHeapHardLimit", "40000000")  # hexadecimal: 1 GiB per child process
    common = ["-c", "Release", "--no-build", "--no-restore"]
    discover = [args.dotnet, "test", "tests/Htt.IntegrationTests", *common, "--list-tests"]
    if execute(discover, results / "discovery.log", env):
        raise RuntimeError("Test discovery failed; inspect discovery.log.")
    lines = (results / "discovery.log").read_text().splitlines()
    marker = next((i for i, line in enumerate(lines) if "The following Tests are available:" in line), None)
    if marker is None:
        raise RuntimeError("Discovery output has no test-list marker.")
    names = [line.strip() for line in lines[marker + 1:] if line.startswith("    ") and line.strip()]
    if not names or len(names) != len(set(names)):
        raise RuntimeError("No tests or duplicate discovered test names.")
    if args.selection:
        requested = json.loads(args.selection.read_text())
        if len(requested) != len(set(requested)) or not set(requested) <= set(names):
            raise RuntimeError("Selection contains duplicate or undiscovered tests.")
        names = [n for n in names if n in set(requested)]
    methods = defaultdict(list)
    for name in names:
        method = name.split("(", 1)[0].strip()
        if not re.fullmatch(r"[A-Za-z0-9_.]+", method):
            raise RuntimeError(f"Unsupported test display name; update parser explicitly: {name}")
        methods[method].append(name)
    batches = []
    current = []
    size = 0
    for method, cases in sorted(methods.items()):
        if current and size + len(cases) > args.batch_size:
            batches.append(current)
            current, size = [], 0
        current.append((method, cases))
        size += len(cases)
    if current:
        batches.append(current)
    shards = [[] for _ in range(args.shard_count)]
    loads = [0] * args.shard_count
    for batch in sorted(batches, key=lambda b: -sum(len(c) for _, c in b)):
        index = min(range(args.shard_count), key=lambda i: loads[i])
        shards[index].append(batch)
        loads[index] += sum(len(c) for _, c in batch)
    assigned = [n for batch in shards[args.shard_index] for _, cases in batch for n in cases]
    if not assigned:
        raise RuntimeError("This shard has no tests; choose fewer shards.")
    (results / "manifest.json").write_text(json.dumps({"discoveredCount": len(names),
        "shardIndex": args.shard_index, "shardCount": args.shard_count, "names": assigned}, indent=2))
    if not args.skip_unit:
        command = [args.dotnet, "test", "tests/Htt.UnitTests", *common, "--logger",
            "trx;LogFileName=unit.trx", "--results-directory", str(results / "unit")]
        if execute(command, results / "unit.log", env):
            raise RuntimeError("Unit tests failed; inspect unit.log.")
        unit = ET.parse(results / "unit/unit.trx")
        rows = unit.findall(".//t:UnitTestResult", NS)
        if not rows or any(r.attrib["outcome"] != "Passed" for r in rows):
            raise RuntimeError("Unit tests were missing, skipped or failed.")
    verified = []
    for index, batch in enumerate(shards[args.shard_index]):
        folder = results / f"batch-{index:03d}"
        folder.mkdir()
        expected = [n for _, cases in batch for n in cases]
        test_filter = "|".join("FullyQualifiedName=" + m for m, _ in batch)
        command = [args.dotnet, "test", "tests/Htt.IntegrationTests", *common, "--filter", test_filter,
            "--logger", "console;verbosity=normal", "--logger", "trx;LogFileName=tests.trx",
            "--results-directory", str(folder)]
        if execute(command, folder / "console.log", env):
            raise RuntimeError(f"Batch {index} failed or aborted; inspect {folder}.")
        verified += passed_names(folder / "tests.trx", expected)
        print(f"Verified {len(verified)}/{len(assigned)} cases; batch {index}", flush=True)
    if len(verified) != len(assigned) or set(verified) != set(assigned):
        raise RuntimeError("Shard coverage mismatch.")
    (results / "summary.json").write_text(json.dumps({"status": "PASSED", "passed": len(verified),
        "shardIndex": args.shard_index, "shardCount": args.shard_count, "names": verified}, indent=2))
    print(f"PASSED: {len(verified)} integration cases. Results: {results}", flush=True)


if __name__ == "__main__":
    try:
        main()
    except Exception as error:
        print(f"Verification failed: {error}", file=sys.stderr)
        sys.exit(1)
