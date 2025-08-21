function validateSignInForm() {
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;

  if (!email || !password) {
    alert("Please fill out all fields.");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  // If validation passes, submit the form data to the backend
  loginUser(email, password);
  return false; // Prevent default form submission
}

async function loginUser(email, password) {
  try {
    // Show loading indicator
    const submitButton = document.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.textContent;
    submitButton.textContent = "Signing In...";
    submitButton.disabled = true;

    // Send data to backend
    const response = await fetch("http://localhost:3000/api/users/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    });

    const data = await response.json();

    // Reset button state
    submitButton.textContent = originalButtonText;
    submitButton.disabled = false;

    if (response.ok) {
      // Login successful
      // Store user data in localStorage for session management
      localStorage.setItem("userInfo", JSON.stringify(data));

      // Redirect based on user type
      if (data.userType === "job_seeker") {
        window.location.href = "job-seeker-dashboard.html";
      } else if (data.userType === "recruiter") {
        window.location.href = "recruiter-dashboard.html";
      } else if (data.userType === "admin") {
        window.location.href = "admin-dashboard.html";
      }
    } else {
      // Login failed
      alert(`Login failed: ${data.message}`);
    }
  } catch (error) {
    console.error("Error during login:", error);
    alert("An error occurred during login. Please try again later.");

    // Reset button state
    const submitButton = document.querySelector('button[type="submit"]');
    submitButton.textContent = "Sign In";
    submitButton.disabled = false;
  }
}
