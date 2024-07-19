"use client";
import React, { useState, useCallback, memo } from "react";
import { useContractWrite, useContractRead, useAccount } from "wagmi";
import addressData from "../contractAbi/contractAddress.json";
import auctionAbi from "../contractAbi/auction.json";
import erc20Abi from "../contractAbi/erc20.json";
import { Table } from 'antd';
        // @ts-ignore
const AuctionView = memo(({ carDetails, setCarDetails, minBid, setMinBid, write,latestAuctioncounter, tokenBalance , auctionId , setAuctionId}) => (
  <div className=" m-4 bg-gray-800 text-white p-6 rounded-lg max-w-md mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">Create new auction</h2>
    <h2 className="text-center py-3"> Last Auction id: {Number(latestAuctioncounter)} </h2>
    <h2 className="text-center py-3"> MTK Token Balance: {Number(tokenBalance)} </h2>
    <div className="mb-4">
      <label className="block mb-2">Car Details:</label>
      <textarea
        value={carDetails}
        onChange={(e) => setCarDetails(e.target.value)}
        className="w-full p-2 bg-gray-700 rounded"
        rows={4}
      />
    </div>
    <div className="mb-4">
      <label className="block mb-2">Minimum Bid:</label>
      <input
        value={minBid}
        onChange={(e) => setMinBid(Number(e.target.value))}
        type="number"
        className="w-full p-2 bg-gray-700 rounded"
        placeholder="200"
      />
    </div>
    <button
      onClick={() => write()}
      className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded transition duration-300"
    >
      Start auction
    </button>
    <hr className="my-6 border-gray-600" />
    <h2 className="text-2xl font-bold text-center mb-6">Finish auction</h2>
    <input type="text" value={auctionId} placeholder="get winner by auction id " onChange={()=> setAuctionId(auctionId)}></input>
    <button  className="w-full bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition duration-300">
      Finish auction
    </button>
  </div>
));
        // @ts-ignore
const BidView = memo(({ bidAmount, setBidAmount, approveSuccess, writeApprove, writeBidApprove }) => (
  <div className=" m-4 bg-gray-800 text-white p-6 rounded-lg max-w-md mx-auto">
    <h2 className="text-2xl font-bold text-center mb-6">New bid</h2>
    <div className="mb-4">
      <label className="block mb-2">Enter Bid Amount:</label>
      <input
        type="number"
        value={bidAmount}
        onChange={(e) => setBidAmount(Number(e.target.value))}
        className="w-full p-2 bg-gray-700 rounded"
        placeholder="10"
      />
    </div>
    {approveSuccess ? (
      <button
        onClick={() => writeBidApprove()}
        className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Place Bid
      </button>
    ) : (
      <button
        onClick={() => writeApprove()}
        className="w-full bg-yellow-500 hover:bg-yellow-600 text-white font-bold py-2 px-4 rounded transition duration-300"
      >
        Approve Bid
      </button>
    )}
  </div>
));




const AuctionTable = ({ auctions }) => {
  // Define the columns for the antd Table
  const columns = [
    {
      title: 'Car Details',
      dataIndex: 'carDetails',
      key: 'carDetails',
    },
    {
      title: 'Car ID',
      dataIndex: 'carId',
      key: 'carId',
      render: (text) => text.toString(),
    },
    {
      title: 'End Time',
      dataIndex: 'endTime',
      key: 'endTime',
      render: (timestamp) => new Date(parseInt(timestamp) * 1000).toUTCString(),
    },
    {
      title: 'Finalized',
      dataIndex: 'finalized',
      key: 'finalized',
      render: (text) => text.toString(),
    },
    {
      title: 'Highest Bid',
      dataIndex: 'highestBid',
      key: 'highestBid',
      render: (text) => text.toString(),
    },
    {
      title: 'Highest Bidder',
      dataIndex: 'highestBidder',
      key: 'highestBidder',
    },
    {
      title: 'Minimum Bid',
      dataIndex: 'minBid',
      key: 'minBid',
      render: (text) => text.toString(),
    },
    {
      title: 'Seller',
      dataIndex: 'seller',
      key: 'seller',
    },
  ];

  return <Table className="scroll-y " columns={columns} dataSource={auctions} rowKey="carId" />;
};



