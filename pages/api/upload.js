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
    console.log("API HIT");
    if (req.method !== 'POST') return res.status(405).end('Method Not Allowed');

    const form = formidable({ keepExtensions: true });

    try {
        const [fields, files] = await form.parse(req);
        const file = files.file;
        const filepath = Array.isArray(file) ? file[0].filepath : file.filepath;

        const csv = await fs.readFile(filepath, 'utf-8');
        const records = parse(csv, {
            columns: true,
            skip_empty_lines: true,
        });

        const client = await clientPromise;
        const db = client.db('domain_auction');
        const collection = db.collection('auctions');

        const inserted = [];
        const skipped = [];
        for (const row of records) {
            const domainRaw = row['Domain Name'];
            if (!domainRaw || typeof domainRaw !== 'string') {
                console.log("❌ Skipped row: missing Domain Name", row);
                skipped.push('Missing domain');
                continue;
            }

            const domain = domainRaw.trim().toLowerCase();
            const exists = await collection.findOne({ domain_name: domain });

            if (exists) {
                console.log("⚠️ Already exists:", domain);
                skipped.push(domain);
                continue;
            }

            // ✅ Insert log
            console.log("✅ Inserting:", domain);

            await collection.insertOne({
                domain_name: domain,
                traffic: Number(row['Traffic'] || 0),
                bids: Number(row['Bids'] || 0),
                price: Number(row['Price'] || 0),
                estimated_value: Number(row['Estimated Value'] || 0),
                domain_age: row['Domain Age'] || '',
                auction_end_time: new Date(row['Auction End Time']),
                sale_type: row['Sale Type'] || '',
                majestic_tf: Number(row['Majestic TF'] || 0),
                majestic_cf: Number(row['Majestic CF'] || 0),
                backlinks: Number(row['Backlinks'] || 0),
                referring_domains: Number(row['Referring Domains'] || 0),
            });

            inserted.push(domain);
        }


        res.status(200).json({ inserted, skipped });
    } catch (error) {
        console.error('Upload error:', error);
        res.status(500).json({ error: 'Failed to upload file' });
    }
}
