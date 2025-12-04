const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LotteryWithStatsModule", (m) => {
    const ticketPrice = 10n ** 16n;

    const playerStatsAddress = "0xe06685B6560E90722e54752cb29507186415C780"; //ist ja schon deployed, drum hardcodiert

    const lottery = m.contract("Lottery", [ticketPrice, playerStatsAddress]);

    return { lottery };
});
