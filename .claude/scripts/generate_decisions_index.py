#!/usr/bin/env python3
"""
generate_decisions_index.py - Genere INDEX.md pour les decisions (ADRs)

LOGIQUE DU SCRIPT:
==================

1. SCAN: Liste tous les fichiers *.md dans docs/memory-bank/decisions/
   - Ignore INDEX.md et README.md

2. PARSE: Pour chaque fichier, extrait le frontmatter YAML
   - Si pas de frontmatter → classe comme "legacy"
   - Si frontmatter → extrait: decision, status, date, category, etc.

3. ORGANISE: Groupe les decisions par status et category

4. GENERE INDEX.md:
   - Header avec date de generation
   - Liste par status (accepted, proposed, deprecated)
   - Liste par category
   - Timeline des decisions
   - Liste des decisions legacy

5. ECRIT: Sauvegarde dans docs/memory-bank/decisions/INDEX.md

DEPENDANCES:
- PyYAML (pip install pyyaml) - pour parser le frontmatter
- Aucune autre dependance externe

USAGE:
    python .claude/scripts/generate_decisions_index.py
    python .claude/scripts/generate_decisions_index.py --path /path/to/project

"""

import os
import sys
import re
from datetime import datetime
from pathlib import Path
from collections import defaultdict

# Tente d'importer yaml, sinon propose l'installation
try:
    import yaml
except ImportError:
    print("ERROR: PyYAML non installe.")
    print("Installer avec: pip install pyyaml")
    print("Ou: pip3 install pyyaml")
    sys.exit(1)


# Status valides
STATUSES = ["accepted", "proposed", "deprecated", "superseded"]

# Categories valides
CATEGORIES = ["architecture", "library", "pattern", "convention", "infrastructure"]

# Fichiers a ignorer
IGNORED_FILES = {"INDEX.md", "README.md", ".gitkeep"}


def extract_frontmatter(filepath: Path) -> dict | None:
    """
    Extrait le frontmatter YAML d'un fichier markdown.

    Le frontmatter est entre deux lignes '---' au debut du fichier:
    ---
    key: value
    ---

    Retourne None si pas de frontmatter valide.
    """
    try:
        content = filepath.read_text(encoding="utf-8")
    except Exception as e:
        print(f"  Warning: Impossible de lire {filepath.name}: {e}")
        return None

    # Verifie si le fichier commence par ---
    if not content.startswith("---"):
        return None

    # Trouve la fin du frontmatter (deuxieme ---)
    lines = content.split("\n")
    end_index = None
    for i, line in enumerate(lines[1:], start=1):
        if line.strip() == "---":
            end_index = i
            break

    if end_index is None:
        return None

    # Parse le YAML
    frontmatter_text = "\n".join(lines[1:end_index])
    try:
        data = yaml.safe_load(frontmatter_text)
        return data if isinstance(data, dict) else None
    except yaml.YAMLError as e:
        print(f"  Warning: YAML invalide dans {filepath.name}: {e}")
        return None


def get_file_mtime(filepath: Path) -> datetime | None:
    """Retourne la date de derniere modification du fichier."""
    try:
        return datetime.fromtimestamp(filepath.stat().st_mtime)
    except Exception:
        return None


def parse_decision_number(filename: str) -> int:
    """Extrait le numero de decision du nom de fichier (ex: 0001-title.md -> 1)."""
    match = re.match(r"^(\d+)-", filename)
    if match:
        return int(match.group(1))
    return 9999  # Pour les fichiers sans numero


def parse_decisions(decisions_dir: Path) -> tuple[list[dict], list[dict]]:
    """
    Parse tous les fichiers decisions et retourne deux listes:
    - decisions_with_frontmatter: liste de dicts avec metadata
    - decisions_legacy: liste de dicts sans frontmatter
    """
    decisions_with_fm = []
    decisions_legacy = []

    if not decisions_dir.exists():
        print(f"Dossier non trouve: {decisions_dir}")
        print("Creation du dossier...")
        decisions_dir.mkdir(parents=True, exist_ok=True)
        return [], []

    for filepath in sorted(decisions_dir.glob("*.md")):
        if filepath.name in IGNORED_FILES:
            continue

        frontmatter = extract_frontmatter(filepath)
        mtime = get_file_mtime(filepath)
        number = parse_decision_number(filepath.name)

        decision_data = {
            "filename": filepath.name,
            "filepath": filepath,
            "mtime": mtime,
            "number": number,
        }

        if frontmatter:
            decision_data.update({
                "decision": frontmatter.get("decision", filepath.stem),
                "status": frontmatter.get("status", "accepted"),
                "date": frontmatter.get("date"),
                "deciders": frontmatter.get("deciders", ""),
                "category": frontmatter.get("category", "uncategorized"),
                "supersedes": frontmatter.get("supersedes", []) or [],
                "superseded_by": frontmatter.get("superseded_by", []) or [],
                "related": frontmatter.get("related", []) or [],
            })
            decisions_with_fm.append(decision_data)
        else:
            decision_data.update({
                "decision": filepath.stem,
                "status": "accepted",
                "category": "uncategorized",
            })
            decisions_legacy.append(decision_data)

    return decisions_with_fm, decisions_legacy


def group_by_status(decisions: list[dict]) -> dict[str, list[dict]]:
    """Groupe les decisions par status."""
    grouped = defaultdict(list)
    for d in decisions:
        status = d.get("status", "accepted")
        if status not in STATUSES:
            status = "accepted"
        grouped[status].append(d)
    return dict(grouped)


