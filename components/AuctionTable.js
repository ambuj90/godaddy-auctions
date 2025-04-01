import { useState, useEffect } from 'react';

export default function AuctionTable({ data }) {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    const formatted = data.map((auction) => ({
      ...auction,
      formattedTime: new Date(auction.auction_end_time).toLocaleString().replace('T', ' ').split('.')[0]
    }));
    setClientData(formatted);
  }, [data]);

  if (clientData.length === 0) return null;

  return (
    <div className="overflow-x-auto rounded-lg shadow-md mt-6">
      <table className="min-w-full text-sm text-left">
        <thead className="bg-gray-100 text-gray-700 uppercase text-xs">
          <tr>
            <th className="p-3">Domain</th>
            <th className="p-3">Price</th>
            <th className="p-3">Bids</th>
            <th className="p-3">Traffic</th>
            <th className="p-3">Majestic TF</th>
            <th className="p-3">Auction Ends</th>
          </tr>
        </thead>
        <tbody>
          {clientData.map((auction, idx) => (
            <tr key={auction.domain_name || idx} className="border-b hover:bg-gray-50">
              <td className="p-3">{auction.domain_name}</td>
              <td className="p-3">${auction.price}</td>
              <td className="p-3">{auction.bids}</td>
              <td className="p-3">{auction.traffic}</td>
              <td className="p-3">{auction.majestic_tf}</td>
              <td className="p-3">{auction.formattedTime}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}