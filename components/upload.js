import { useState } from 'react';

export default function Upload({ onUploadSuccess }) {
    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [fileName, setFileName] = useState("No file chosen");

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setFileName(file.name);

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
                const errorData = await res.json();
                throw new Error(errorData.error || 'Failed to upload file');
            }

            const data = await res.json();
            setResult(data);
            if (onUploadSuccess) onUploadSuccess();
        } catch (err) {
            console.error("Upload error:", err);
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow">
            <div className="p-6 text-center">
                <h2 className="text-xl font-medium mb-4">Upload Auction CSV</h2>

                <div className="max-w-md mx-auto">
                    <label className="block mb-4">
                        <div className="flex items-center justify-center px-6 py-4 border-2 border-gray-300 border-dashed rounded-md hover:bg-gray-50 cursor-pointer">
                            <div className="space-y-1 text-center">
                                <svg className="mx-auto h-12 w-12 text-gray-400" stroke="currentColor" fill="none" viewBox="0 0 48 48" aria-hidden="true">
                                    <path d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                </svg>
                                <div className="text-sm text-gray-600">
                                    <span>Choose File</span>
                                </div>
                                <p className="text-xs text-gray-500">{fileName}</p>
                            </div>
                            <input
                                type="file"
                                name="file"
                                accept=".csv"
                                onChange={handleUpload}
                                className="sr-only"
                            />
                        </div>
                    </label>

                    {loading && (
                        <div className="text-blue-500 mt-2">
                            <p>Uploading...</p>
                        </div>
                    )}

                    {error && (
                        <div className="text-red-500 mt-2">
                            <p>Error: {error}</p>
                        </div>
                    )}

                    {result && (
                        <div className="mt-4 text-sm bg-green-50 p-4 rounded-md text-left">
                            <p>✅ <strong>Inserted:</strong> {result.inserted.length} domains</p>
                            <p>🚫 <strong>Skipped:</strong> {result.skipped.length} domains</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}