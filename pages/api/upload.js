import formidable from 'formidable';
import fs from 'fs/promises';
import { parse } from 'csv-parse/sync';
import clientPromise from '../../lib/mongodb';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
    }

    try {
        const form = formidable({ keepExtensions: true });
        const [fields, files] = await form.parse(req);

        const file = files.file;
        if (!file || (Array.isArray(file) && file.length === 0)) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const filepath = Array.isArray(file) ? file[0].filepath : file.filepath;
        const originalFilename = Array.isArray(file) ? file[0].originalFilename : file.originalFilename;
        const source = originalFilename || 'unknown_source.csv';

        const csv = await fs.readFile(filepath, 'utf-8');
        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        if (records.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty or invalid' });
        }

        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        const newDocs = [];
        const newDomainsSet = new Set();
        const skipped = [];

        for (const row of records) {
            const domainRaw = row['Domain Name'] || row['DOMAIN'] || row['domain'] || row['Domain'];
            if (!domainRaw || typeof domainRaw !== 'string') {
                skipped.push('Missing domain');
                continue;
            }

            const domain = domainRaw.trim().toLowerCase();
            newDomainsSet.add(domain);

            let auctionEndTime;
            const endTimeRaw = row['Auction End Time'] || row['Auction Ends'] || row['End Time'];
            try {
                auctionEndTime = endTimeRaw ? new Date(endTimeRaw) : new Date();
                if (isNaN(auctionEndTime.getTime())) auctionEndTime = new Date();
            } catch {
                auctionEndTime = new Date();
            }

            newDocs.push({
                domain_name: domain,
                source,
                traffic: parseInt(row['Traffic'] || 0, 10) || 0,
                bids: parseInt(row['Bids'] || 0, 10) || 0,
                price: parseFloat(row['Price'] || 0) || 0,
                estimated_value: parseFloat(row['Estimated Value'] || 0) || 0,
                domain_age: row['Domain Age'] || '',
                auction_end_time: auctionEndTime,
                sale_type: row['Sale Type'] || '',
                majestic_tf: parseInt(row['Majestic TF'] || 0, 10) || 0,
                majestic_cf: parseInt(row['Majestic CF'] || 0, 10) || 0,
                backlinks: parseInt(row['Backlinks'] || 0, 10) || 0,
                referring_domains: parseInt(row['Referring Domains'] || 0, 10) || 0,
                created_at: new Date(),
            });
        }

        // Step 1: Get current domains
        const existingDocs = await collection.find({}, { projection: { domain_name: 1 } }).toArray();
        const existingDomainsSet = new Set(existingDocs.map(doc => doc.domain_name));

        // Step 2: Keep only domains in both new and existing
        const intersectedDomains = [...newDomainsSet].filter(domain => existingDomainsSet.has(domain));

        // Step 3: Remove all old data
        await collection.deleteMany({});

        // Step 4: Insert only intersected domain data from new upload
        const inserted = [];
        for (const doc of newDocs) {
            if (intersectedDomains.includes(doc.domain_name)) {
                await collection.insertOne(doc);
                inserted.push(doc.domain_name);
            }
        }

        return res.status(200).json({ inserted, skipped });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
}
