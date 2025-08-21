document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "job_seeker") {
    window.location.href = "SignIn.html";
    return;
  }

  // Load user profile data from database
  fetchUserProfile(userInfo.userId);

  // Personal Information Edit
  const editPersonalInfoBtn = document.getElementById("editPersonalInfo");
  const personalInfoForm = document.getElementById("personalInfoForm");
  const personalInfoInputs = personalInfoForm.querySelectorAll("input");
  const personalInfoActions = personalInfoForm.querySelector(".form-actions");
  const cancelPersonalEditBtn = document.getElementById("cancelPersonalEdit");

  // Professional Information Edit
  const editProfessionalInfoBtn = document.getElementById(
    "editProfessionalInfo"
  );
  const professionalInfoForm = document.getElementById("professionalInfoForm");
  const professionalInfoInputs = professionalInfoForm.querySelectorAll(
    "input, select, textarea"
  );
  const professionalInfoActions =
    professionalInfoForm.querySelector(".form-actions");
  const cancelProfessionalEditBtn = document.getElementById(
    "cancelProfessionalEdit"
  );

  // Education Section
  const addEducationBtn = document.getElementById("addEducation");
  const educationForm = document.getElementById("educationForm");
  const addEducationForm = document.getElementById("addEducationForm");
  const cancelEducationBtn = document.getElementById("cancelEducation");
  const educationList = document.getElementById("educationList");

  // Work Experience Section
  const addExperienceBtn = document.getElementById("addExperience");
  const experienceForm = document.getElementById("experienceForm");
  const addExperienceForm = document.getElementById("addExperienceForm");
  const cancelExperienceBtn = document.getElementById("cancelExperience");
  const experienceList = document.getElementById("experienceList");
  const currentJobCheckbox = document.getElementById("currentJob");
  const endDateInput = document.getElementById("endDate");

  // Resume Upload
  const uploadResumeBtn = document.getElementById("uploadResumeBtn");
  const resumeUpload = document.getElementById("resumeUpload");
  const resumeFileName = document.getElementById("resumeFileName");
  const resumeUploadDate = document.getElementById("resumeUploadDate");
  const viewResumeBtn = document.getElementById("viewResumeBtn");

  // Profile Image Upload
  const avatarContainer = document.querySelector(".avatar-container");
  const avatarUpload = document.getElementById("avatarUpload");
  const profileImage = document.getElementById("profileImage");

  // Personal Information Edit Functionality
  editPersonalInfoBtn.addEventListener("click", () => {
    toggleEditMode(personalInfoInputs, true);
    personalInfoActions.style.display = "flex";
    editPersonalInfoBtn.style.display = "none";
  });

  cancelPersonalEditBtn.addEventListener("click", () => {
    toggleEditMode(personalInfoInputs, false);
    personalInfoActions.style.display = "none";
    editPersonalInfoBtn.style.display = "flex";
    personalInfoForm.reset(); // Reset to original values
    fetchUserProfile(userInfo.userId); // Reload the original data
  });

  personalInfoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validatePersonalInfo()) {
      // Get form data
      const formData = new FormData(personalInfoForm);
      const updatedUserData = {
        userId: userInfo.userId,
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        location: formData.get("location"),
      };

      // Save to database
      savePersonalInfo(updatedUserData);
    }
  });

  // Professional Information Edit Functionality
  editProfessionalInfoBtn.addEventListener("click", () => {
    toggleEditMode(professionalInfoInputs, true);
    professionalInfoActions.style.display = "flex";
    editProfessionalInfoBtn.style.display = "none";
  });

  cancelProfessionalEditBtn.addEventListener("click", () => {
    toggleEditMode(professionalInfoInputs, false);
    professionalInfoActions.style.display = "none";
    editProfessionalInfoBtn.style.display = "flex";
    professionalInfoForm.reset(); // Reset to original values
    fetchUserProfile(userInfo.userId); // Reload the original data
  });

  professionalInfoForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateProfessionalInfo()) {
      // Get form data
      const formData = new FormData(professionalInfoForm);
      const professionalData = {
        userId: userInfo.userId,
        jobTitle: formData.get("jobTitle"),
        experience: formData.get("experience"),
        skills: formData.get("skills"),
        bio: formData.get("bio"),
      };

      // Save to database
      saveProfessionalInfo(professionalData);
    }
  });

  // Education Form Functionality
  addEducationBtn.addEventListener("click", () => {
    educationForm.style.display = "block";
    addEducationBtn.style.display = "none";
  });

  cancelEducationBtn.addEventListener("click", () => {
    educationForm.style.display = "none";
    addEducationBtn.style.display = "flex";
    addEducationForm.reset();
  });

  addEducationForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateEducationForm()) {
      const educationData = {
        userId: userInfo.userId,
        degree: document.getElementById("degree").value,
        institution: document.getElementById("institution").value,
        startYear: document.getElementById("startYear").value,
        endYear: document.getElementById("endYear").value,
      };

      // Save to database
      saveEducation(educationData);
    }
  });

  // Work Experience Form Functionality
  addExperienceBtn.addEventListener("click", () => {
    experienceForm.style.display = "block";
    addExperienceBtn.style.display = "none";
  });

  cancelExperienceBtn.addEventListener("click", () => {
    experienceForm.style.display = "none";
    addExperienceBtn.style.display = "flex";
    addExperienceForm.reset();
  });

  currentJobCheckbox.addEventListener("change", function () {
    endDateInput.disabled = this.checked;
    if (this.checked) {
      endDateInput.value = "";
    }
  });

  addExperienceForm.addEventListener("submit", (e) => {
    e.preventDefault();
    if (validateExperienceForm()) {
      const experienceData = {
        userId: userInfo.userId,
        position: document.getElementById("jobPosition").value,
        company: document.getElementById("company").value,
        startDate: document.getElementById("startDate").value,
        endDate: currentJobCheckbox.checked
          ? "Present"
          : document.getElementById("endDate").value,
        description: document.getElementById("jobDescription").value,
        currentJob: currentJobCheckbox.checked,
      };

      // Save to database
      saveExperience(experienceData);
    }
  });

  // Resume Upload Functionality
  uploadResumeBtn.addEventListener("click", () => {
    resumeUpload.click();
  });

  resumeUpload.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const allowedTypes = [".pdf", ".doc", ".docx"];
      const fileExtension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      if (allowedTypes.includes(fileExtension)) {
        // In a real app, you would upload the file to the server here
        // For now, we'll just update the UI
        resumeFileName.textContent = file.name;
        const today = new Date();
        resumeUploadDate.textContent = today.toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        viewResumeBtn.style.display = "inline-block";

        // Save resume info to database
        saveResume(userInfo.userId, file.name);

        alert("Resume uploaded successfully!");
      } else {
        alert("Please upload a PDF, DOC, or DOCX file.");
      }
    }
  });

  viewResumeBtn.addEventListener("click", () => {
    // In a real application, we would open the resume file from the server
    // For now, we'll simulate this with a modal

    // Create a modal to display a message
    const modal = document.createElement("div");
    modal.style.position = "fixed";
    modal.style.top = "0";
    modal.style.left = "0";
    modal.style.width = "100%";
    modal.style.height = "100%";
    modal.style.backgroundColor = "rgba(0, 0, 0, 0.5)";
    modal.style.display = "flex";
    modal.style.justifyContent = "center";
    modal.style.alignItems = "center";
    modal.style.zIndex = "1000";

    // Create modal content
    const modalContent = document.createElement("div");
    modalContent.style.backgroundColor = "white";
    modalContent.style.padding = "20px";
    modalContent.style.borderRadius = "5px";
    modalContent.style.maxWidth = "500px";
    modalContent.style.width = "80%";

    // Add resume name and message
    const resumeName = document.getElementById("resumeFileName").textContent;
    modalContent.innerHTML = `
      <h3>Resume: ${resumeName}</h3>
      <p>In a real application, this would open your resume file from the server.</p>
      <p>For this demo, we're just showing this message.</p>
      <button id="closeModalBtn" style="
        background-color: #0539a8;
        color: white;
        border: none;
        padding: 8px 15px;
        border-radius: 5px;
        cursor: pointer;
        margin-top: 15px;
      ">Close</button>
    `;

    // Add modal content to modal
    modal.appendChild(modalContent);

    // Add modal to body
    document.body.appendChild(modal);

    // Add close button functionality
    document.getElementById("closeModalBtn").addEventListener("click", () => {
      document.body.removeChild(modal);
    });

    // Close modal when clicking outside
    modal.addEventListener("click", (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  });

  // Profile Image Upload Functionality
  avatarContainer.addEventListener("click", () => {
    avatarUpload.click();
  });

  avatarUpload.addEventListener("change", function () {
    if (this.files && this.files[0]) {
      const file = this.files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        profileImage.src = e.target.result;

        // Save profile image to database
        saveProfileImage(userInfo.userId, e.target.result);

        alert("Profile picture updated successfully!");
      };

      reader.readAsDataURL(file);
    }
  });

  // Add event listeners for edit and delete buttons in education and experience items
  document.addEventListener("click", (e) => {
    if (e.target.closest(".edit-small-btn")) {
      // Handle edit functionality
      alert("Edit functionality to be implemented");
    } else if (e.target.closest(".delete-btn")) {
      // Handle delete functionality
      const item = e.target.closest(".education-item, .experience-item");
      const itemId = item.getAttribute("data-id");
      const itemType = item.classList.contains("education-item")
        ? "education"
        : "experience";

      if (confirm("Are you sure you want to delete this item?")) {
        deleteItem(itemType, itemId);
        item.remove();
        alert("Item deleted successfully!");
      }
    }
  });
});

