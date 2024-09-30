import makePurchase from "./makePurchase.js";
import getAccessToken from "./getAccessToken.js";
import fetchOffers from "./fetchOffers.js";
import showStep from "./showStep.js";
import updateOfferSelection from "./updateOfferSelection.js";
import sendPurchaseData from "./sendPurchaseData.js";
import { hardCodedOffers } from "./hardcodedOffers.js";
import mergeOffersWithoutDuplicates from "./mergeOffers.js";

let currentStep = 1;
let offersData = null;
let accessToken = null;
let msisdn = null;
let allOffers = [];
let requestInProgress = false; // Flag to prevent duplicate requests

$(document).ready(function() {
    showStep(currentStep);
    window.nextStep = nextStep;
    window.prevStep = prevStep;
    window.selectPaymentMethod = selectPaymentMethod;

    $('#offerContainer').on('click', '.offer-card', function() {
        if (currentStep === 2) {
            // Show the spinner and disable the offer cards
            $('#spinner').show();
            // $('.offer-card').css('pointer-events', 'none'); // Disable clicking on other cards
    
            const selectedOffer = $(this).find('input[name="dataOffer"]').val();
            $('input[name="dataOffer"][value="' + selectedOffer + '"]').prop('checked', true);
    
            // Simulate a delay to allow the spinner to show (if needed)
            setTimeout(function() {
                // Check if the current step is still 2 before transitioning to the next step
                if (currentStep === 2) {
                    currentStep++;
                    showStep(currentStep);
                }
    
                // Hide the spinner and re-enable interaction
                $('#spinner').hide();
                $('.offer-card').css('pointer-events', 'auto'); // Enable clicking again
            }, 1000); // Adjust delay as needed
        }
    });
    
});

window.nextStep = async function() {
    if (requestInProgress) return; // Prevent multiple requests
    requestInProgress = true;

    // Show the spinner and disable the button to prevent multiple clicks
    $('#spinner').show();
    $('#nextStepButton').prop('disabled', true);
    $('#errorMessage').hide(); // Hide the error message if it was shown before

    // Ensure the spinner is visible for at least 2 seconds
    const spinnerDelay = new Promise((resolve) => setTimeout(resolve, 1000));

    try {
        if (currentStep === 1) {
            let phoneNumber = $('#phoneNumber').val();

            if (!phoneNumber) {
                alert('Please input your phone number.');
                requestInProgress = false;
                return;
            }

            // Clean up and format the phone number
            phoneNumber = phoneNumber.replace(/\D/g, '');
            if (!phoneNumber.startsWith('254')) {
                if (phoneNumber.startsWith('0')) phoneNumber = phoneNumber.substring(1);
                phoneNumber = '254' + phoneNumber;
            }

            if (phoneNumber.length < 10) {
                alert('Phone number is too short. Please enter a valid number.');
                requestInProgress = false;
                return;
            }

            msisdn = phoneNumber;

            const username = 'd3wo7feC8z3VRB6ASQva7nvFczAkDaDG8hUGGgAaGGkqZjaG';
            const password = 'bWkk4miPhESLnfHS3MmZ4nVV99iVKWzWRFoBhTzozREuwn8LOQrWeFhnWWTLP6kz';

            try {
                accessToken = await getAccessToken(username, password);
                const offers = await fetchOffers(accessToken, msisdn);
                offersData = offers.lineItem.characteristicsValue;
                allOffers = mergeOffersWithoutDuplicates(offersData, hardCodedOffers);
                await spinnerDelay; // Ensure spinner is shown for 2 seconds
                updateOfferSelection(allOffers);
                currentStep++;
                showStep(currentStep);
            } catch (error) {
                $('#errorMessage').text('Service currently unavailable, please try again later.').show();
            }
        } else if (currentStep === 2) {
            const selectedOffer = $('input[name="dataOffer"]:checked').val();
            if (!selectedOffer) {
                alert('Please select an offer.');
                requestInProgress = false;
                return;
            }

            await spinnerDelay; // Ensure spinner is shown for 2 seconds
            currentStep++;
            showStep(currentStep);
        } else if (currentStep === 3) {
            const selectedOffer = $('input[name="dataOffer"]:checked').val();
            const selectedOfferData = allOffers.find(offer => offer.offerName === selectedOffer);

            if (!selectedOfferData) {
                alert('Selected offer details not found. Please try again.');
                requestInProgress = false;
                return;
            }

            const paymentMode = $('input[name="paymentMethod"]:checked').val();
            if (!paymentMode) {
                alert('Please select a payment method.');
                requestInProgress = false;
                return;
            }

            try {
                const purchaseResponse = await makePurchase(
                    accessToken,
                    msisdn,
                    selectedOfferData.offeringId,
                    paymentMode,
                    selectedOfferData.resourceAccId,
                    selectedOfferData.offerPrice,
                    selectedOfferData.resourceValue,
                    selectedOfferData.offerValidity
                );
                $('#confirmationMessage').text(purchaseResponse.header.customerMessage || 'You will receive an SMS confirmation shortly or a prompt to enter your M-PESA PIN if you selected M-PESA as your mode of payment.');
                //alert('Kindly wait as we process your request.');
                
                await sendPurchaseData({
                    selectedOffer,
                    paymentMode,
                    price: selectedOfferData.offerPrice,
                    resourceAmount: selectedOfferData.resourceValue,
                    validity: selectedOfferData.offerValidity,
                    customerMessage: purchaseResponse.header.customerMessage || 'You will receive an SMS confirmation shortly.',
                    source: "Artcaffe Main Menu", 
                });
                
                await spinnerDelay;
                currentStep++;
                showStep(currentStep);
                setTimeout(() => {
                    currentStep = 1;
                    showStep(currentStep);
                }, 5000);
            } catch (error) {
                $('#errorMessage').text('Service currently unavailable, please try again later.').show();
            }
        }
    } finally {
        $('#spinner').hide();
        $('#nextStepButton').prop('disabled', false);
        requestInProgress = false; // Reset the flag after completion
    }
};

window.prevStep = function() {
    if (currentStep > 1) {
        currentStep--;
        showStep(currentStep);
    }
};

function selectPaymentMethod(paymentMethod) {
    $('input[name="paymentMethod"][value="' + paymentMethod + '"]').prop('checked', true);
    $('#spinner').show();
    $('#nextStepButton').prop('disabled', true);
    $('#errorMessage').hide();

    // Prevent duplicate requests by checking the flag
    if (!requestInProgress) {
        setTimeout(nextStep, 1000);
    }
}
