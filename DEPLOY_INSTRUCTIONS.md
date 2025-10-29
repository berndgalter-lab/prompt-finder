# 🚀 Deployment Anleitung - Live Server

## Option 1: Manuelle SSH-Verbindung (Empfohlen)

Öffne ein Terminal und führe diese Befehle aus:

```bash
# 1. Verbinde zum Server
ssh -p 222 promptg@www200.your-server.de

# 2. Passwort eingeben: Bi5e55Xq6c4cMetH

# 3. Zum Theme-Verzeichnis wechseln
cd /usr/www/users/promptg/wp-content/themes/generatepress-child

# 4. Git Status prüfen
git status

# 5. Neueste Änderungen pullen
git pull origin main

# 6. Prüfe die letzte Änderung
git log -1 --oneline

# 7. Exit
exit
```

## Option 2: Mit SSH-Key (Falls konfiguriert)

Wenn du einen SSH-Key eingerichtet hast:

```bash
ssh -p 222 promptg@www200.your-server.de "cd /usr/www/users/promptg/wp-content/themes/generatepress-child && git pull origin main"
```

## Option 3: sshpass installieren (macOS)

```bash
# Installiere sshpass
brew install hudochenkov/sshpass/sshpass

# Dann führe deploy-live.sh aus
./deploy-live.sh
```

## ✅ Nach dem Deployment - Test Checklist

1. **Browser öffnen**: https://prompt-finder.de/workflows/[workflow-name]
2. **Hard Refresh**: 
   - Windows: `Ctrl + Shift + R`
   - Mac: `Cmd + Shift + R`
3. **Console öffnen** (F12) - Prüfe:
   - `🚀 Workflow Frontend loading...`
   - `✅ Workflow Frontend initialized`
4. **Visuelle Checks**:
   - ✅ Sidebar links sichtbar (Desktop)
   - ✅ Header mit Progress Bar oben (4px)
   - ✅ Neue Sections (Overview, Value, Prerequisites, Variables, Steps)
   - ✅ Moderne Card-Layouts
5. **Network Tab** (F12 → Network):
   - Sollte laden: `pf-workflows-new.css`
   - Sollte laden: Module (storage.js, navigation.js, etc.)
   - Sollte NICHT laden: `pf-workflows.css` (alt)

## ⚠️ Bei Problemen

Falls etwas nicht funktioniert:

```bash
# Backup wiederherstellen auf Server
cd /usr/www/users/promptg/wp-content/themes/generatepress-child
git checkout single-workflows-OLD.php
```

Oder kontaktiere mich für Support!
