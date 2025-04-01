// pages/api/auctions.js
import clientPromise from '../../lib/mongodb';

export default async function handler(req, res) {
    try {
        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        // Parse pagination parameters
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 50;
        const skip = (page - 1) * limit;

        // Handle sorting
        const sortField = req.query.sortField || 'auction_end_time';
        const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
        const sortOptions = { [sortField]: sortOrder };

        // Execute query with proper error handling
        const [auctions, total] = await Promise.all([
            collection
                .find({})
                .sort(sortOptions)
                .skip(skip)
                .limit(limit)
                .toArray(),
            collection.countDocuments()
        ]);

        // Return the results
        res.status(200).json({
            auctions,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            limit
        });
    } catch (err) {
        console.error('Fetch error:', err);
        res.status(500).json({ error: 'Failed to fetch auctions' });
    }
}