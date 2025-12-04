const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("PlayerStatsModule", (m) => {
    const playerStats = m.contract("PlayerStats", []);

    return { playerStats };
});
