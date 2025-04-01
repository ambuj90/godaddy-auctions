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
  const limit = 50;

  const fetchAuctions = async (currentPage = 1) => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/auctions?page=${currentPage}`);

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
  }, [page]);

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="min-h-screen bg-gray-50">
      <Head>
        <title>Auction Dashboard</title>
        <meta name="description" content="GoDaddy Auctions Viewer" />
      </Head>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <h1 className="text-2xl font-bold text-gray-800 mb-6">Auction Dashboard</h1>

        <Upload onUploadSuccess={() => fetchAuctions(1)} />

        {loading && <p className="text-gray-500 mt-4 text-center">Loading auctions...</p>}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}

        {!loading && !error && auctions.length > 0 && (
          <>
            <AuctionTable data={auctions} />

            <div className="flex justify-center mt-6">
              <nav className="inline-flex rounded-md shadow">
                <button
                  onClick={() => setPage((prev) => Math.max(1, prev - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-l disabled:opacity-50"
                >
                  ◀ Prev
                </button>

                <span className="px-4 py-2 bg-white border-t border-b border-gray-300 text-sm text-gray-600">
                  Page {page} of {totalPages || 1}
                </span>

                <button
                  onClick={() => setPage((prev) => (page < totalPages ? prev + 1 : prev))}
                  disabled={page >= totalPages}
                  className="px-4 py-2 bg-gray-200 text-gray-800 rounded-r disabled:opacity-50"
                >
                  Next ▶
                </button>
              </nav>
            </div>
          </>
        )}

        {!loading && !error && auctions.length === 0 && (
          <p className="text-gray-400 mt-4 text-center">No auctions found.</p>
        )}
      </div>
    </div>
  );
}