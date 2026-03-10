#!/usr/bin/env python3
"""
generate_feature_index.py - Genere INDEX.md pour les features

LOGIQUE DU SCRIPT:
==================

1. SCAN: Liste tous les fichiers *.md dans docs/memory-bank/features/
   - Ignore INDEX.md et README.md

2. PARSE: Pour chaque fichier, extrait le frontmatter YAML
   - Si pas de frontmatter → classe comme "legacy" (sans metadata)
   - Si frontmatter → extrait: feature, category, status, depends_on, related, impacts, last_updated

3. ORGANISE: Groupe les features par categorie
   - Categories: auth, payments, database, ui, api, system, messaging, admin, config, uncategorized

4. GENERE INDEX.md:
   - Header avec date de generation
   - Liste par categorie (avec status et date)
   - Graphe mermaid des dependances (depends_on + impacts)
   - Liste des features recemment modifiees (top 10)
   - Liste des features legacy (sans frontmatter)

5. ECRIT: Sauvegarde dans docs/memory-bank/features/INDEX.md

DEPENDANCES:
- PyYAML (pip install pyyaml) - pour parser le frontmatter
- Aucune autre dependance externe

USAGE:
    python .claude/scripts/generate_feature_index.py
    python .claude/scripts/generate_feature_index.py --path /path/to/project

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


# Categories valides
CATEGORIES = [
    "auth", "payments", "database", "ui", "api",
    "system", "messaging", "admin", "config"
]

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


def parse_features(features_dir: Path) -> tuple[list[dict], list[dict]]:
    """
    Parse tous les fichiers features et retourne deux listes:
    - features_with_frontmatter: liste de dicts avec metadata
    - features_legacy: liste de dicts sans frontmatter
    """
    features_with_fm = []
    features_legacy = []

    if not features_dir.exists():
        print(f"ERROR: Dossier non trouve: {features_dir}")
        sys.exit(1)

    for filepath in sorted(features_dir.glob("*.md")):
        if filepath.name in IGNORED_FILES:
            continue

        frontmatter = extract_frontmatter(filepath)
        mtime = get_file_mtime(filepath)

        feature_data = {
            "filename": filepath.name,
            "filepath": filepath,
            "mtime": mtime,
        }

        if frontmatter:
            feature_data.update({
                "feature": frontmatter.get("feature", filepath.stem),
                "category": frontmatter.get("category", "uncategorized"),
                "status": frontmatter.get("status", "stable"),
                "depends_on": frontmatter.get("depends_on", []) or [],
                "related": frontmatter.get("related", []) or [],
                "impacts": frontmatter.get("impacts", []) or [],
                "files": frontmatter.get("files", []) or [],
                "last_updated": frontmatter.get("last_updated"),
            })
            features_with_fm.append(feature_data)
        else:
            feature_data.update({
                "feature": filepath.stem,
                "category": "uncategorized",
            })
            features_legacy.append(feature_data)

    return features_with_fm, features_legacy


def group_by_category(features: list[dict]) -> dict[str, list[dict]]:
    """Groupe les features par categorie."""
    grouped = defaultdict(list)
    for f in features:
        cat = f.get("category", "uncategorized")
        if cat not in CATEGORIES:
            cat = "uncategorized"
        grouped[cat].append(f)
    return dict(grouped)


def generate_mermaid_graph(features: list[dict]) -> str:
    """
    Genere un graphe mermaid des dependances.

    Utilise depends_on et impacts pour creer les liens:
    - A depends_on B → B --> A
    - A impacts B → A --> B
    """
    edges = set()
    nodes = set()

    for f in features:
        name = f["feature"]
        nodes.add(name)

        # depends_on: cette feature depend d'autres
        for dep in f.get("depends_on", []):
            edges.add((dep, name))
            nodes.add(dep)

        # impacts: cette feature impacte d'autres
        for imp in f.get("impacts", []):
            edges.add((name, imp))
            nodes.add(imp)

    if not edges:
        return ""

    lines = ["```mermaid", "graph LR"]

    # Ajoute les edges
    for src, dst in sorted(edges):
        # Sanitize les noms pour mermaid (remplace - par _)
        src_safe = src.replace("-", "_")
        dst_safe = dst.replace("-", "_")
        lines.append(f"    {src_safe}[{src}] --> {dst_safe}[{dst}]")

    lines.append("```")
    return "\n".join(lines)


def format_date(d) -> str:
    """Formate une date pour l'affichage."""
    if isinstance(d, datetime):
        return d.strftime("%Y-%m-%d")
    elif isinstance(d, str):
        return d
    return "?"


