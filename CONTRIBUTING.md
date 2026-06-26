# Contributing to Automation Map

## 🚀 Versioning & Releases

Dieses Projekt verwendet **Conventional Commits** für automatische Versionierung.

### Commit-Format

```
<type>(<scope>): <description>

[optional body]
[optional footer]
```

### Commit-Typen und deren Auswirkung auf die Versionsnummer

| Commit-Präfix | Beispiel | Version-Bump |
|---------------|---------|--------------|
| `feat:` | `feat: add group collapse` | Patch (1.0.0 → 1.0.1) |
| `fix:` | `fix: correct edge direction` | Patch (1.0.0 → 1.0.1) |
| `perf:` | `perf: optimize graph layout` | Patch (1.0.0 → 1.0.1) |
| `refactor:` | `refactor: split panel component` | Patch (1.0.0 → 1.0.1) |
| `feat!:` | `feat!: redesign detail panel` | Minor (1.0.1 → 1.1.0) |
| `BREAKING CHANGE` | Im Commit-Body | Minor (1.0.1 → 1.1.0) |
| `major:` | `major: complete rewrite` | Minor (1.0.1 → 1.1.0) |
| `chore:`, `docs:`, `ci:`, `style:` | `docs: update README` | **kein Bump** |

### Release überspringen

Füge `[skip-release]` oder `[no-release]` in den Commit-Message ein:

```
chore: update workflows [skip-release]
```

---

## 🔁 Release-Workflow

```
Push zu main
    ↓
🔖 Auto Version Bump (bump-version.yml)
    - Liest Commit-Messages seit letztem Tag
    - Bestimmt Bump-Typ (patch / minor)
    - Aktualisiert manifest.json
    - Erstellt Git-Tag (z.B. v1.0.2)
    ↓
🚀 Release (release.yml)
    - Wird durch den neuen Tag ausgelöst
    - Generiert Changelog aus Commit-Messages
    - Erstellt ZIP-Archiv der Integration
    - Veröffentlicht GitHub Release
```

---

## 🏗️ Lokale Entwicklung

```bash
# Repo klonen
git clone git@github.com:MovingLlama/automation-map.git
cd automation-map

# In HA deployen (zum Testen)
./deploy.sh

# Änderungen committen (Conventional Commits!)
git add -A
git commit -m "feat: add node collapse feature"
git push origin main
# → Version wird automatisch erhöht und Release erstellt
```

---

## 📋 Checkliste für Pull Requests

- [ ] Conventional Commit Format verwendet
- [ ] `manifest.json` Version **nicht** manuell geändert (das macht die CI)
- [ ] Änderungen lokal mit `./deploy.sh` getestet
- [ ] README aktualisiert wenn nötig
