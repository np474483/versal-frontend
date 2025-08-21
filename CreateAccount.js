function validateForm() {
  const firstName = document.getElementById("firstName").value;
  const lastName = document.getElementById("lastName").value;
  const email = document.getElementById("email").value;
  const phone = document.getElementById("phone").value;
  const password = document.getElementById("password").value;
  const userType = document.getElementById("userType").value;

  if (!firstName || !lastName || !email || !phone || !password || !userType) {
    alert("Please fill out all fields.");
    return false;
  }

  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phone)) {
    alert("Please enter a valid phone number.");
    return false;
  }

  const passwordRegex =
    /^(?=.*?[A-Z])(?=.*?[a-z])(?=.*?[0-9])(?=.*?[#?!@$%^&*-]).{8,}$/;
  if (!passwordRegex.test(password)) {
    alert(
      "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, one number, and one special character."
    );
    return false;
  }

  // If validation passes, submit the form data to the backend
  registerUser(firstName, lastName, email, phone, password, userType);
  return false; // Prevent default form submission
}

async function registerUser(
  firstName,
  lastName,
  email,
  phone,
  password,
  userType
) {
  try {
    // Show loading indicator
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Registering...";
    submitButton.disabled = true;

    // Send data to backend
    const response = await fetch("http://localhost:3000/api/users/register", {
      method: "post",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
        password,
        userType,
      }),
    });

    const data = await response.json();
    console.log(data); // Log the response for debugging

    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;

    if (response.ok) {
      // Registration successful
      alert("Registration successful! You can now log in.");

      // Redirect to login page
      window.location.href = "SignIn.html";
    } else {
      // Registration failed
      alert(`Registration failed: ${data.message}`);
    }
  } catch (error) {
    console.error("Error during registration:", error);
    alert("An error occurred during registration. Please try again later.")
    

    // Reset button state
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = "Register";
    submitButton.disabled = false;
  }
}
