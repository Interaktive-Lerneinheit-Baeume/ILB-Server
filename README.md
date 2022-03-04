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

## Verfügbare Endpoints der REST-Schnittstelle

| Endpoint | Anfrage | Antwort | Beschreibung |
|----------------------|---------|---------|--------------|
| **GET** `/api/experiment/:id | - | Das angefragte Experiment, formatiert als JSON-Objekt | Gibt das Experiment mit der als Parameter übergebenen ID zurück. |
| **GET** `/api/experiments/random | - | Ein zufälliges offenes Experiment, formatiert als JSON-Objekt | Gibt ein zufällig ausgewähltes Experiment zurück. |
| **POST** `/api/experiment/:id | Die im Client aktualisierte Fassung des Experiments, formatiert als JSON-Objekt | - | Speichert die übergebene Fassung des Experiments auf dem Server. |
| **POST** `/api/experiment/:id/append | Die im Client aktualisierte Fassung des Experiments, formatiert als JSON-Objekt | - | Ersetzt ein bereits geschlossenes Experiment auf dem Server durch die übergebene Fassung. |
| **POST** `/api/experiment/:id/cancel | - | - | Bricht ein Experiment ab und setzt dessen Eigenschaften zurück. Das Experiment kann anschließend für einen anderen Durchlauf verwendet werden. |
| **POST** `/api/experiment/:id/close | Die im Client aktualisierte Fassung des Experiments, formatiert als JSON-Objekt | - | Speichert die übergebene Fassung des Experiments auf dem Server und schließt das Experiment für weitere Versuche. Das Experiment kann im Anschluss nicht mehr für einen anderen Durchlauf verwendet werden. |