def group_by_category(decisions: list[dict]) -> dict[str, list[dict]]:
    """Groupe les decisions par category."""
    grouped = defaultdict(list)
    for d in decisions:
        cat = d.get("category", "uncategorized")
        if cat not in CATEGORIES:
            cat = "uncategorized"
        grouped[cat].append(d)
    return dict(grouped)


def format_date(d) -> str:
    """Formate une date pour l'affichage."""
    if isinstance(d, datetime):
        return d.strftime("%Y-%m-%d")
    elif isinstance(d, str):
        return d
    elif d is None:
        return "?"
    return str(d)


def generate_index_md(decisions_with_fm: list[dict], decisions_legacy: list[dict]) -> str:
    """Genere le contenu de INDEX.md."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    lines = [
        "# Decisions Index (ADRs)",
        "",
        f"*Auto-genere le {now}*",
        "",
        f"**Total**: {len(decisions_with_fm) + len(decisions_legacy)} decisions "
        f"({len(decisions_with_fm)} avec metadata, {len(decisions_legacy)} legacy)",
        "",
    ]

    # Section par status
    grouped_status = group_by_status(decisions_with_fm)

    lines.append("---")
    lines.append("")
    lines.append("## Par status")
    lines.append("")

    for status in STATUSES:
        if status not in grouped_status:
            continue

        status_decisions = grouped_status[status]
        status_emoji = {
            "accepted": "✅",
            "proposed": "🔶",
            "deprecated": "⚠️",
            "superseded": "🔄",
        }.get(status, "")

        lines.append(f"### {status_emoji} {status.capitalize()}")
        lines.append("")
        lines.append("| # | Decision | Date | Category |")
        lines.append("|---|----------|------|----------|")

        for d in sorted(status_decisions, key=lambda x: x["number"]):
            num = f"{d['number']:04d}" if d['number'] < 9999 else "?"
            name = d["decision"]
            filename = d["filename"]
            date = format_date(d.get("date") or d.get("mtime"))
            category = d.get("category", "?")

            lines.append(f"| {num} | [{name}]({filename}) | {date} | {category} |")

        lines.append("")

    # Section par category
    grouped_cat = group_by_category(decisions_with_fm)

    lines.append("---")
    lines.append("")
    lines.append("## Par categorie")
    lines.append("")

    for cat in CATEGORIES + ["uncategorized"]:
        if cat not in grouped_cat:
            continue

        cat_decisions = grouped_cat[cat]
        cat_label = cat.capitalize() if cat != "uncategorized" else "Non categorise"

        lines.append(f"### {cat_label}")
        lines.append("")
        for d in sorted(cat_decisions, key=lambda x: x["number"]):
            name = d["decision"]
            filename = d["filename"]
            status = d.get("status", "?")
            status_emoji = {
                "accepted": "✅",
                "proposed": "🔶",
                "deprecated": "⚠️",
                "superseded": "🔄",
            }.get(status, "")
            lines.append(f"- [{name}]({filename}) {status_emoji}")
        lines.append("")

    # Timeline
    all_with_dates = [d for d in decisions_with_fm if d.get("date")]
    if all_with_dates:
        lines.append("---")
        lines.append("")
        lines.append("## Timeline")
        lines.append("")

        sorted_by_date = sorted(
            all_with_dates,
            key=lambda x: str(x.get("date", "")),
            reverse=True
        )[:15]

        for i, d in enumerate(sorted_by_date, 1):
            date = format_date(d["date"])
            name = d["decision"]
            filename = d["filename"]
            lines.append(f"{i}. {date} - [{name}]({filename})")
        lines.append("")

    # Decisions legacy
    if decisions_legacy:
        lines.append("---")
        lines.append("")
        lines.append("## Decisions legacy (sans frontmatter)")
        lines.append("")
        lines.append("Ces decisions n'ont pas de metadata. Ajouter un frontmatter pour les integrer.")
        lines.append("")
        for d in sorted(decisions_legacy, key=lambda x: x["number"]):
            name = d["decision"]
            filename = d["filename"]
            lines.append(f"- [{name}]({filename})")
        lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append("*Regenerer avec: `python .claude/scripts/generate_decisions_index.py`*")
    lines.append("")

    return "\n".join(lines)


def main():
    """Point d'entree principal."""
    # Determine le chemin du projet
    if len(sys.argv) > 2 and sys.argv[1] == "--path":
        project_root = Path(sys.argv[2])
    else:
        # Cherche la racine du projet (dossier contenant .claude/)
        current = Path.cwd()
        while current != current.parent:
            if (current / ".claude").exists():
                project_root = current
                break
            current = current.parent
        else:
            project_root = Path.cwd()

    decisions_dir = project_root / "docs" / "memory-bank" / "decisions"

    print(f"Scanning: {decisions_dir}")

    # Parse les decisions
    decisions_with_fm, decisions_legacy = parse_decisions(decisions_dir)

    print(f"  Found: {len(decisions_with_fm)} with frontmatter, {len(decisions_legacy)} legacy")

    # Genere INDEX.md
    index_content = generate_index_md(decisions_with_fm, decisions_legacy)

    # Ecrit le fichier
    index_path = decisions_dir / "INDEX.md"
    index_path.write_text(index_content, encoding="utf-8")

    print(f"  Generated: {index_path}")
    print("Done!")


if __name__ == "__main__":
    main()