const AuctionApp = () => {
  const [activeView, setActiveView] = useState("auction");
  const [carDetails, setCarDetails] = useState("");
  const [minBid, setMinBid] = useState(null);
  const { address } = useAccount();
  const [bidAmount, setBidAmount] = useState(null);
  const [auctionId, setAuctionId] = useState("");

  const {
    data: itsData,
    isLoading,
    isSuccess,
    write,
  } = useContractWrite({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "createAuction",
    // @ts-ignore
    args: [carDetails, minBid],
  });
  
  const {
    data: confirmBid,
    isLoading:isBidLoading,
    isSuccess:isBidConfirmLoading,
    write:writeConfirmBid,
  } = useContractWrite({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "createAuction",
    // @ts-ignore
    args: [carDetails, minBid],
  });

  const {
    data: getWinner,
    isLoading:isgetWinnerLoading,
    isSuccess:isgetWinnerSuccess,
    write:writegetWinner,
  } = useContractWrite({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "createAuction",
    // @ts-ignore
    args: [carDetails, minBid],
  });



  const { data: latestAuctionCounter } = useContractRead({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "auctionCounter",
  });


  const { data: auctions } = useContractRead({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "fetchAllAuctions",
 
  });

  console.log("this is auctions", auctions);

  const { data: tokenBalance } = useContractRead({
    // @ts-ignore
    address: addressData.nft,
    // @ts-ignore
    abi: erc20Abi,
    // @ts-ignore
    functionName: "balanceOf",
    // @ts-ignore
    args:[address]
 
  });

  console.log("tokenBalance", tokenBalance)


  const {
    data: bidData,
    isLoading: bidloading,
    isSuccess: bidapproveSuccess,
    write: writeBidApprove,
  } = useContractWrite({
    // @ts-ignore
    address: addressData.auction,
    // @ts-ignore
    abi: auctionAbi,
    // @ts-ignore
    functionName: "placeBid",
    // @ts-ignore
    args: [latestAuctionCounter, bidAmount],
  });

  const {
    data: approveData,
    isLoading: loading,
    isSuccess: approveSuccess,
    write: writeApprove,
  } = useContractWrite({
    // @ts-ignore
    address: addressData.nft,
    // @ts-ignore
    abi: erc20Abi,
    // @ts-ignore
    functionName: "approve",
    // @ts-ignore
    args: [addressData.auction, bidAmount],
  });

  const handleSetCarDetails = useCallback((value) => setCarDetails(value), []);
  const handleSetMinBid = useCallback((value) => setMinBid(value), []);
  const handleSetBidAmount = useCallback((value) => setBidAmount(value), []);

  return (
    <div>
      <div style={{ textAlign: "center" }}>
        <button className="text-black" onClick={() => setActiveView("auction")}>Auction</button>
        <button onClick={() => setActiveView("bid")}>New Bid</button>
      </div>
      {activeView === "auction" ? (
        <>
        <AuctionView
        // @ts-ignore
          carDetails={carDetails}
          setCarDetails={handleSetCarDetails}
          minBid={minBid}
          setMinBid={handleSetMinBid}
          write={write}
          latestAuctioncounter={latestAuctionCounter}
          tokenBalance={tokenBalance}
          auctions= {auctions}
          setAuctionId={setAuctionId}
          auctionId={auctionId}
        />
              <AuctionTable auctions={auctions} />

        </>
      ) : (
        <BidView
        // @ts-ignore
          bidAmount={bidAmount}
          setBidAmount={handleSetBidAmount}
          approveSuccess={approveSuccess}
          writeApprove={writeApprove}
          writeBidApprove={writeBidApprove}
        />
      )}
    </div>
  );
};

export default AuctionApp;
