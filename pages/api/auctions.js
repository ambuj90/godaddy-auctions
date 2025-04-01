// pages/api/auctions.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        const sortField = req.query.sortField || 'auction_end_time';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = { [sortField]: sortOrder };

        const [auctions, total] = await Promise.all([
            collection.find({})
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments()
        ]);

        return res.status(200).json({
            auctions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit
        });
    } catch (error) {
        console.error('Fetch error:', error);
        return res.status(500).json({ error: 'Failed to fetch auctions' });
    }
}