// Function to fetch user profile data from database
async function fetchUserProfile(userId) {
  try {
    // Fetch personal info
    const response = await fetch(
      `http://localhost:3000/api/job-seekers/profile/${userId}`
    );

    if (response.ok) {
      const profileData = await response.json();

      // Set personal information
      document.getElementById("firstName").value = profileData.firstName || "";
      document.getElementById("lastName").value = profileData.lastName || "";
      document.getElementById("email").value = profileData.email || "";
      document.getElementById("phone").value = profileData.phone || "";
      document.getElementById("location").value = profileData.location || "";

      // Set professional information
      document.getElementById("jobTitle").value = profileData.jobTitle || "";
      document.getElementById("experience").value =
        profileData.experience || "0-1";
      document.getElementById("skills").value = profileData.skills || "";
      document.getElementById("bio").value = profileData.bio || "";

      // Set profile image if available
      if (profileData.profileImage) {
        document.getElementById("profileImage").src = profileData.profileImage;
      }

      // Set resume info if available
      if (profileData.resumeName) {
        document.getElementById("resumeFileName").textContent =
          profileData.resumeName;
        document.getElementById("resumeUploadDate").textContent = new Date(
          profileData.resumeDate
        ).toLocaleDateString("en-US", {
          month: "long",
          day: "numeric",
          year: "numeric",
        });
        document.getElementById("viewResumeBtn").style.display = "inline-block";
      }
    }

    // Fetch education items
    const educationResponse = await fetch(
      `http://localhost:3000/api/job-seekers/education/${userId}`
    );

    if (educationResponse.ok) {
      const educationData = await educationResponse.json();
      displayEducation(educationData);
    }

    // Fetch experience items
    const experienceResponse = await fetch(
      `http://localhost:3000/api/job-seekers/experience/${userId}`
    );

    if (experienceResponse.ok) {
      const experienceData = await experienceResponse.json();
      displayExperience(experienceData);
    }
  } catch (error) {
    console.error("Error fetching profile data:", error);
    alert("Failed to load profile data. Please try again later.");
  }
}