def generate_index_md(features_with_fm: list[dict], features_legacy: list[dict]) -> str:
    """Genere le contenu de INDEX.md."""
    now = datetime.now().strftime("%Y-%m-%d %H:%M")

    lines = [
        "# Features Index",
        "",
        f"*Auto-genere le {now}*",
        "",
        f"**Total**: {len(features_with_fm) + len(features_legacy)} features "
        f"({len(features_with_fm)} avec metadata, {len(features_legacy)} legacy)",
        "",
    ]

    # Section par categorie
    grouped = group_by_category(features_with_fm)

    lines.append("---")
    lines.append("")
    lines.append("## Par categorie")
    lines.append("")

    for cat in CATEGORIES + ["uncategorized"]:
        if cat not in grouped:
            continue

        cat_features = grouped[cat]
        cat_label = cat.capitalize() if cat != "uncategorized" else "Non categorise"

        lines.append(f"### {cat_label}")
        lines.append("")
        lines.append("| Feature | Status | Derniere MAJ |")
        lines.append("|---------|--------|--------------|")

        for f in sorted(cat_features, key=lambda x: x["feature"]):
            name = f["feature"]
            filename = f["filename"]
            status = f.get("status", "?")
            last_updated = format_date(f.get("last_updated") or f.get("mtime"))

            # Status emoji
            status_emoji = {
                "stable": "✅",
                "beta": "🔶",
                "alpha": "🔷",
                "deprecated": "⚠️",
            }.get(status, "")

            lines.append(f"| [{name}]({filename}) | {status_emoji} {status} | {last_updated} |")

        lines.append("")

    # Graphe de dependances
    mermaid = generate_mermaid_graph(features_with_fm)
    if mermaid:
        lines.append("---")
        lines.append("")
        lines.append("## Graphe de dependances")
        lines.append("")
        lines.append(mermaid)
        lines.append("")

    # Features recemment modifiees
    all_features = features_with_fm + features_legacy
    recent = sorted(
        [f for f in all_features if f.get("mtime")],
        key=lambda x: x["mtime"],
        reverse=True
    )[:10]

    if recent:
        lines.append("---")
        lines.append("")
        lines.append("## Recemment modifiees")
        lines.append("")
        for i, f in enumerate(recent, 1):
            name = f["feature"]
            filename = f["filename"]
            date = format_date(f["mtime"])
            lines.append(f"{i}. [{name}]({filename}) - {date}")
        lines.append("")

    # Features legacy
    if features_legacy:
        lines.append("---")
        lines.append("")
        lines.append("## Features legacy (sans frontmatter)")
        lines.append("")
        lines.append("Ces features n'ont pas de metadata. Utiliser `/upgrade-docs` pour les migrer.")
        lines.append("")
        for f in sorted(features_legacy, key=lambda x: x["feature"]):
            name = f["feature"]
            filename = f["filename"]
            lines.append(f"- [{name}]({filename})")
        lines.append("")

    # Footer
    lines.append("---")
    lines.append("")
    lines.append("*Regenerer avec: `python .claude/scripts/generate_feature_index.py`*")
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

    features_dir = project_root / "docs" / "memory-bank" / "features"

    print(f"Scanning: {features_dir}")

    # Parse les features
    features_with_fm, features_legacy = parse_features(features_dir)

    print(f"  Found: {len(features_with_fm)} with frontmatter, {len(features_legacy)} legacy")

    # Genere INDEX.md
    index_content = generate_index_md(features_with_fm, features_legacy)

    # Ecrit le fichier
    index_path = features_dir / "INDEX.md"
    index_path.write_text(index_content, encoding="utf-8")

    print(f"  Generated: {index_path}")
    print("Done!")


if __name__ == "__main__":
    main()
