const fetchOffers = async (accessToken, msisdn) => {
    const apiUrl = `https://safaricom-offers.gigastreammedia.net/proxy/v1/dynamic-offers/fetch?msisdn=${msisdn}`;

    try {
        const response = await fetch(apiUrl, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${accessToken.access_token}`, // Use only the access_token property
                'Content-Type': 'application/json',
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();

        // console.log('Received data:', data); // Log the entire response for debugging

        // Process the received data
        return data;
    } catch (error) {
        console.error('Error fetching offers:', error);
        throw error;
    }
};

export default fetchOffers;
