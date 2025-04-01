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
        // Parse the incoming form data
        const form = formidable({ keepExtensions: true });
        const [fields, files] = await form.parse(req);

        // Access the file
        const file = files.file;
        if (!file || (Array.isArray(file) && file.length === 0)) {
            return res.status(400).json({ error: 'No file provided' });
        }

        const filepath = Array.isArray(file) ? file[0].filepath : file.filepath;

        // Read and parse the CSV file
        const csv = await fs.readFile(filepath, 'utf-8');
        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
            trim: true,
        });

        if (records.length === 0) {
            return res.status(400).json({ error: 'CSV file is empty or invalid' });
        }

        // Connect to MongoDB
        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        // Process each row
        const inserted = [];
        const skipped = [];

        for (const row of records) {
            // Get domain name from CSV
            const domainRaw = row['Domain Name'] || row['DOMAIN'] || row['domain'] || row['Domain'];

            if (!domainRaw || typeof domainRaw !== 'string') {
                skipped.push('Missing domain');
                continue;
            }

            // Clean domain name
            const domain = domainRaw.trim().toLowerCase();

            // Check if domain already exists
            const exists = await collection.findOne({ domain_name: domain });
            if (exists) {
                skipped.push(domain);
                continue;
            }

            // Parse auction end time
            let auctionEndTime;
            const endTimeRaw = row['Auction End Time'] || row['Auction Ends'] || row['End Time'];

            try {
                auctionEndTime = endTimeRaw ? new Date(endTimeRaw) : new Date();
                // Check if date is valid
                if (isNaN(auctionEndTime.getTime())) {
                    auctionEndTime = new Date(); // Default to current time
                }
            } catch (error) {
                auctionEndTime = new Date(); // Default to current time
            }

            // Create auction document
            const auctionDoc = {
                domain_name: domain,
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
                created_at: new Date()
            };

            // Insert into database
            await collection.insertOne(auctionDoc);
            inserted.push(domain);
        }

        // Send response
        return res.status(200).json({ inserted, skipped });
    } catch (error) {
        console.error('Upload error:', error);
        return res.status(500).json({ error: error.message || 'Failed to upload file' });
    }
}