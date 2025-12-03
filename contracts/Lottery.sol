pragma solidity ^0.8.20;

contract Lottery {
    address public owner;
    uint256 public ticketPrice;
    address[] public players;

    constructor(uint256 _ticketPrice) {
        owner = msg.sender;
        ticketPrice = _ticketPrice;
    }

    function enter() external payable {
        require(msg.value == ticketPrice, "Wrong ticket price");
        players.push(msg.sender);
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

        delete players;
    }
}
