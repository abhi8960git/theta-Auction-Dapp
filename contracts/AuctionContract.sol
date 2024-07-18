// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract CarAuction {
    IERC20 public token;
    uint256 public auctionCounter;

    struct Auction {
        address payable seller;
        uint256 carId;
        string carDetails;
        uint256 minBid;
        uint256 highestBid;
        address highestBidder;
        uint256 endTime;
        bool finalized;
    }

    Auction[] public auctions;

    event AuctionCreated(uint256 auctionId, address seller, uint256 carId, string carDetails, uint256 minBid, uint256 endTime);
    event BidPlaced(uint256 auctionId, address bidder, uint256 amount);
    event AuctionFinalized(uint256 auctionId, address winner, uint256 amount);

    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
        auctionCounter = 0;
    }

    function createAuction(string memory _carDetails, uint256 _minBid) public {
        uint256 carId = auctionCounter++;
        uint256 endTime = block.timestamp +  5 minutes;
        auctions.push(Auction({
            seller: payable(msg.sender),
            carId: carId,
            carDetails: _carDetails,
            minBid: _minBid,
            highestBid: 0,
            highestBidder: address(0),
            endTime: endTime,
            finalized: false
        }));
        emit AuctionCreated(carId, msg.sender, carId, _carDetails, _minBid, endTime);
    }

    function approveAccount(uint256 _amount) public {
        token.approve(address(this), _amount);

    }

    function placeBid(uint256 _auctionId, uint256 _amount) public {
        Auction storage auction = auctions[_auctionId];
        require(token.balanceOf(msg.sender) >= _amount, "Insufficeint Balance");
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(_amount > auction.minBid, "Bid must be higher than the minimum bid");
        require(_amount > auction.highestBid, "Bid must be higher than the current highest bid");
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");

        if (auction.highestBidder != address(0)) {
            // Refund the previous highest bidder
            require(token.transfer(auction.highestBidder, auction.highestBid), "Refund failed");
        }

        auction.highestBid = _amount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, _amount);
    }

    function getWinner(uint256 _auctionId) public view returns (address) {
        Auction storage auction = auctions[_auctionId];

        require(block.timestamp >= auction.endTime, "Auction is still ongoing");

        return auction.highestBidder;
    }

    function confirmBid(uint256 _auctionId) public {
        Auction storage auction = auctions[_auctionId];

        require(block.timestamp >= auction.endTime, "Auction is still ongoing");
        require(!auction.finalized, "Auction has already been finalized");
        require(msg.sender == auction.seller, "Only seller can confirm the bid");

        auction.finalized = true;

        if (auction.highestBidder != address(0)) {
            // Transfer funds to the seller
            require(token.transfer(auction.seller, auction.highestBid), "Transfer to seller failed");
        }

        emit AuctionFinalized(_auctionId, auction.highestBidder, auction.highestBid);
    }


    function fetchLatestAuctionId() public view returns (uint256){
        return auctionCounter;
    }


     function fetchAllAuctions() public view returns (Auction[] memory) {
        return auctions;
    }



    


}
