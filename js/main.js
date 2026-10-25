// MSc Computer Science
// Web Technologies - Assessment 2 - Movie Database Application
// main.js
// https://www.w3schools.com/js/
// https://www.w3schools.com/js/js_htmldom_eventlistener.asp
// https://www.w3schools.com/jsref/met_document_getelementbyid.asp
// https://www.w3schools.com/js/js_object_constructors.asp

document.documentElement.classList.add('js');

const navToggle = document.querySelector('.navigation-toggle');
const siteNav = document.querySelector('#site-navigation');

navToggle.addEventListener('click', () => {
	const isOpen = navToggle.getAttribute('aria-expanded') === 'true';
	navToggle.setAttribute('aria-expanded', String(!isOpen));
	siteNav.classList.toggle('is-open');
});

// Find form, only run if form is subsequently found. Has to tie in with CSS to find correct selector.
const suggestForm = document.querySelector('#suggest-form');

if (suggestForm) {

// Grab other elements that will be required, similar to that of the above.	
	const reason = document.querySelector('#reason');
	const reasonCount = document.querySelector('#reason-count');
	const confirmation = document.querySelector('#confirmation');

// Character counter. Measures how many characters are typed into the box to set a feasible max length for the characters entered.
	reason.addEventListener('input', () => {
		reasonCount.textContent = `${reason.value.length} Of 300 Characters`;
	});

// Submission is caught so that page isn't reloaded but shows the results without requiring a full reload of the page.
	suggestForm.addEventListener('submit', (event) => {
		event.preventDefault();
// Confirm all details within the fields and show any errors that are present.
		const fields = suggestForm.querySelectorAll('input, select, textarea');
		let formIsValid = true;

		fields.forEach((field) => {
			const isValid = field.checkValidity();
			const errorBox= document.querySelector(`#${field.id}-error`);
			if (errorBox) {
				errorBox.textContent = field.validationMessage;
			}
			field.setAttribute('aria-invalid', !isValid);
			if (!isValid) {
				formIsValid = false;
			}
		});
// Stop of invalid. Otherwise run through and allow to complete displaying message.		
			if (!formIsValid) {
				return;
			}

			const name = document.querySelector('#name').value;
			suggestForm.hidden = true;
			confirmation.hidden = false;
			confirmation.textContent = `Thanks ${name}, We've Received Your Suggestion!`;
	});
}





