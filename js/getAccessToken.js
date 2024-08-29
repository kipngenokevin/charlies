// getAccessToken.js
export default function getAccessToken(username, password) {
    const apiUrl = 'https://safaricom-offers.gigastreammedia.net/proxy/oauth2/v1/generate?grant_type=client_credentials';
    const encodedCredentials = btoa(`${username}:${password}`);

    return $.ajax({
        url: apiUrl,
        method: 'POST',
        headers: {
            'Authorization': `Basic ${encodedCredentials}`,
        }
    }).done(function(data) {
        // console.log('Access Token:', data.access_token);
        window.accessToken = data.access_token;
    }).fail(function(jqXHR, textStatus, errorThrown) {
        console.error('Error:', textStatus, errorThrown);
    });
}
