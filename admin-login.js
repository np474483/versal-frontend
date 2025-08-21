document.addEventListener("DOMContentLoaded", () => {
  // Get the modal
  const modal = document.getElementById("adminLoginModal");

  // Get the button that opens the modal
  const btn = document.getElementById("adminLoginBtn");

  // Get the <span> element that closes the modal
  const span = document.getElementsByClassName("close")[0];

  // Get the admin login form
  const adminLoginForm = document.getElementById("adminLoginForm");

  // When the user clicks the button, open the modal
  btn.onclick = () => {
    modal.style.display = "block";
  };

  // When the user clicks on <span> (x), close the modal
  span.onclick = () => {
    modal.style.display = "none";
  };

  // When the user clicks anywhere outside of the modal, close it
  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };

  // Handle admin login form submission
  adminLoginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = document.getElementById("adminEmail").value;
    const password = document.getElementById("adminPassword").value;

    try {
      const response = await fetch("http://localhost:3000/api/admin/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Store admin info in localStorage
        localStorage.setItem("adminInfo", JSON.stringify(data.admin));

        // Redirect to admin dashboard
        window.location.href = "admin-dashboard.html";
      } else {
        alert(data.message || "Login failed. Please check your credentials.");
      }
    } catch (error) {
      console.error("Error during admin login:", error);
      alert("An error occurred during login. Please try again later.");
    }
  });
});
