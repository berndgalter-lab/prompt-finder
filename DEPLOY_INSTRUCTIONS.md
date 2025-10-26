# 🚀 Blueprint v1.7 - Deployment Anleitung

**Status:** ✅ Alle Änderungen sind auf GitHub gepusht  
**Bereit für:** Live-Deployment

---

## ⚡ **SCHNELL-DEPLOYMENT (1 Befehl)**

Öffne dein **Terminal** und führe aus:

```bash
cd /Users/uniquewebsites/prompt-finder-project
./deploy-now.sh
```

**Passwort eingeben:** `Bi5e55Xq6c4cMetH`

Das war's! 🎉

---

## 📋 **WAS PASSIERT BEIM DEPLOYMENT?**

1. ✅ Verbindet zu deinem Server via SSH
2. ✅ Navigiert zu `/home/promptg/public_html`
3. ✅ Prüft Git-Status
4. ✅ Führt `git pull origin main` aus
5. ✅ Zeigt dir die aktualisierten Dateien
6. ✅ Bestätigt erfolgreiche Deployment

---

## 🎯 **NACH DEM DEPLOYMENT TESTEN**

### **1. Seite öffnen:**
https://prompt-finder.de

### **2. Workflow öffnen:**
Öffne einen beliebigen Workflow (z.B. einen deiner 3 bestehenden)

### **3. Neue Features prüfen:**

#### **✅ Workflow Variables (Global)**
- Sollten VOR den Steps angezeigt werden
- Lila Gradient-Box mit ⚙️ Icon
- Felder für globale Einstellungen

#### **✅ Prerequisites Section**
- Zeigt "What you need before starting"
- Privacy Warning wenn `requires_source_content = true`

#### **✅ Step-Type Badges**
- 🎬 **Context** (Lila)
- ⚡ **Main** (Blau)
- ✨ **Optimizer** (Gelb)
- 📖 **Guide** (Grün)
- ✅ **Review** (Rosa)

#### **✅ Paste Guidance**
- Blaue Info-Box mit 💡 Icon
- Zeigt wo User Content pasten soll

#### **✅ Step-Type-Spezifische Darstellung**
- **PROMPT Steps:** Editierbares Textfeld
- **GUIDE Steps:** Formatierte Anleitung
- **REVIEW Steps:** Interaktive Checklist

#### **✅ Farbcodierung**
- Steps haben farbige Borders je nach Type

---

## 🔧 **ALTERNATIVE: MANUELLES DEPLOYMENT**

Falls das Script nicht funktioniert:

```bash
# 1. SSH-Verbindung herstellen
ssh promptg@www200.your-server.de -p222

# 2. Passwort eingeben
Bi5e55Xq6c4cMetH

# 3. Zu WordPress-Verzeichnis navigieren
cd /home/promptg/public_html

# 4. Git-Status prüfen
git status

# 5. Änderungen pullen
git pull origin main

# 6. Fertig!
exit
```

---

## 📊 **WAS WIRD AKTUALISIERT?**

### **Dateien auf dem Server:**
1. ✅ `single-workflows.php` (36.35 KB → ~40 KB)
2. ✅ `functions.php` (31.48 KB → ~32 KB)
3. ✅ `assets/css/pf-workflows.css` (~1900 Zeilen → ~2300 Zeilen)
4. ✅ `docs/BLUEPRINT_V1.7_IMPLEMENTATION.md` (NEU)
5. ✅ `docs/DEPLOYMENT_SUMMARY.md` (NEU)

### **Änderungen:**
- ✅ 783 Zeilen hinzugefügt
- ✅ 35 Zeilen entfernt
- ✅ 30+ neue CSS-Klassen
- ✅ 100% Blueprint v1.7 Compliance

---

## ⚠️ **TROUBLESHOOTING**

### **Problem: SSH-Verbindung schlägt fehl**
```bash
# Lösung: Prüfe SSH-Zugang
ssh promptg@www200.your-server.de -p222
# Passwort: Bi5e55Xq6c4cMetH
```

### **Problem: Git pull zeigt Konflikte**
```bash
# Auf dem Server:
cd /home/promptg/public_html
git status
git stash  # Lokale Änderungen sichern
git pull origin main
git stash pop  # Lokale Änderungen wiederherstellen
```

### **Problem: Änderungen nicht sichtbar**
```bash
# Browser-Cache leeren:
# Chrome/Firefox: Cmd+Shift+R (Mac) oder Ctrl+Shift+R (Windows)

# Oder WordPress-Cache leeren (falls Plugin aktiv):
# WP Admin → Cache → Clear All
```

---

## 🎯 **TESTING CHECKLIST**

Nach dem Deployment prüfen:

- [ ] **Workflow öffnet ohne Fehler**
- [ ] **Workflow Variables werden angezeigt** (lila Box)
- [ ] **Prerequisites Section sichtbar** (falls gesetzt)
- [ ] **Step Badges zeigen korrekte Icons**
- [ ] **Paste Guidance wird angezeigt** (blaue Box)
- [ ] **Guide Steps zeigen Anleitung** (grüne Box)
- [ ] **Review Steps zeigen Checklist** (rosa Box)
- [ ] **CSS-Styling funktioniert** (Farben, Borders)
- [ ] **Mobile Ansicht funktioniert**
- [ ] **Dark Mode funktioniert** (falls aktiviert)

---

## 📚 **DOKUMENTATION**

- **Blueprint:** `docs/Prompt Finder — Workflow Blueprint (v1.7).md`
- **Implementation:** `docs/BLUEPRINT_V1.7_IMPLEMENTATION.md`
- **Deployment:** `docs/DEPLOYMENT_SUMMARY.md`
- **ACF Schema:** `docs/acf-export-2025-10-26.json`

---

## 🎉 **ERFOLG!**

Wenn alles funktioniert, siehst du:

✅ Workflow Variables (lila Box)  
✅ Prerequisites mit Privacy Warning  
✅ Step-Type Badges (Context/Main/Optimizer)  
✅ Paste Guidance (blaue Info-Box)  
✅ Guide Steps (grüne Anleitung)  
✅ Review Steps (rosa Checklist)  
✅ Farbcodierte Step-Borders  

**Deine Seite ist jetzt Blueprint v1.7 compliant!** 🚀

---

## 📞 **SUPPORT**

Bei Problemen:
1. Prüfe Browser-Console auf JavaScript-Fehler
2. Prüfe WordPress Debug-Log
3. Prüfe Git-Status auf dem Server
4. Kontaktiere mich mit Screenshots

---

**🎯 BEREIT FÜR DEPLOYMENT!**

```bash
cd /Users/uniquewebsites/prompt-finder-project
./deploy-now.sh
```

**Passwort:** `Bi5e55Xq6c4cMetH`

