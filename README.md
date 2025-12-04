sem5-blockchain-codingex

**Interaktion mit dem Smart Contract**

Wir haben ein einfaches, aber vollständig funktionsfähiges Lottery-System entwickelt.
Mehrere Spieler können ein Ticket kaufen (0.01 Sepolia-ETH pro Ticket).
Sobald alle Teilnehmer eingezahlt haben, kann der Contract-Owner die Ziehung starten.

Nachdem der Owner die Ziehung in MetaMask bestätigt, wählt der Smart Contract automatisch einen zufälligen Gewinner aus.
Der Gewinner erhält den gesamten angesammelten Betrag direkt auf seine Wallet-Adresse überwiesen.

Zusätzlich wird die Anzahl der gekauften Tickets und die Anzahl der Gewinne eines Spielers automatisch im separaten PlayerStats-Smart-Contract gespeichert.
Damit lassen sich individuelle Statistiken im Frontend anzeigen.

Der Smart-Contract-Verbund besteht aus:

* Lottery (Hauptcontract)
* PlayerStats (Statistik-Contract)

Beide Contracts wurden auf dem Sepolia-Testnet deployed und können auf zwei Arten verwendet werden:

* über das bereitgestellte Frontend (empfohlen)
* direkt über Etherscan (ohne lokale Installation)

Contract-Adressen (Sepolia)

Lottery (mit PlayerStats-Integration):
0x84C94e71aF356e4E0FE5ED3f3B099401F405Da90

PlayerStats:
0xe06685B6560E90722e54752cb29507186415C780

**1. Nutzung über das Frontend (lokale Ausführung)**

Das Projekt enthält ein einfaches Frontend, mit dem man:

* Tickets kaufen
* Gewinner ziehen (Owner)
* eigene Statistiken ansehen (Tickets / Wins)

Voraussetzungen

* Node.js und npm müssen installiert sein
* MetaMask Browser-Extension
* MetaMask muss auf das Sepolia Test Network gestellt sein

Schritte

* In den Frontend-Ordner wechseln:
* cd frontend
* Abhängigkeiten installieren:
* npm install
* Frontend starten:
* npm run dev
* Danach die URL öffnen:
* http://localhost:5173
* MetaMask verbinden

Oben rechts MetaMask öffnen:

„Connect“ klicken →Netzwerk auf Sepolia wechseln →Wallet verbinden →Ticket kaufen

„Buy Ticket“ klicken →
MetaMask öffnet sich →
Transaktion bestätigen →
Ticket wird gekauft.

**Gewinner ziehen (nur Owner)**

„Pick Winner“ klicken →
MetaMask öffnet sich →
Der Gewinner erhält den kompletten Pot.

Gleichzeitig wird automatisch:

* recordTicket() beim Ticketkauf aufgerufen
* recordWin() beim Ziehen des Gewinners gespeichert

Im Frontend sieht man danach die eigenen Statistiken.

2. Nutzung über Etherscan (ohne Frontend)

Der Contract kann auch direkt über Etherscan genutzt werden.
Damit kann jeder am Testnet teilnehmen, ohne das Projekt lokal auszuführen.

Lottery Contract öffnen

https://sepolia.etherscan.io/address/0x84C94e71aF356e4E0FE5ED3f3B099401F405Da90#writeContract

Schritte

Zum Tab “Write Contract” wechseln

„Connect to Web3“ klicken
→ MetaMask verbinden
→ sicherstellen, dass Sepolia aktiv ist

Ticket kaufen (enter) → Unter enter():

* Value = 0.01 Ether eintragen
* „Write“ klicken
* Transaktion in MetaMask bestätigen

Unter Read Contract → getPlayers() sieht man alle Teilnehmer.

Gewinner ziehen (pickWinner)

Nur der Owner kann pickWinner() ausführen.
Nach der Ziehung sieht man den Gewinner unter:

Internal Transactions (geht an die Gewinner-Adresse)

Hinweis: PlayerStats Contract

Wenn du deine eigenen Statistiken ansehen willst:

PlayerStats Contract:
https://sepolia.etherscan.io/address/0xe06685B6560E90722e54752cb29507186415C780#readContract

Unter getPlayerStats(address) kannst du prüfen:


* Anzahl der gekauften Tickets
* Anzahl der Gewinne

Diese Werte werden vom Lottery-Contract automatisch aktualisiert.