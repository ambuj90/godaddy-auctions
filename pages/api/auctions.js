// pages/api/auctions.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        const page = parseInt(req.query.page) || 1;
        const limit = 50;
        const skip = (page - 1) * limit;

        const [auctions, total] = await Promise.all([
            collection
                .find({})
                .sort({ auction_end_time: 1 })
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments()
        ]);

        res.status(200).json({ auctions, total });
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch auctions' });
    }
}
