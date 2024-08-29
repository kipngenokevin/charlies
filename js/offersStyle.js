function selectOffer(id) {
    $('.offer-card').removeClass('selected');

// Select the clicked card
const selectedCard = $(`#${id}`).closest('.offer-card');
$(`#${id}`).prop('checked', true);
selectedCard.addClass('selected');
}

function selectPaymentMethod(id) {
    // Deselect all cards
    $('.offer-card').removeClass('selected');

    // Select the clicked card
    const selectedCard = $(`#${id}`).closest('.offer-card');
    $(`#${id}`).prop('checked', true);
    selectedCard.addClass('selected');
}