export default async function makePurchase(
    accessToken,
    msisdn,
    offeringId,
    paymentMode,
    accountId,
    price,
    resourceAmount,
    validity
) {
    const url = 'https://safaricom-offers.gigastreammedia.net/proxy/v1/dynamic-offers/facebook-bundle/purchase';

    const headers = {
        'Authorization': `Bearer ${accessToken.access_token}`,
        'x-source-system': 'gigastream-artcaffe', 
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept': '*/*',
        'Content-Type': 'application/json',
        'Content-Security-Policy': "default-src 'none'",
        'X-Frame-Options': 'DENY',
        'X-Content-Type-Options': 'nosniff',
        'x-correlation-conversationid': Date.now(), // send in milliseconds
        'x-msisdn': msisdn
    };

    const body = {
        offeringId: offeringId.toString(),
        accountId: accountId.toString(),
        price: price.toString(),
        resourceAmount: resourceAmount.toString(),
        validity: validity.toString(),
        msisdn: msisdn,
        transactionId: new Date().toISOString(),
        paymentMode: paymentMode,
        resourceType: "data",  // Adding resourceType
        rechargedMSISDN: ""    // Adding rechargedMSISDN
    };

    // console.log("Headers:", headers);
    // console.log("Request Body:", body);

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body)
        });

        const responseText = await response.text();
        // console.log('Response Text:', responseText);

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        try {
            const responseData = responseText ? JSON.parse(responseText) : {};
            return responseData;
        } catch (parseError) {
            console.warn('Failed to parse response as JSON, returning raw text.');
            return responseText;
        }
    } catch (error) {
        console.error('Failed to make purchase:', error);
        throw error;
    }
}
