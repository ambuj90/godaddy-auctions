import { useEffect, useState } from 'react';
import Head from 'next/head';
import AuctionTable from '../components/AuctionTable';
import Upload from '../components/upload';

export default function Home() {
  const [auctions, setAuctions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortField, setSortField] = useState('auction_end_time');
  const [sortOrder, setSortOrder] = useState('asc');
  const limit = 50;

  const fetchAuctions = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auctions?page=${currentPage}&sortField=${sortField}&sortOrder=${sortOrder}`);

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Error ${res.status}: ${text}`);
      }

      const data = await res.json();
      setAuctions(data.auctions || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Fetch error:', err.message);
      setError('Failed to load auctions.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAuctions(page);
  }, [page, sortField, sortOrder]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Auction Dashboard</title>
        <meta name="description" content="GoDaddy Auctions Viewer" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-8 text-center">Auction Dashboard</h1>

        <Upload onUploadSuccess={() => fetchAuctions(1)} />

        <div className="my-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <input
            type="text"
            placeholder="Search domain..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-1/3 px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
          />

          <div className="flex gap-2">
            <select
              className="border px-3 py-2 rounded-md text-sm bg-white"
              value={sortField}
              onChange={(e) => setSortField(e.target.value)}
            >
              <option value="auction_end_time">Auction End</option>
              <option value="price">Price</option>
              <option value="bids">Bids</option>
              <option value="traffic">Traffic</option>
            </select>

            <select
              className="border px-3 py-2 rounded-md text-sm bg-white"
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value)}
            >
              <option value="asc">⬆ Asc</option>
              <option value="desc">⬇ Desc</option>
            </select>
          </div>
        </div>

        {loading && <p className="text-blue-500 mt-6 text-center">Loading auctions...</p>}
        {error && <p className="text-red-500 mt-6 text-center">{error}</p>}

        {!loading && !error && auctions.length > 0 && (
          <>
            <AuctionTable
              data={auctions.filter((auction) =>
                auction.domain_name.toLowerCase().includes(searchQuery.toLowerCase())
              )}
            />

            <div className="flex justify-center mt-6">
              <nav className="inline-flex shadow-sm rounded-md overflow-hidden">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 disabled:opacity-50 hover:bg-gray-300"
                >
                  ◀ Prev
                </button>

                <span className="px-5 py-2 bg-white border-t border-b border-gray-300 text-sm text-gray-600">
                  Page {page} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setPage((prev) => (page < totalPages ? prev + 1 : prev))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 disabled:opacity-50 hover:bg-gray-300"
                >
                  Next ▶
                </button>
              </nav>
            </div>
          </>
        )}

        {!loading && !error && auctions.length === 0 && (
          <p className="text-gray-500 mt-8 text-center">No auctions found.</p>
        )}
      </div>
    </div>
  );
}
