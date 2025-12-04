// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IPlayerStats {
    function recordTicket(address player) external;
    function recordWin(address winner) external;
}

contract Lottery {
    address public owner;
    uint256 public ticketPrice;
    address[] public players;
    IPlayerStats public playerStats;

    constructor(uint256 _ticketPrice, address _playerStats) {
        owner = msg.sender;
        ticketPrice = _ticketPrice;
        playerStats = IPlayerStats(_playerStats);
    }

    function enter() external payable {
        require(msg.value == ticketPrice, "Wrong ticket price");

        players.push(msg.sender);

        playerStats.recordTicket(msg.sender);
    }

    function getPlayers() external view returns (address[] memory) {
        return players;
    }

    function pickWinner() external {
        require(msg.sender == owner, "Only owner");
        require(players.length > 0, "No players");

        uint256 random = uint256(
            keccak256(
                abi.encodePacked(block.timestamp, block.prevrandao, players.length)
            )
        );
        uint256 winnerIndex = random % players.length;
        address winner = players[winnerIndex];

        uint256 balance = address(this).balance;
        (bool ok, ) = winner.call{value: balance}("");
        require(ok, "Transfer failed");

        playerStats.recordWin(winner);

        delete players;
    }
}
