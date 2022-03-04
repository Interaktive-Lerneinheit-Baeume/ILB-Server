# Server-Komponente für ILB-Studie

Dieses Repostitory enthält die Server-Komponente für die Durchführung der ILB-Studie. Die Anwendung stellt die Experimentdaten für die evaluierte Client-Software bereit und speichert die erhobenen Studiendaten. Client und Server sind über eine einfache _REST_-Schnittstelle verbunden.

## Deployment

- Alle notwendigen Abhängigkeiten zum Betrieb des Servers können über `npm install` installiert werden.
- Die wesentliche Konfiguration erfolgt über die Datei `config.json`. Diese ist nicht Teil des Repositorys, kann aber auf Grundlage von `config.json.example` erstellt werden.
- Über die Konfigurationsdatei wird u.a. der Ordner mit den offenen Experimenten (JSON-Dateien) sowie der Ort zum Speichern der abgeschlossenen Experimente angegeben.
- Das Verzeichnis mit den Experimenten sollte **nicht** Teil des Repositorys sein. Standardmäßig wird daher `data` via _gitignore_ ausgeschlossen.
- Der Server kann über `npm start` bzw. `npm stop` gestartet und beendet werden. Im Hintergrund wird dzu [forever](https://www.npmjs.com/package/forever) eingesetzt.

### Empfohlene Konfiguration des Serververzeichnis

```
config.json // Konfiguration
data // Daten
 -> open // Offene Experimente
 -> closed // Abgeschlossene Experimente
```
