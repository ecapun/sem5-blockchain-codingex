# sem5-blockchain-codingex

**Interaktion mit dem Smart Contract**

Wir haben ein einfaches, aber vollständig funktionsfähiges Lottery-System entwickelt.
Mehrere Spieler können ein Ticket kaufen (0.01 Sepolia-ETH pro Ticket).
Sobald alle Teilnehmer eingezahlt haben, kann der Contract-Owner die Ziehung starten.

Nachdem der Owner die Ziehung in MetaMask bestätigt, wählt der Smart Contract automatisch einen zufälligen Gewinner aus.
Der Gewinner erhält den gesamten angesammelten Betrag direkt auf seine Wallet-Adresse überwiesen.

Der Lottery-Smart-Contract wurde auf dem Sepolia Testnet deployed und kann auf zwei verschiedene Arten verwendet werden:

* **über das bereitgestellte Frontend (empfohlen)**
* direkt über Etherscan (ohne lokale Installation)


**Contract-Adresse
0xA2aF81b7Ed1E4A5eA2E2927F27db430Fda5A045E**

**_1. Nutzung über das Frontend (lokale Ausführung)_**

Das Projekt enthält ein einfaches Frontend, mit dem man Tickets kaufen und den Gewinner ziehen kann.
Voraussetzungen:

* Node.js und npm müssen installiert sein
* MetaMask Browser-Extension muss installiert sein

* MetaMask muss auf Sepolia Test Network gestellt sein

Schritte:

* In den frontend-Ordner wechseln:
* cd frontend
* Abhängigkeiten installieren:
* npm install
* Frontend starten:
* npm run dev
* Die URL im Browser öffnen (http://localhost:5173)

Oben rechts MetaMask öffnen
→ „Connect“ klicken
→ Netzwerk auf Sepolia wechseln
→ Wallet verbinden

„Buy Ticket“ im Frontend klicken
→ MetaMask öffnen mit Extension
→ Transaktion bestätigen
→ Ticket wird gekauft

Sobald alle Spieler ihre Tickets gekauft haben, kann der Owner auf
„Pick Winner“ / „Draw“ klicken
→ MetaMask öffnet sich
→ Gewinner wird ausgezahlt

Damit ist die komplette Lotterie über das Frontend verwendbar.

**2. Nutzung über Etherscan (ohne Frontend)**

Der Contract ist vollständig über Etherscan nutzbar.
Damit kann jeder am Testnet teilnehmen, ohne das Projekt lokal zu starten.

Schritte:

Auf Etherscan die Contract-Adresse öffnen:
https://sepolia.etherscan.io/address/0xA2aF81b7Ed1E4A5eA2E2927F27db430Fda5A045E#writeContract

Zum Tab “Write Contract” wechseln

Oben auf „Connect to Web3“ klicken
→ MetaMask verbinden
→ sicherstellen, dass das Netzwerk Sepolia aktiv ist

Unter enter():

im Feld „Value“ 0.01 Ether eintragen

„Write“ klicken

MetaMask öffnet sich, Transaktion bestätigen

Unter „Read Contract“ → getPlayers() kann man sehen, wer teilnimmt

Der Contract-Owner kann über pickWinner() den Gewinner ziehen
→ Auszahlung erfolgt automatisch an die gezogene Adresse

Wer gewonnen hat sieht man unter "internal Transactions" nach der Ziehung. 