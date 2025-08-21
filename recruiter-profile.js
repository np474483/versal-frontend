document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "recruiter") {
    window.location.href = "SignIn.html";
    return;
  }

  // Load company profile data
  loadCompanyProfile(userInfo.userId);

  // Logo upload functionality
  const uploadLogoBtn = document.getElementById("uploadLogoBtn");
  const logoInput = document.getElementById("logoInput");
  const companyLogoPreview = document.getElementById("companyLogoPreview");

  uploadLogoBtn.addEventListener("click", () => {
    logoInput.click();
  });

  logoInput.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        companyLogoPreview.src = e.target.result;

        // In a real application, you would upload the file to the server here
        // For now, we'll just update the preview
        showNotification("Logo updated. Save changes to apply.");
      };

      reader.readAsDataURL(file);
    }
  });

  // Form submission
  const companyForm = document.getElementById("companyForm");
  companyForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const formData = new FormData(companyForm);
        const profileData = {
          userId: userInfo.userId,
          companyName: formData.get("companyName"),
          industry: formData.get("industry"),
          companyEmail: formData.get("companyEmail"),
          companyPhone: formData.get("companyPhone"),
          companyLocation: formData.get("companyLocation"),
          companyDescription: formData.get("companyDescription"),
          companyWebsite: formData.get("companyWebsite") || "",
        };

        const response = await fetch(
          "http://localhost:3000/api/recruiters/profile",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(profileData),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to save profile");
        }

        const data = await response.json();

        // If we have a logo to upload
        const logoPreview = document.getElementById("companyLogoPreview");
        if (
          logoPreview.src &&
          !logoPreview.src.includes("company-placeholder.png")
        ) {
          // In a real application, you would upload the file to the server here
          // For now, we'll just simulate it
          await uploadLogo(userInfo.userId, logoPreview.src);
        }

        showNotification("Company information updated successfully!");
      } catch (error) {
        console.error("Error saving profile:", error);
        showNotification("Error saving profile. Please try again.", "error");
      }
    }
  });
});

async function loadCompanyProfile(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/profile/${userId}`
    );

    if (response.status === 404) {
      // Profile doesn't exist yet, that's okay
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load profile");
    }

    const profile = await response.json();

    // Populate form fields
    document.getElementById("companyName").value = profile.companyName || "";
    document.getElementById("industry").value = profile.industry || "";
    document.getElementById("companyEmail").value = profile.companyEmail || "";
    document.getElementById("companyPhone").value = profile.companyPhone || "";
    document.getElementById("companyLocation").value =
      profile.companyLocation || "";
    document.getElementById("companyDescription").value =
      profile.companyDescription || "";
    document.getElementById("companyWebsite").value =
      profile.companyWebsite || "";

    // Set logo if available
    if (profile.companyLogo) {
      document.getElementById("companyLogoPreview").src = profile.companyLogo;
    }
  } catch (error) {
    console.error("Error loading profile:", error);
    showNotification(
      "Error loading profile data. Please refresh the page.",
      "error"
    );
  }
}

async function uploadLogo(userId, logoDataUrl) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/profile/logo/${userId}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ logoUrl: logoDataUrl }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to upload logo");
    }

    return await response.json();
  } catch (error) {
    console.error("Error uploading logo:", error);
    throw error;
  }
}

function validateForm() {
  const companyName = document.getElementById("companyName").value.trim();
  const industry = document.getElementById("industry").value.trim();
  const email = document.getElementById("companyEmail").value.trim();
  const phone = document.getElementById("companyPhone").value.trim();
  const location = document.getElementById("companyLocation").value.trim();
  const description = document
    .getElementById("companyDescription")
    .value.trim();

  if (
    !companyName ||
    !industry ||
    !email ||
    !phone ||
    !location ||
    !description
  ) {
    showNotification("Please fill in all required fields", "error");
    return false;
  }

  // Email validation
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    showNotification("Please enter a valid email address", "error");
    return false;
  }

  return true;
}

function showNotification(message, type = "success") {
  // Create notification element
  const notification = document.createElement("div");
  notification.className = `notification ${type}`;
  notification.textContent = message;

  // Add to body
  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => {
    notification.classList.add("show");
  }, 10);

  // Remove after 3 seconds
  setTimeout(() => {
    notification.classList.remove("show");
    setTimeout(() => {
      notification.remove();
    }, 300);
  }, 3000);
}

// Add CSS for notifications
const style = document.createElement("style");
style.textContent = `
  .notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 20px;
    border-radius: 4px;
    color: white;
    font-size: 14px;
    z-index: 1000;
    transform: translateY(-20px);
    opacity: 0;
    transition: transform 0.3s, opacity 0.3s;
  }
  
  .notification.show {
    transform: translateY(0);
    opacity: 1;
  }
  
  .notification.success {
    background-color: #10b981;
  }
  
  .notification.error {
    background-color: #ef4444;
  }
  
  .logo-upload-container {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  #companyLogoPreview {
    width: 150px;
    height: 150px;
    object-fit: cover;
    border-radius: 8px;
    border: 1px solid #e5e7eb;
  }
`;
document.head.appendChild(style);
