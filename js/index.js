import makePurchase from "./makePurchase.js";
import getAccessToken from "./getAccessToken.js";
import fetchOffers from "./fetchOffers.js";
import showStep from "./showStep.js";
import updateOfferSelection from "./updateOfferSelection.js";
import sendPurchaseData from "./sendPurchaseData.js";

let currentStep = 1;
let offersData = null;
let accessToken = null;
let msisdn = null;

$(document).ready(function() {
    showStep(currentStep);
    window.nextStep = nextStep;
    window.prevStep = prevStep;
});

window.nextStep = async function() {
    // Show the spinner and disable the button to prevent multiple clicks
    $('#spinner').show();
    $('#nextStepButton').prop('disabled', true);
    $('#errorMessage').hide();  // Hide the error message if it was shown before

    // Ensure the spinner is visible for at least 2 seconds
    const spinnerDelay = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
        if (currentStep === 1) {
            let phoneNumber = $('#phoneNumber').val();

            if (!phoneNumber) {
                alert('Please input your phone number.');
                return;
            }

            // Remove any non-numeric characters
            phoneNumber = phoneNumber.replace(/\D/g, '');

            // Check if the phone number already starts with '254'
            if (!phoneNumber.startsWith('254')) {
                // If not, prepend '254' and remove leading zero if present
                if (phoneNumber.startsWith('0')) {
                    phoneNumber = phoneNumber.substring(1);
                }
                phoneNumber = '254' + phoneNumber;
            }

            if (phoneNumber.length < 10) {
                alert('Phone number is too short. Please enter a valid number.');
                return;
            }

            msisdn = phoneNumber;

            const username = 'd3wo7feC8z3VRB6ASQva7nvFczAkDaDG8hUGGgAaGGkqZjaG';
            const password = 'bWkk4miPhESLnfHS3MmZ4nVV99iVKWzWRFoBhTzozREuwn8LOQrWeFhnWWTLP6kz';

            try {
                accessToken = await getAccessToken(username, password);
                // console.log('Access Token:', accessToken);
                const offers = await fetchOffers(accessToken, msisdn);
                // console.log("Received offers", offers);
                offersData = offers.lineItem.characteristicsValue;
                await spinnerDelay; // Ensure spinner is shown for 2 seconds
                updateOfferSelection(offersData);
                currentStep++;
                showStep(currentStep);
            } catch (error) {
                console.error('Failed to obtain access token or fetch offers:', error);
                $('#spinner').hide();
                $('#nextStepButton').prop('disabled', false);
                $('#errorMessage').text('Service currently unavailable, please try again later.').show(); // Display error message
            }
        } else if (currentStep === 2) {
            const selectedOffer = $('input[name="dataOffer"]:checked').val();
            if (!selectedOffer) {
                alert('Please select an offer.');
                $('#spinner').hide();
                $('#nextStepButton').prop('disabled', false);
                return;
            }

            await spinnerDelay; // Ensure spinner is shown for 2 seconds
            currentStep++;
            showStep(currentStep);
        } else if (currentStep === 3) {
            const selectedOffer = $('input[name="dataOffer"]:checked').val();
            // console.log('Selected Offer:', selectedOffer);

            const selectedOfferData = offersData.find(offer => offer.offerName === selectedOffer);

            if (!selectedOfferData) {
                alert('Selected offer details not found. Please try again.');
                console.error('Selected offer data not found:', selectedOffer);
                $('#spinner').hide();
                $('#nextStepButton').prop('disabled', false);
                return;
            }

            const paymentMode = $('input[name="paymentMethod"]:checked').val();

            if (!paymentMode) {
                alert('Please select a payment method.');
                $('#spinner').hide();
                $('#nextStepButton').prop('disabled', false);
                return;
            }

            const accountId = selectedOfferData.resourceAccId;
            const price = selectedOfferData.offerPrice;
            const resourceAmount = selectedOfferData.resourceValue;
            const validity = selectedOfferData.offerValidity;

            try {
                const purchaseResponse = await makePurchase(
                    accessToken,
                    msisdn,
                    selectedOfferData.offeringId,
                    paymentMode,
                    accountId,
                    price,
                    resourceAmount,
                    validity
                );
                // console.log('Purchase response:', purchaseResponse);
                $('#confirmationMessage').text(purchaseResponse.header.customerMessage || 'You will receive an SMS confirmation shortly or a prompt to enter your M-PESA PIN if you selected M-PESA as your mode of payment.');
                alert('Kindly wait as we process your request.');

                // call the external function to send purchase data
                const purchaseData = {
                    selectedOffer,
                    paymentMode,
                    price,
                    resourceAmount,
                    validity,
                    customerMessage: purchaseResponse.header.customerMessage || 'You will receive an SMS confirmation shortly.',
                };

                try {
                    await sendPurchaseData(purchaseData);
                } catch (error) {
                    // Handle the error if needed or display a user-friendly message
                    console.error('Failed to process purchase data:', error);
                }
                
                await spinnerDelay; // Ensure spinner is shown for 2 seconds
                currentStep++;
                showStep(currentStep);
                setTimeout(() => {
                    currentStep = 1;
                    showStep(currentStep);
                    $('#spinner').hide();  // Hide spinner after process
                    $('#nextStepButton').prop('disabled', false);
                }, 5000);
            } catch (error) {
                alert(`Failed to make purchase: ${error.message}`);
                console.error('Failed to make purchase:', error);
                $('#spinner').hide();
                $('#nextStepButton').prop('disabled', false);
                $('#errorMessage').text('Service currently unavailable, please try again later.').show(); // Display error message
            }
        }
    } finally {
        // Hide the spinner and re-enable the button regardless of the outcome
        $('#spinner').hide();
        $('#nextStepButton').prop('disabled', false);
    }
};





window.prevStep = function() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
};



