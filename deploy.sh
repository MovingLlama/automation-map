#!/bin/bash
# deploy.sh — Automation Map Deploy Script
# Kopiert die Integration in den Home Assistant custom_components Ordner
# 
# Verwendung:
#   ./deploy.sh              — Deploy in den Standard-HA-Pfad
#   ./deploy.sh /pfad/zu/ha  — Deploy in angegebenen HA config Pfad

set -e

HA_CONFIG="${1:-/home/stefan-seyerl/spielereien/homeassistant/config}"
TARGET="$HA_CONFIG/custom_components/automation_map"
SOURCE="$(dirname "$0")/custom_components/automation_map"

echo "🗺️  Automation Map Deploy"
echo "   Quelle : $SOURCE"
echo "   Ziel   : $TARGET"
echo ""

if [ ! -d "$HA_CONFIG" ]; then
  echo "❌ HA config Verzeichnis nicht gefunden: $HA_CONFIG"
  exit 1
fi

# Backup if exists
if [ -d "$TARGET" ]; then
  echo "📦 Erstelle Backup: ${TARGET}.bak"
  rm -rf "${TARGET}.bak" 2>/dev/null || true
  cp -r "$TARGET" "${TARGET}.bak"
fi

# Copy
echo "📋 Kopiere Dateien..."
rm -rf "$TARGET" 2>/dev/null || true
cp -r "$SOURCE" "$TARGET"

echo ""
echo "✅ Erfolgreich deployed!"
echo ""
echo "📝 Nächste Schritte:"
echo "   1. Home Assistant neu starten (oder 'Überprüfen & Neu laden' in HA)"
echo "   2. Einstellungen → Integrationen → + Hinzufügen → 'Automation Map'"
echo "   3. Das Panel erscheint in der Seitenleiste als '🗺️ Automation Map'"
echo ""
