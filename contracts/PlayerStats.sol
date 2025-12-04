// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

contract PlayerStats {
    mapping(address => uint256) public ticketsBought;
    mapping(address => uint256) public wins;

    function recordTicket(address player) external {
        ticketsBought[player]++;
    }

    function recordWin(address winner) external {
        wins[winner]++;
    }

    function getPlayerStats(address player)
    external
    view
    returns (uint256 tickets, uint256 totalWins)
    {
        tickets = ticketsBought[player];
        totalWins = wins[player];
    }
}
