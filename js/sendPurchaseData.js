export default async function sendPurchaseData(purchaseData) {
    try {
        const response = await fetch('https://safanalytics.gigastreammedia.net/api/purchases', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(purchaseData),
        });

        if (!response.ok) {
            throw new Error('Failed to store purchase data');
        }

        return await response.json();
    } catch (error) {
        console.error("Error sending purchase data:", error);
        throw error;
    }
}