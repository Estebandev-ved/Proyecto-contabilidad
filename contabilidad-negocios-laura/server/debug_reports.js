(async () => {
    try {
        const url = 'http://localhost:5000/api/accounting/profit-report?startDate=2026-02-01&endDate=2026-02-28';
        console.log(`Fetching from ${url}...`);
        const res = await fetch(url);
        const data = await res.json();

        if (!res.ok) {
            console.error("API Error Status:", res.status);
            console.error("API Error Data:", data);
        } else {
            console.log("Response:", JSON.stringify(data, null, 2));
        }
    } catch (error) {
        console.error("Request Error:", error.message);
    }
})();
