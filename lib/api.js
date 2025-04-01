// lib/api.ts

export const fetchAuctions = async () => {
  // Simulate network delay
  await new Promise((res) => setTimeout(res, 1000));

  // Mock data
  return [
    {
      domain: "cooldomain.com",
      price: 99,
      bids: 3,
      endTime: new Date(Date.now() + 3600000).toISOString(), // 1 hour later
    },
    {
      domain: "techbiz.net",
      price: 250,
      bids: 5,
      endTime: new Date(Date.now() + 7200000).toISOString(), // 2 hours later
    },
    {
      domain: "startup.ai",
      price: 1200,
      bids: 12,
      endTime: new Date(Date.now() + 10800000).toISOString(), // 3 hours later
    },
  ];
};
