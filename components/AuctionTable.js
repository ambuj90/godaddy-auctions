// components/AuctionTable.js
import { useState, useEffect } from 'react';

export default function AuctionTable({ data }) {
  const [clientData, setClientData] = useState([]);

  useEffect(() => {
    const formatted = data.map((auction) => ({
      ...auction,
      formattedTime: new Date(auction.auction_end_time).toISOString().replace('T', ' ').split('.')[0]
    }));
    setClientData(formatted);
  }, [data]);

  if (clientData.length === 0) return null;

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-100">
          <tr>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Domain
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Price
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Bids
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Traffic
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Majestic TF
            </th>
            <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
              Auction Ends
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {clientData.map((auction, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                {auction.domain_name}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                ${auction.price}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                {auction.bids}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                {auction.traffic}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                {auction.majestic_tf}
              </td>
              <td className="px-3 py-3 whitespace-nowrap text-sm text-gray-900">
                {auction.formattedTime}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}