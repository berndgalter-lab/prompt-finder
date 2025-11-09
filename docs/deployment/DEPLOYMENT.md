# Deployment Guide

Diese Anleitung beschreibt, wie das GeneratePress-Child-Theme sicher auf den Live-Server (oder eine andere Umgebung) deployed wird.

---

## 1. Vorbereitung

1. **SSH-Verbindung herstellen**
   ```bash
   ssh user@your-server.com
   ```

2. **Zum WordPress-Verzeichnis wechseln**
   ```bash
   cd /path/to/wordpress
   cd wp-content/themes/generatepress-child
   ```

3. **Backup erstellen**
   ```bash
   wp db export backup-before-deployment-$(date +%Y%m%d-%H%M%S).sql
   tar -czf backup-theme-$(date +%Y%m%d-%H%M%S).tar.gz .
   ```

---

## 2. Deployment durchführen

1. **Git Status prüfen**
   ```bash
   git status
   ```

2. **Letzte Änderungen holen**
   ```bash
   git pull origin main
   ```

3. **Migration ausführen** (nur falls erforderlich)
   ```bash
   wp eval-file wp-content/themes/generatepress-child/docs/MIGRATION_SCRIPT.php
   ```

---

## 3. Nach dem Deployment testen

1. **Frontend prüfen**
   - `https://your-site.com/workflows/{slug}`
   - Workflow-Variablen, Steps, Fast Track

2. **Admin prüfen**
   - `https://your-site.com/wp-admin/edit.php?post_type=workflows`
   - Workflows bearbeiten, Felder laden

3. **Error-Log beobachten**
   ```bash
   tail -f wp-content/debug.log
   ```

---

## 4. Rollback (falls nötig)

1. **Git Reset**
   ```bash
   git reset --hard {commit-id}
   ```

2. **Datenbank wiederherstellen**
   ```bash
   wp db import backup-before-deployment-XXXX.sql
   ```

---

## 5. Deployment-Checkliste

- [ ] Backup erstellt  
- [ ] `git pull` erfolgreich  
- [ ] Migration ausgeführt (falls nötig)  
- [ ] Frontend getestet  
- [ ] Admin getestet  
- [ ] Error-Log geprüft  
- [ ] `docs/CHANGELOG.md` und `CLEANUP-PLAN.md` aktualisiert

---

## Kontakt

- DevOps: devops@promptfinder.ai  
- Maintainer: team@promptfinder.ai

