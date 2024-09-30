const updateOfferSelection = (offersData) => {
    const offerContainer = $('#offerContainer');
    offerContainer.empty(); // Clear existing offers

    offersData.forEach((offer, index) => {
        const isChecked = index === 0 ? 'checked' : ''; // Check the first radio button
        const uniqueId = `${offer.offeringId}_${index}`; // Create a unique ID for each radio button
        const offerHtml = `
            <div class="offer-card offers" onclick="selectOffer('${uniqueId}')">
                <input class="offer-input" type="radio" name="dataOffer" id="${uniqueId}" value="${offer.offerName}" ${isChecked}>
                <label class="offer-label" for="${uniqueId}">
                    ${offer.offerName} @ Ksh ${offer.offerPrice}
                </label>
            </div>
        `;
        offerContainer.append(offerHtml);
    });
}



export default updateOfferSelection;
