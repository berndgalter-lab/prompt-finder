# 📚 Prompt Finder - Documentation

**Letzte Aktualisierung:** 26. Oktober 2025

---

## 📁 **ORDNER-STRUKTUR**

```
docs/
├── README.md                          ← Diese Datei
├── ADMIN_FEATURES_ROADMAP.md         ← Geplante Admin-Features
├── MIGRATION_SCRIPT.php              ← ACF-Daten Migration
│
├── blueprints/                       ← Workflow-Spezifikationen
│   └── Prompt Finder — Workflow Blueprint (v1.7).md
│
├── acf-schema/                       ← ACF-Feld-Definitionen
│   ├── Prompt Finder — ACF Field Reference (Creator View, v1.7).md
│   └── acf-export-2025-10-26.json
│
├── deployment/                       ← Deployment-Dokumentation
│   ├── BLUEPRINT_V1.7_IMPLEMENTATION.md
│   ├── DEPLOYMENT_GUIDE.md
│   └── DEPLOYMENT_SUMMARY.md
│
└── archive/                          ← Alte Audits & Analysen
    ├── ACF_ACTUAL_VS_CODE_MAPPING.md
    ├── VARIABLE_MAPPING_AUDIT.md
    ├── FIELD_NAMES_AUDIT.md
    └── MODERNIZATION_COMPLETE.md
```

---

## 📖 **WICHTIGSTE DOKUMENTE**

### **1. Workflow Blueprint (v1.7)**
📄 `blueprints/Prompt Finder — Workflow Blueprint (v1.7).md`

**Was ist das?**
- Definiert, wie Workflows strukturiert sind
- Beschreibt Step Types (prompt, guide, review)
- Erklärt Prompt Modes (context, main, optimizer)
- Privacy-First Regeln

**Wann brauche ich das?**
- Beim Erstellen neuer Workflows
- Beim Verstehen der Workflow-Struktur
- Als Referenz für AI-Prompt-Generierung

---

### **2. ACF Field Reference (v1.7)**
📄 `acf-schema/Prompt Finder — ACF Field Reference (Creator View, v1.7).md`

**Was ist das?**
- Liste aller ACF-Felder
- Workflow-Level Felder
- Step-Level Felder
- Variable-Strukturen

**Wann brauche ich das?**
- Beim Bearbeiten von Workflows in WordPress
- Beim Verstehen der Datenstruktur
- Als Referenz für Code-Entwicklung

---

### **3. ACF Export (JSON)**
📄 `acf-schema/acf-export-2025-10-26.json`

**Was ist das?**
- Kompletter ACF-Export
- Alle Feldgruppen und Felder
- Importierbar in andere WordPress-Instanzen

**Wann brauche ich das?**
- Beim Einrichten neuer Instanzen
- Beim Synchronisieren von ACF-Feldern
- Als Backup der ACF-Struktur

---

### **4. Admin Features Roadmap**
📄 `ADMIN_FEATURES_ROADMAP.md`

**Was ist das?**
- Geplante Admin-Tools
- Priorisierung und Aufwands-Schätzungen
- Implementierungs-Pattern

**Wann brauche ich das?**
- Beim Planen neuer Features
- Als Referenz für zukünftige Entwicklung
- Für Feature-Priorisierung

---

### **5. Migration Script**
📄 `MIGRATION_SCRIPT.php`

**Was ist das?**
- PHP-Script für Daten-Migration
- Konvertiert alte zu neuen Feldnamen
- Einmalig ausführbar

**Wann brauche ich das?**
- Beim Migrieren von alten zu neuen ACF-Feldnamen
- Nur einmal pro Workflow nötig
- Backup vor Ausführung empfohlen!

---

## 🚀 **DEPLOYMENT-DOKUMENTATION**

### **Blueprint v1.7 Implementation**
📄 `deployment/BLUEPRINT_V1.7_IMPLEMENTATION.md`

**Inhalt:**
- Alle implementierten Features
- Code-Änderungen
- CSS-Klassen
- Testing-Checklist

---

### **Deployment Guide**
📄 `deployment/DEPLOYMENT_GUIDE.md`

**Inhalt:**
- Schritt-für-Schritt Deployment
- SSH-Befehle
- Troubleshooting

---

### **Deployment Summary**
📄 `deployment/DEPLOYMENT_SUMMARY.md`

**Inhalt:**
- Zusammenfassung der letzten Deployments
- Statistiken
- Nächste Schritte

---

## 📦 **ARCHIV**

Alte Analyse-Dokumente, die für die aktuelle Entwicklung nicht mehr relevant sind, aber als Referenz aufbewahrt werden.

### **Enthält:**
- ACF Field Mappings
- Variable Audits
- Modernisierungs-Berichte

**Wann brauche ich das?**
- Selten - nur für historische Referenz
- Bei Debugging von Legacy-Code

---

## 🎯 **QUICK START**

### **Neuen Workflow erstellen?**
1. Lies: `blueprints/Prompt Finder — Workflow Blueprint (v1.7).md`
2. Referenz: `acf-schema/Prompt Finder — ACF Field Reference (Creator View, v1.7).md`
3. Erstelle in WordPress Admin

### **Code verstehen?**
1. Lies: `deployment/BLUEPRINT_V1.7_IMPLEMENTATION.md`
2. Schau: `acf-schema/acf-export-2025-10-26.json`

### **Deployment?**
1. Lies: `deployment/DEPLOYMENT_GUIDE.md`
2. Folge den Schritten

### **Neue Features planen?**
1. Lies: `ADMIN_FEATURES_ROADMAP.md`
2. Wähle Feature
3. Implementiere

---

## 🔧 **MAINTENANCE**

### **Dokumente aktualisieren:**
- Nach jedem größeren Feature-Update
- Nach ACF-Schema-Änderungen
- Nach Deployment

### **Archivierung:**
- Alte Audits → `archive/`
- Alte Deployments → `archive/`
- Halte nur aktuelle Docs im Root

---

## 📞 **SUPPORT**

Bei Fragen zu:
- **Workflows:** Siehe Blueprint
- **ACF-Felder:** Siehe ACF Reference
- **Code:** Siehe Implementation Docs
- **Deployment:** Siehe Deployment Guide

---

**📌 Tipp:** Verwende die Suche (Cmd+F / Ctrl+F) um schnell das richtige Dokument zu finden!

