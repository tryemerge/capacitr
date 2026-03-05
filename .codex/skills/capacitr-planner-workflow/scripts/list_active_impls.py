#!/usr/bin/env python3
"""List or pick active implementation plans for /work-like flows."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path

ACTIVE_STATUSES = {"approved", "in-progress"}


def parse_frontmatter(md_path: Path) -> dict[str, str]:
    text = md_path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    end = text.find("\n---\n", 4)
    if end == -1:
        return {}
    raw = text[4:end]
    out: dict[str, str] = {}
    for line in raw.splitlines():
        if ":" not in line:
            continue
        k, v = line.split(":", 1)
        out[k.strip()] = v.strip().strip('"').strip("'")
    return out


def load_active_impls(repo_root: Path) -> list[dict[str, str]]:
    impl_dir = repo_root / "apps/docs/content/planning/impl"
    rows: list[dict[str, str]] = []
    for md in sorted(impl_dir.glob("*.md")):
        if md.name == "index.md":
            continue
        fm = parse_frontmatter(md)
        status = fm.get("status", "")
        if status not in ACTIVE_STATUSES:
            continue
        rows.append(
            {
                "file": md.name,
                "path": str(md),
                "title": fm.get("title", md.name),
                "status": status,
                "date": fm.get("date", ""),
            }
        )
    return rows


def print_table(rows: list[dict[str, str]]) -> None:
    if not rows:
        print("No active impl docs (approved/in-progress).")
        return
    print("Active impl docs:")
    for i, r in enumerate(rows, start=1):
        print(f"{i}. {r['file']} | {r['status']} | {r['title']}")


def pick_with_fzf(rows: list[dict[str, str]]) -> str | None:
    lines = [f"{r['file']}\t{r['status']}\t{r['title']}" for r in rows]
    try:
        proc = subprocess.run(
            ["fzf", "--prompt", "Select impl> ", "--with-nth", "1,2,3", "--delimiter", "\t"],
            input="\n".join(lines),
            text=True,
            capture_output=True,
            check=False,
        )
    except FileNotFoundError:
        return None
    picked = proc.stdout.strip()
    if not picked:
        return None
    return picked.split("\t", 1)[0]


def pick_with_number(rows: list[dict[str, str]]) -> str | None:
    print_table(rows)
    try:
        raw = input("Choose number: ").strip()
    except EOFError:
        return None
    if not raw.isdigit():
        return None
    idx = int(raw)
    if idx < 1 or idx > len(rows):
        return None
    return rows[idx - 1]["file"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--format", choices=["table", "json", "paths"], default="table")
    parser.add_argument("--pick", action="store_true", help="Pick one active impl (fzf, fallback to numbered).")
    args = parser.parse_args()

    repo_root = Path(__file__).resolve().parents[4]
    rows = load_active_impls(repo_root)

    if args.pick:
        if not rows:
            print("No active impl docs (approved/in-progress).")
            return 1
        picked = pick_with_fzf(rows)
        if not picked:
            picked = pick_with_number(rows)
        if not picked:
            return 1
        print(picked)
        return 0

    if args.format == "json":
        print(json.dumps(rows, indent=2))
        return 0
    if args.format == "paths":
        for r in rows:
            print(r["path"])
        return 0

    print_table(rows)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
