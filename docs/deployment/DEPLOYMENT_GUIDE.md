# 🚀 Deployment Guide - Git Pull auf Live-Server

## ⚠️ WICHTIG: VOR DEM DEPLOYMENT

### 1. Backup erstellen
```bash
# SSH auf Server
ssh user@your-server.com

# Datenbank-Backup
wp db export backup-before-deployment-$(date +%Y%m%d-%H%M%S).sql

# Dateien-Backup (optional)
tar -czf backup-theme-$(date +%Y%m%d-%H%M%S).tar.gz wp-content/themes/generatepress-child/
```

---

## 📥 DEPLOYMENT-SCHRITTE

### Schritt 1: SSH-Verbindung
```bash
ssh user@your-server.com
```

### Schritt 2: Zum WordPress-Verzeichnis navigieren
```bash
cd /path/to/wordpress
# Oder direkt zum Theme:
cd /path/to/wordpress/wp-content/themes/generatepress-child
```

### Schritt 3: Git Status prüfen
```bash
git status
```

**Erwartete Ausgabe:**
```
On branch main
Your branch is behind 'origin/main' by 1 commit.
```

### Schritt 4: Änderungen pullen
```bash
git pull origin main
```

**Erwartete Ausgabe:**
```
From github.com:berndgalter-lab/prompt-finder
   fe89a9b..b15c4a1  main -> main
Updating fe89a9b..b15c4a1
Fast-forward
 docs/ACF_ACTUAL_VS_CODE_MAPPING.md                     | 309 +++++++++++
 docs/MIGRATION_SCRIPT.php                              | 195 +++++++
 docs/MODERNIZATION_COMPLETE.md                         | 289 ++++++++++
 docs/Prompt Finder — ACF Field Reference (v1.7).md     | 131 +++++
 docs/Prompt Finder — Workflow Blueprint (v1.7).md      | 303 +++++++++++
 docs/VARIABLE_MAPPING_AUDIT.md                         | 201 +++++++
 docs/acf-export-2025-10-26.json                        | 1503 +++++++++++++++
 wp-content/themes/generatepress-child/single-workflows.php | 82 +--
 8 files changed, 2967 insertions(+), 82 deletions(-)
```

### Schritt 5: Deployment verifizieren
```bash
# Prüfe ob Dateien aktualisiert wurden
ls -la wp-content/themes/generatepress-child/single-workflows.php
ls -la docs/
```

---

## ⚠️ NACH DEM DEPLOYMENT: MIGRATION AUSFÜHREN

### Option A: Via WordPress Admin (EMPFOHLEN)

1. **Migrations-Script aktivieren:**
   ```bash
   # Auf Server: functions.php bearbeiten
   nano wp-content/themes/generatepress-child/functions.php
   ```

2. **Am Ende der Datei hinzufügen:**
   ```php
   // TEMPORARY: Run migration (remove after execution)
   add_action('admin_init', function() {
       if (!get_option('pf_migration_completed')) {
           require_once get_stylesheet_directory() . '/docs/MIGRATION_SCRIPT.php';
           pf_run_migration();
           update_option('pf_migration_completed', true);
       }
   });
   ```

3. **WordPress Admin besuchen:**
   - Gehe zu: `https://your-site.com/wp-admin`
   - Migration läuft automatisch beim ersten Admin-Seitenaufruf

4. **Migration-Code entfernen:**
   ```bash
   # Entferne die hinzugefügten Zeilen aus functions.php
   nano wp-content/themes/generatepress-child/functions.php
   ```

### Option B: Via WP-CLI (Schneller)

```bash
# Auf Server
cd /path/to/wordpress

# Migration ausführen
wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php
```

---

## ✅ TESTING

### 1. Frontend prüfen
```bash
# Öffne im Browser:
https://your-site.com/workflows/[workflow-slug]/
```

**Prüfe:**
- [ ] Workflow wird angezeigt
- [ ] Keine PHP-Fehler
- [ ] Variables werden geladen
- [ ] Steps werden korrekt angezeigt

### 2. WordPress Error Log prüfen
```bash
# Auf Server
tail -f wp-content/debug.log
```

**Suche nach:**
- ❌ `[PF Single]` Fehlermeldungen
- ❌ PHP Warnings/Errors

### 3. Admin-Bereich prüfen
```bash
# Im Browser:
https://your-site.com/wp-admin/edit.php?post_type=workflows
```

**Prüfe:**
- [ ] Workflows sind sichtbar
- [ ] Admin-Columns zeigen Daten
- [ ] Keine Fehler beim Bearbeiten

---

## 🔄 ROLLBACK (Falls etwas schief geht)

### Schneller Rollback via Git
```bash
# Auf Server
cd /path/to/wordpress

# Zum vorherigen Commit zurück
git reset --hard fe89a9b

# Oder: Letzten Commit rückgängig machen
git revert HEAD
git push origin main
```

### Datenbank wiederherstellen
```bash
# Backup wiederherstellen
wp db import backup-before-deployment-XXXXXX.sql
```

---

## 📊 DEPLOYMENT-CHECKLISTE

### Vor Deployment:
- [ ] Backup erstellt (Datenbank + Dateien)
- [ ] Git Status geprüft
- [ ] Keine lokalen Änderungen auf Server

### Deployment:
- [ ] `git pull origin main` ausgeführt
- [ ] Dateien aktualisiert
- [ ] Keine Git-Konflikte

### Nach Deployment:
- [ ] Migration ausgeführt
- [ ] Frontend getestet
- [ ] Admin-Bereich getestet
- [ ] Error-Log geprüft
- [ ] Keine PHP-Fehler

### Cleanup:
- [ ] Migration-Code entfernt (falls Option A)
- [ ] Backup aufbewahrt (mindestens 7 Tage)

---

## 🆘 TROUBLESHOOTING

### Problem: Git-Konflikte
```bash
# Lokale Änderungen verwerfen
git reset --hard origin/main
```

### Problem: Dateiberechtigungen
```bash
# Berechtigungen korrigieren
chmod 644 wp-content/themes/generatepress-child/single-workflows.php
chmod 755 wp-content/themes/generatepress-child/docs/
```

### Problem: Migration schlägt fehl
```bash
# Debug-Modus aktivieren
wp config set WP_DEBUG true
wp config set WP_DEBUG_LOG true

# Migration erneut ausführen
wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php
```

### Problem: PHP-Fehler nach Deployment
```bash
# Error-Log prüfen
tail -50 wp-content/debug.log

# Syntax-Check
php -l wp-content/themes/generatepress-child/single-workflows.php
```

---

## 📞 SUPPORT

Bei Problemen:
1. Error-Log prüfen
2. Rollback durchführen
3. Backup wiederherstellen
4. Support kontaktieren

---

**Erstellt:** 2025-10-26  
**Version:** 1.0.0  
**Commit:** b15c4a1

