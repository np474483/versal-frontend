function showOtpInput() {
    if (validateForm()) {
        const otpInput = document.getElementById('otpInput');
        otpInput.style.display = 'block';
        document.getElementById('sendOtpButton').style.display = 'none'; // Hide Send OTP button
        document.getElementById('submitButton').style.display = 'block'; // Show Submit button
    }
}

function validateForm() {
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;

    if (!firstName || !lastName || !email || !phone) {
        alert('Please fill out all fields.');
        return false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        alert('Please enter a valid email address.');
        return false;
    }

    const phonePattern = /^\d{10}$/;
    if (!phonePattern.test(phone)) {
        alert('Please enter a valid phone number.');
        return false;
    }

    return true;
}

function enableSubmitButton() {
    const otp = document.getElementById('otp').value;
    const submitButton = document.getElementById('submitButton');
    if (otp) {
        submitButton.disabled = false; // Enable Submit button if OTP is filled
    } else {
        submitButton.disabled = true; // Disable Submit button if OTP is not filled
    }
}
