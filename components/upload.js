// components/upload.js
import { useState } from 'react';

export default function Upload({ onUploadSuccess }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        setError(null);
        setResult(null);

        try {
            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                throw new Error('Failed to upload file');
            }

            const data = await res.json();
            setResult(data);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white shadow rounded-lg mb-6">
            <div className="p-6">
                <h2 className="text-lg font-medium text-center mb-4">Upload Auction CSV</h2>

                <div className="max-w-xl mx-auto">
                    <div className="flex items-center justify-center">
                        <label className="w-full flex flex-col items-center px-4 py-6 bg-white text-gray-500 rounded-lg border border-gray-300 cursor-pointer hover:bg-gray-50">
                            <span className="text-base leading-normal">Choose File No file chosen</span>
                            <input
                                type="file"
                                name="file"
                                accept=".csv"
                                onChange={handleUpload}
                                className="hidden"
                            />
                        </label>
                    </div>

                    {loading && <p className="text-blue-500 mt-4 text-center">Uploading...</p>}
                    {error && <p className="text-red-500 mt-4 text-center">Error: {error}</p>}

                    {result && (
                        <div className="mt-4 text-sm bg-gray-50 p-4 rounded-md">
                            <p>✅ <strong>Inserted:</strong> {result.inserted.length}</p>
                            <p>🚫 <strong>Skipped:</strong> {result.skipped.length}</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}