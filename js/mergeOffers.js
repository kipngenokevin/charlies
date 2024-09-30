const mergeOffersWithoutDuplicates = (fetchedOffers, hardCodedOffers) => {
    // Filter out hardcoded offers that are already present in fetched offers
    const filteredHardCodedOffers = hardCodedOffers.filter(hardCodedOffer => {
        // Check if any fetched offer has the same 'uniqueOfferingId'
        return !fetchedOffers.some(fetchedOffer => 
            fetchedOffer.uniqueOfferingId === hardCodedOffer.uniqueOfferingId
        );
    });

    // Combine the filtered hardcoded offers with fetched offers
    const mergedOffers = [...filteredHardCodedOffers, ...fetchedOffers ];
    // console.log(mergedOffers);

    // Sort the merged offers by 'offerPrice' in an ascending order
    mergedOffers.sort((a,b) => a.offerPrice - b.offerPrice);

    return mergedOffers;
};

export default mergeOffersWithoutDuplicates;

