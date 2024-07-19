// SPDX-License-Identifier: MIT
pragma solidity ^0.8.18;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

/**
 * @title CarAuction
 * @dev A contract for auctioning cars using ERC20 tokens.
 */
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

    event AuctionCreated(
        uint256 indexed auctionId,
        address indexed seller,
        uint256 carId,
        string carDetails,
        uint256 minBid,
        uint256 endTime
    );
    event BidPlaced(
        uint256 indexed auctionId,
        address indexed bidder,
        uint256 amount
    );
    event AuctionFinalized(
        uint256 indexed auctionId,
        address indexed winner,
        uint256 amount
    );

    /**
     * @dev Initializes the contract with the given ERC20 token address.
     * @param tokenAddress Address of the ERC20 token used for bidding.
     */
    constructor(address tokenAddress) {
        token = IERC20(tokenAddress);
        auctionCounter = 0;
    }

    /**
     * @notice Creates a new auction.
     * @param _carDetails Details of the car being auctioned.
     * @param _minBid Minimum bid amount in tokens.
     */
    function createAuction(
        string memory _carDetails,
        uint256 _minBid
    ) public {
        uint256 carId = auctionCounter++;
        uint256 endTime = block.timestamp + 5 minutes;
        auctions.push(
            Auction({
                seller: payable(msg.sender),
                carId: carId,
                carDetails: _carDetails,
                minBid: _minBid,
                highestBid: 0,
                highestBidder: address(0),
                endTime: endTime,
                finalized: false
            })
        );
        emit AuctionCreated(
            carId,
            msg.sender,
            carId,
            _carDetails,
            _minBid,
            endTime
        );
    }

    /**
     * @notice Approves the contract to spend a specific amount of tokens on behalf of the caller.
     * @param _amount Amount of tokens to approve.
     */
    function approveAccount(uint256 _amount) public {
        token.approve(address(this), _amount);
    }

    /**
     * @notice Places a bid on a specific auction.
     * @param _auctionId ID of the auction to place a bid on.
     * @param _amount Amount of tokens to bid.
     */
    function placeBid(uint256 _auctionId, uint256 _amount) public {
        Auction storage auction = auctions[_auctionId];
        require(
            token.balanceOf(msg.sender) >= _amount,
            "Insufficient Balance"
        );
        require(block.timestamp < auction.endTime, "Auction has ended");
        require(
            _amount > auction.minBid,
            "Bid must be higher than the minimum bid"
        );
        require(
            _amount > auction.highestBid,
            "Bid must be higher than the current highest bid"
        );
        require(
            token.transferFrom(msg.sender, address(this), _amount),
            "Token transfer failed"
        );

        if (auction.highestBidder != address(0)) {
            // Refund the previous highest bidder
            require(
                token.transfer(auction.highestBidder, auction.highestBid),
                "Refund failed"
            );
        }

        auction.highestBid = _amount;
        auction.highestBidder = msg.sender;

        emit BidPlaced(_auctionId, msg.sender, _amount);
    }

    /**
     * @notice Gets the highest bidder of a specific auction.
     * @param _auctionId ID of the auction to query.
     * @return The address of the highest bidder.
     */
    function getWinner(uint256 _auctionId) public view returns (address) {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endTime, "Auction is still ongoing");
        return auction.highestBidder;
    }

    /**
     * @notice Confirms the highest bid and finalizes the auction.
     * @param _auctionId ID of the auction to finalize.
     */
    function confirmBid(uint256 _auctionId) public {
        Auction storage auction = auctions[_auctionId];
        require(block.timestamp >= auction.endTime, "Auction is still ongoing");
        require(!auction.finalized, "Auction has already been finalized");
        require(msg.sender == auction.seller, "Only seller can confirm the bid");

        auction.finalized = true;

        if (auction.highestBidder != address(0)) {
            // Transfer funds to the seller
            require(
                token.transfer(auction.seller, auction.highestBid),
                "Transfer to seller failed"
            );
        }

        emit AuctionFinalized(
            _auctionId,
            auction.highestBidder,
            auction.highestBid
        );
    }

    /**
     * @notice Fetches the latest auction ID.
     * @return The latest auction ID.
     */
    function fetchLatestAuctionId() public view returns (uint256) {
        return auctionCounter;
    }

    /**
     * @notice Fetches all auctions.
     * @return An array of all auctions.
     */
    function fetchAllAuctions() public view returns (Auction[] memory) {
        return auctions;
    }
}
