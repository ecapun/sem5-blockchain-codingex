const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("LotteryModule", (m) => {
    const ticketPrice = m.getParameter("ticketPrice", 10n ** 16n);

    const lottery = m.contract("Lottery", [ticketPrice]);

    return { lottery };
});