// Function to save personal info to database
async function savePersonalInfo(userData) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/profile",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      }
    );

    if (response.ok) {
      // Update UI
      toggleEditMode(
        document.querySelectorAll("#personalInfoForm input"),
        false
      );
      document.querySelector("#personalInfoForm .form-actions").style.display =
        "none";
      document.getElementById("editPersonalInfo").style.display = "flex";

      // Update user info in localStorage
      const userInfo = JSON.parse(localStorage.getItem("userInfo"));
      userInfo.firstName = userData.firstName;
      userInfo.lastName = userData.lastName;
      userInfo.email = userData.email;
      userInfo.phone = userData.phone;
      localStorage.setItem("userInfo", JSON.stringify(userInfo));

      alert("Personal information updated successfully!");
    } else {
      alert("Failed to update personal information. Please try again.");
    }
  } catch (error) {
    console.error("Error saving personal info:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Function to save professional info to database
async function saveProfessionalInfo(professionalData) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/professional",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(professionalData),
      }
    );

    if (response.ok) {
      // Update UI
      toggleEditMode(
        document.querySelectorAll(
          "#professionalInfoForm input, #professionalInfoForm select, #professionalInfoForm textarea"
        ),
        false
      );
      document.querySelector(
        "#professionalInfoForm .form-actions"
      ).style.display = "none";
      document.getElementById("editProfessionalInfo").style.display = "flex";

      alert("Professional information updated successfully!");
    } else {
      alert("Failed to update professional information. Please try again.");
    }
  } catch (error) {
    console.error("Error saving professional info:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Function to save education to database
async function saveEducation(educationData) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/education",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(educationData),
      }
    );

    if (response.ok) {
      const result = await response.json();

      // Create new education item in UI
      const educationItem = createEducationItem(
        result.education._id,
        educationData.degree,
        educationData.institution,
        educationData.startYear,
        educationData.endYear
      );

      document.getElementById("educationList").appendChild(educationItem);

      // Reset and hide form
      document.getElementById("addEducationForm").reset();
      document.getElementById("educationForm").style.display = "none";
      document.getElementById("addEducation").style.display = "flex";

      alert("Education added successfully!");
    } else {
      alert("Failed to add education. Please try again.");
    }
  } catch (error) {
    console.error("Error saving education:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Function to save experience to database
async function saveExperience(experienceData) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/experience",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(experienceData),
      }
    );

    if (response.ok) {
      const result = await response.json();

      // Create new experience item in UI
      const experienceItem = createExperienceItem(
        result.experience._id,
        experienceData.position,
        experienceData.company,
        formatDate(experienceData.startDate),
        experienceData.currentJob
          ? "Present"
          : formatDate(experienceData.endDate),
        experienceData.description
      );

      document.getElementById("experienceList").appendChild(experienceItem);

      // Reset and hide form
      document.getElementById("addExperienceForm").reset();
      document.getElementById("experienceForm").style.display = "none";
      document.getElementById("addExperience").style.display = "flex";

      alert("Work experience added successfully!");
    } else {
      alert("Failed to add work experience. Please try again.");
    }
  } catch (error) {
    console.error("Error saving experience:", error);
    alert("An error occurred. Please try again later.");
  }
}

