let currentStep = 1;

const showStep = (step) => {
	$('.step').addClass('hidden'); // Hide all steps
	$(`.step[data-step=${step}]`).removeClass('hidden');
};



export default showStep;