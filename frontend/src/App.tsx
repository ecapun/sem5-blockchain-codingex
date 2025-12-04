import { useEffect, useState } from "react";
import { ethers } from "ethers";

declare global {
    interface Window {
        ethereum?: any;
    }
}

const LOTTERY_ADDRESS = import.meta.env.VITE_LOTTERY_ADDRESS as string;

const PLAYER_STATS_ADDRESS = "0xe06685B6560E90722e54752cb29507186415C780";

const LOTTERY_ABI = [
    "function ticketPrice() view returns (uint256)",
    "function owner() view returns (address)",
    "function getPlayers() view returns (address[])",
    "function enter() external payable",
    "function pickWinner() external",
];

const PLAYER_STATS_ABI = [
    "function getPlayerStats(address player) view returns (uint256 tickets, uint256 totalWins)",
];

type LotteryInfo = {
    ticketPriceWei: string;
    ticketPriceEth: string;
    owner: string;
    players: string[];
};

type PlayerStats = {
    tickets: string;
    wins: string;
};

function App() {
    const [account, setAccount] = useState<string | null>(null);
    const [networkName, setNetworkName] = useState<string>("");
    const [isSepolia, setIsSepolia] = useState<boolean>(false);

    const [lotteryInfo, setLotteryInfo] = useState<LotteryInfo | null>(null);
    const [playerStats, setPlayerStats] = useState<PlayerStats | null>(null);

    const [loading, setLoading] = useState(false);
    const [status, setStatus] = useState<string | null>(null);
    const [winnerFlash, setWinnerFlash] = useState(false);


    async function getProvider() {
        if (!window.ethereum) {
            throw new Error("MetaMask not found");
        }
        return new ethers.providers.Web3Provider(window.ethereum);
    }

    async function loadNetworkInfo(provider: ethers.providers.Web3Provider) {
        const net = await provider.getNetwork();
        const name = net.name === "homestead" ? "Mainnet" : net.name;
        setNetworkName(name);

        // Sepolia chainId = 11155111 (0xaa36a7)
        setIsSepolia(net.chainId === 11155111);
    }


    useEffect(() => {
        initOnLoad();
    }, []);

    async function initOnLoad() {
        if (!window.ethereum) return;
        const provider = await getProvider();
        await loadNetworkInfo(provider);
        const accounts = await provider.listAccounts();
        if (accounts.length > 0) {
            setAccount(accounts[0]);
            await loadLotteryData(provider);
            await loadPlayerStats(provider, accounts[0]);
        }
    }


    async function connectWallet() {
        try {
            const provider = await getProvider();
            const accounts: string[] = await provider.send("eth_requestAccounts", []);
            const acc = accounts[0];
            setAccount(acc);
            await loadNetworkInfo(provider);
            await loadLotteryData(provider);
            await loadPlayerStats(provider, acc);
        } catch (err) {
            console.error(err);
        }
    }

    async function loadLotteryData(provider?: ethers.providers.Web3Provider) {
        try {
            const prov = provider || (await getProvider());
            const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, prov);

            const [priceBN, ownerAddr, players] = await Promise.all([
                contract.ticketPrice(),
                contract.owner(),
                contract.getPlayers(),
            ]);

            const ticketPriceWei = priceBN.toString();
            const ticketPriceEth = ethers.utils.formatEther(priceBN);

            setLotteryInfo({
                ticketPriceWei,
                ticketPriceEth,
                owner: ownerAddr,
                players,
            });
            setStatus(null);
        } catch (err) {
            console.error(err);
            setStatus(
                "Fehler beim Laden der Lottery-Daten (Adresse & Netzwerk prüfen)."
            );
        }
    }

    async function loadPlayerStats(
        provider?: ethers.providers.Web3Provider,
        addr?: string
    ) {
        try {
            if (!addr) return;
            const prov = provider || (await getProvider());
            const contract = new ethers.Contract(
                PLAYER_STATS_ADDRESS,
                PLAYER_STATS_ABI,
                prov
            );

            const [ticketsBN, winsBN] = await contract.getPlayerStats(addr);
            setPlayerStats({
                tickets: ticketsBN.toString(),
                wins: winsBN.toString(),
            });
        } catch (err) {
            console.error("Fehler beim Laden der Player-Stats:", err);
            // bei Fehler Stats einfach null lassen
            setPlayerStats(null);
        }
    }


    async function joinLottery() {
        if (!lotteryInfo) return;
        try {
            setLoading(true);
            setStatus("Sende Transaktion…");

            const provider = await getProvider();
            const signer = provider.getSigner();
            const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);

            const tx = await contract.enter({ value: lotteryInfo.ticketPriceWei });
            setStatus("Warte auf Bestätigung…");
            await tx.wait();

            setStatus("Du bist in der Lottery! 🎉");
            await loadLotteryData(provider);

            const signerAddr = await signer.getAddress();
            await loadPlayerStats(provider, signerAddr);
        } catch (err: any) {
            console.error(err);
            setStatus(null);
            alert(err?.reason || err?.message || "Fehler beim Beitritt");
        } finally {
            setLoading(false);
        }
    }

    async function pickWinner() {
        if (!lotteryInfo) return;
        try {
            setLoading(true);
            setStatus("Ziehe Gewinner…");

            const provider = await getProvider();
            const signer = provider.getSigner();
            const contract = new ethers.Contract(LOTTERY_ADDRESS, LOTTERY_ABI, signer);

            const tx = await contract.pickWinner();
            await tx.wait();

            setStatus("Gewinner gezogen & ausgezahlt 🎊");
            setWinnerFlash(true);
            setTimeout(() => setWinnerFlash(false), 2500);

            await loadLotteryData(provider);

            const signerAddr = await signer.getAddress();
            await loadPlayerStats(provider, signerAddr);
        } catch (err: any) {
            console.error(err);
            setStatus(null);
            alert(
                err?.reason ||
                err?.message ||
                "Fehler beim Ziehen des Gewinners (Owner? Spieler vorhanden?)"
            );
        } finally {
            setLoading(false);
        }
    }

    const isOwner =
        account &&
        lotteryInfo &&
        account.toLowerCase() === lotteryInfo.owner.toLowerCase();

    const accountIsPlayer =
        !!account &&
        !!lotteryInfo &&
        lotteryInfo.players.some(
            (p) => p.toLowerCase() === account.toLowerCase()
        );


    return (
        <div className="app-root">
            <header className="app-header">
                <div>
                    <h1>🎟️ Sepolia Lottery</h1>
                    <div className="contract-address">
                        Contract: <code>{LOTTERY_ADDRESS}</code>
                    </div>
                </div>

                <div className="wallet-box">
                    <div className="network-tag">
                        Network:{" "}
                        <span className={isSepolia ? "network-ok" : "network-bad"}>
              {networkName || "Unknown"}
            </span>
                    </div>
                    {account ? (
                        <>
                            <div className="wallet-label">Wallet</div>
                            <div className="wallet-address">
                                {account.slice(0, 6)}…{account.slice(-4)}
                            </div>
                            {accountIsPlayer && (
                                <div className="pill pill-small" style={{ marginTop: 4 }}>
                                    You&apos;re in this round 🎉
                                </div>
                            )}
                        </>
                    ) : (
                        <button onClick={connectWallet} className="btn primary">
                            Connect MetaMask
                        </button>
                    )}
                </div>
            </header>

            {!isSepolia && (
                <div className="warning-box">
                    ⚠️ Bitte in MetaMask auf <b>Sepolia</b> wechseln, damit alles
                    funktioniert.
                </div>
            )}

            {!lotteryInfo ? (
                <div className="card">
                    <p>
                        Noch keine Lottery-Daten geladen. Verbinde deine Wallet oder prüfe
                        die Contract-Adresse in <code>.env</code>.
                    </p>
                </div>
            ) : (
                <>
                    <main className="grid">
                        <section className="card">
                            <h2>Lottery Info</h2>
                            <p>
                                <b>Ticketpreis:</b> {lotteryInfo.ticketPriceEth} ETH
                                <br />
                                <b>Owner:</b>{" "}
                                <span className="mono">{lotteryInfo.owner}</span>
                                <br />
                                <b>Spieler:</b> {lotteryInfo.players.length}
                            </p>

                            <div className="button-row">
                                <button
                                    className={
                                        "btn primary" +
                                        (!accountIsPlayer && account && isSepolia ? " pulse" : "")
                                    }
                                    disabled={!account || loading || !isSepolia}
                                    onClick={joinLottery}
                                >
                                    {accountIsPlayer
                                        ? "You already joined"
                                        : `Join Lottery (${lotteryInfo.ticketPriceEth} ETH)`}
                                </button>

                                <button
                                    className="btn secondary"
                                    disabled={!account || !isOwner || loading || !isSepolia}
                                    onClick={pickWinner}
                                >
                                    Pick Winner (Owner)
                                </button>
                            </div>

                            {status && <p className="status-text">{status}</p>}

                            {account && !isOwner && (
                                <p className="hint-text">
                                    Hinweis: Nur der <b>Owner</b> kann „Pick Winner“ ausführen.
                                </p>
                            )}
                        </section>

                        <section className="card">
                            <h2>Players</h2>
                            {lotteryInfo.players.length === 0 ? (
                                <p>Noch keine Spieler! Sei der Erste! 😄</p>
                            ) : (
                                <ul className="player-list">
                                    {lotteryInfo.players.map((p, i) => {
                                        const isThisAccount =
                                            account && p.toLowerCase() === account.toLowerCase();
                                        return (
                                            <li
                                                key={i}
                                                className={
                                                    "player-item" + (isThisAccount ? " player-me" : "")
                                                }
                                            >
                        <span>
                          #{i + 1} –{" "}
                            <span className="mono">
                            {p.slice(0, 6)}…{p.slice(-4)}
                          </span>
                        </span>
                                                <div style={{ display: "flex", gap: 6 }}>
                                                    {lotteryInfo.owner.toLowerCase() ===
                                                        p.toLowerCase() && (
                                                            <span className="pill">Owner</span>
                                                        )}
                                                    {isThisAccount && (
                                                        <span className="pill pill-me">You</span>
                                                    )}
                                                </div>
                                            </li>
                                        );
                                    })}
                                </ul>
                            )}
                        </section>

                        <section className="card">
                            <h2>Deine Lottery-Statistiken</h2>
                            {!account ? (
                                <p>Verbinde deine Wallet, um deine Statistiken zu sehen.</p>
                            ) : !playerStats ? (
                                <p>Noch keine Statistiken gefunden – spiele eine Runde! 🎮</p>
                            ) : (
                                <p>
                                    <b>Tickets gekauft:</b> {playerStats.tickets}
                                    <br />
                                    <b>Gewinne:</b> {playerStats.wins}
                                </p>
                            )}
                            <p className="hint-text">
                                Kauf ein Ticket. Schadet nicht. Außer deinem Kontostand.
                            </p>
                        </section>
                    </main>

                    {winnerFlash && (
                        <div className="winner-banner">
                            🎉 Winner selected! Check your wallet! 🎉
                        </div>
                    )}

                    <footer style={{ marginTop: "2rem" }}>
                        <h3>Weitere Infos auf Etherscan</h3>
                        <div style={{ display: "flex", gap: "1rem", justifyContent: "center", flexWrap: "wrap" }}>
                            <a
                                href={`https://sepolia.etherscan.io/address/${LOTTERY_ADDRESS}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn secondary"
                            >
                                Lottery auf Etherscan
                            </a>
                            <a
                                href={`https://sepolia.etherscan.io/address/${PLAYER_STATS_ADDRESS}`}
                                target="_blank"
                                rel="noreferrer"
                                className="btn secondary"
                            >
                                PlayerStats auf Etherscan
                            </a>
                        </div>
                    </footer>
                </>
            )}
        </div>
    );
}

export default App;