// Function to save resume info to database
async function saveResume(userId, fileName) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/resume",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          resumeName: fileName,
          resumeDate: new Date(),
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to save resume info");
    }
  } catch (error) {
    console.error("Error saving resume info:", error);
  }
}

// Function to save profile image to database
async function saveProfileImage(userId, imageData) {
  try {
    const response = await fetch(
      "http://localhost:3000/api/job-seekers/profile-image",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: userId,
          profileImage: imageData,
        }),
      }
    );

    if (!response.ok) {
      console.error("Failed to save profile image");
    }
  } catch (error) {
    console.error("Error saving profile image:", error);
  }
}

// Function to delete education or experience item
async function deleteItem(itemType, itemId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/job-seekers/${itemType}/${itemId}`,
      {
        method: "DELETE",
      }
    );

    if (!response.ok) {
      console.error(`Failed to delete ${itemType}`);
      alert(`Failed to delete ${itemType}. Please try again.`);
    }
  } catch (error) {
    console.error(`Error deleting ${itemType}:`, error);
    alert("An error occurred. Please try again later.");
  }
}

// Function to display education items
function displayEducation(educationItems) {
  const educationList = document.getElementById("educationList");
  educationList.innerHTML = "";

  if (educationItems.length === 0) {
    educationList.innerHTML = "<p>No education information added yet.</p>";
    return;
  }

  educationItems.forEach((item) => {
    const educationItem = createEducationItem(
      item._id,
      item.degree,
      item.institution,
      item.startYear,
      item.endYear
    );

    educationList.appendChild(educationItem);
  });
}

// Function to display experience items
function displayExperience(experienceItems) {
  const experienceList = document.getElementById("experienceList");
  experienceList.innerHTML = "";

  if (experienceItems.length === 0) {
    experienceList.innerHTML = "<p>No work experience added yet.</p>";
    return;
  }

  experienceItems.forEach((item) => {
    const experienceItem = createExperienceItem(
      item._id,
      item.position,
      item.company,
      formatDate(item.startDate),
      item.currentJob ? "Present" : formatDate(item.endDate),
      item.description
    );

    experienceList.appendChild(experienceItem);
  });
}

// Helper Functions
function toggleEditMode(inputs, editable) {
  inputs.forEach((input) => {
    input.disabled = !editable;
  });
}

function validatePersonalInfo() {
  const firstName = document.getElementById("firstName").value.trim();
  const lastName = document.getElementById("lastName").value.trim();
  const email = document.getElementById("email").value.trim();
  const phone = document.getElementById("phone").value.trim();
  const location = document.getElementById("location").value.trim();

  if (!firstName || !lastName || !email || !phone || !location) {
    alert("Please fill out all fields.");
    return false;
  }

  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailPattern.test(email)) {
    alert("Please enter a valid email address.");
    return false;
  }

  const phonePattern = /^\d{10}$/;
  if (!phonePattern.test(phone)) {
    alert("Please enter a valid 10-digit phone number.");
    return false;
  }

  return true;
}

function validateProfessionalInfo() {
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const experience = document.getElementById("experience").value;
  const skills = document.getElementById("skills").value.trim();
  const bio = document.getElementById("bio").value.trim();

  if (!jobTitle || !experience || !skills || !bio) {
    alert("Please fill out all fields.");
    return false;
  }

  return true;
}

function validateEducationForm() {
  const degree = document.getElementById("degree").value.trim();
  const institution = document.getElementById("institution").value.trim();
  const startYear = document.getElementById("startYear").value;
  const endYear = document.getElementById("endYear").value;

  if (!degree || !institution || !startYear || !endYear) {
    alert("Please fill out all fields.");
    return false;
  }

  if (Number.parseInt(startYear) > Number.parseInt(endYear)) {
    alert("Start year cannot be greater than end year.");
    return false;
  }

  return true;
}

function validateExperienceForm() {
  const position = document.getElementById("jobPosition").value.trim();
  const company = document.getElementById("company").value.trim();
  const startDate = document.getElementById("startDate").value;
  const endDate = document.getElementById("endDate").value;
  const currentJob = document.getElementById("currentJob").checked;
  const description = document.getElementById("jobDescription").value.trim();

  if (
    !position ||
    !company ||
    !startDate ||
    (!endDate && !currentJob) ||
    !description
  ) {
    alert("Please fill out all required fields.");
    return false;
  }

  if (!currentJob && new Date(startDate) > new Date(endDate)) {
    alert("Start date cannot be after end date.");
    return false;
  }

  return true;
}

function createEducationItem(id, degree, institution, startYear, endYear) {
  const div = document.createElement("div");
  div.className = "education-item";
  div.setAttribute("data-id", id);
  div.innerHTML = `
    <div class="education-header">
      <h3>${degree}</h3>
      <div class="education-actions">
        <button class="edit-small-btn"><i class="fas fa-edit"></i></button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <p class="institution">${institution}</p>
    <p class="education-date">${startYear} - ${endYear}</p>
  `;
  return div;
}

function createExperienceItem(
  id,
  position,
  company,
  startDate,
  endDate,
  description
) {
  const div = document.createElement("div");
  div.className = "experience-item";
  div.setAttribute("data-id", id);
  div.innerHTML = `
    <div class="experience-header">
      <h3>${position}</h3>
      <div class="experience-actions">
        <button class="edit-small-btn"><i class="fas fa-edit"></i></button>
        <button class="delete-btn"><i class="fas fa-trash"></i></button>
      </div>
    </div>
    <p class="company">${company}</p>
    <p class="experience-date">${startDate} - ${endDate}</p>
    <p class="experience-description">${description}</p>
  `;
  return div;
}

function formatDate(dateString) {
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}
