document.addEventListener("DOMContentLoaded", () => {
  // Check if admin is logged in
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  if (!adminInfo) {
    // Instead of redirecting, we'll just show a message and fetch users anyway
    console.warn(
      "Admin info not found in localStorage. Some features may be limited."
    );
  }

  // Fetch all users
  fetchUsers();

  // Set up modal
  const modal = document.getElementById("userProfileModal");
  const closeBtn = document.querySelector(".close");
  const closeModalBtn = document.getElementById("closeModalBtn");

  closeBtn.onclick = () => {
    modal.style.display = "none";
  };

  closeModalBtn.onclick = () => {
    modal.style.display = "none";
  };

  window.onclick = (event) => {
    if (event.target == modal) {
      modal.style.display = "none";
    }
  };
});

async function fetchUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/users");
    const users = await response.json();

    displayUsers(users);
  } catch (error) {
    console.error("Error fetching users:", error);
    alert("Failed to load users. Please try again later.");
  }
}

function displayUsers(users) {
  const tableBody = document.getElementById("usersTableBody");
  tableBody.innerHTML = "";

  users.forEach((user) => {
    const row = document.createElement("tr");

    // Check if user is active (we'll add this field to the user model)
    const isActive = user.isActive !== false; // Default to true if not set

    row.innerHTML = `
      <td>${user.firstName} ${user.lastName}</td>
      <td>${user.email}</td>
      <td>${user.phone}</td>
      <td>${formatUserType(user.userType)}</td>
      <td><span class="status-badge ${
        isActive ? "status-active" : "status-inactive"
      }">${isActive ? "Active" : "Inactive"}</span></td>
      <td>
        <button class="table-action-btn view-btn" onclick="viewUserProfile('${
          user._id
        }', '${user.userType}')">View Profile</button>
        <button class="table-action-btn delete-btn" onclick="deleteUser('${
          user._id
        }')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function formatUserType(userType) {
  switch (userType) {
    case "job_seeker":
      return "Job Seeker";
    case "recruiter":
      return "Recruiter";
    case "admin":
      return "Admin";
    default:
      return userType;
  }
}

async function viewUserProfile(userId, userType) {
  try {
    let profileData = {};

    // Fetch basic user data
    const userResponse = await fetch(
      `http://localhost:3000/api/admin/users/${userId}`
    );
    if (!userResponse.ok) {
      throw new Error("Failed to fetch user data");
    }
    const userData = await userResponse.json();

    // Fetch additional profile data based on user type
    if (userType === "job_seeker") {
      const profileResponse = await fetch(
        `http://localhost:3000/api/job-seekers/profile/${userId}`
      );
      if (profileResponse.ok) {
        const jobSeekerProfile = await profileResponse.json();
        profileData = { ...userData, ...jobSeekerProfile };

        // Fetch education
        const educationResponse = await fetch(
          `http://localhost:3000/api/job-seekers/education/${userId}`
        );
        if (educationResponse.ok) {
          profileData.education = await educationResponse.json();
        }

        // Fetch experience
        const experienceResponse = await fetch(
          `http://localhost:3000/api/job-seekers/experience/${userId}`
        );
        if (experienceResponse.ok) {
          profileData.experience = await experienceResponse.json();
        }
      }
    } else if (userType === "recruiter") {
      const profileResponse = await fetch(
        `http://localhost:3000/api/recruiters/profile/${userId}`
      );
      if (profileResponse.ok) {
        const recruiterProfile = await profileResponse.json();
        profileData = { ...userData, ...recruiterProfile };

        // Fetch jobs posted by this recruiter
        const jobsResponse = await fetch(
          `http://localhost:3000/api/recruiters/jobs/${userId}`
        );
        if (jobsResponse.ok) {
          profileData.jobs = await jobsResponse.json();
        }
      }
    }

    // Display the profile data
    displayUserProfile(profileData, userType);

    // Show the modal
    document.getElementById("userProfileModal").style.display = "block";

    // Set up deactivate button
    const deactivateBtn = document.getElementById("deactivateUserBtn");
    deactivateBtn.onclick = () =>
      deactivateUser(userId, userData.isActive !== false);

    // Update button text based on current status
    deactivateBtn.textContent =
      userData.isActive !== false ? "Deactivate Account" : "Activate Account";
  } catch (error) {
    console.error("Error fetching user profile:", error);
    alert("Failed to load user profile. Please try again later.");
  }
}

function displayUserProfile(profileData, userType) {
  const profileContent = document.getElementById("userProfileContent");

  // Basic user info section
  let html = `
    <div class="profile-section">
      <h3>Basic Information</h3>
      <div class="profile-info">
        <p><strong>Name:</strong> ${profileData.firstName} ${
    profileData.lastName
  }</p>
        <p><strong>Email:</strong> ${profileData.email}</p>
        <p><strong>Phone:</strong> ${profileData.phone}</p>
        <p><strong>User Type:</strong> ${formatUserType(userType)}</p>
        <p><strong>Status:</strong> <span class="${
          profileData.isActive !== false ? "text-success" : "text-danger"
        }">${profileData.isActive !== false ? "Active" : "Inactive"}</span></p>
      </div>
    </div>
  `;

  // Additional sections based on user type
  if (userType === "job_seeker") {
    // Job seeker profile
    html += `
      <div class="profile-section">
        <h3>Professional Information</h3>
        <div class="profile-info">
          <p><strong>Job Title:</strong> ${
            profileData.jobTitle || "Not specified"
          }</p>
          <p><strong>Experience:</strong> ${
            profileData.experience || "Not specified"
          }</p>
          <p><strong>Skills:</strong> ${
            profileData.skills || "Not specified"
          }</p>
          <p><strong>Location:</strong> ${
            profileData.location || "Not specified"
          }</p>
        </div>
      </div>
    `;

    // Education section
    if (profileData.education && profileData.education.length > 0) {
      html += `
        <div class="profile-section">
          <h3>Education</h3>
          <div class="profile-info">
      `;

      profileData.education.forEach((edu) => {
        html += `
          <div class="education-item">
            <p><strong>${edu.degree}</strong></p>
            <p>${edu.institution}</p>
            <p>${edu.startYear} - ${edu.endYear}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // Experience section
    if (profileData.experience && profileData.experience.length > 0) {
      html += `
        <div class="profile-section">
          <h3>Work Experience</h3>
          <div class="profile-info">
      `;

      profileData.experience.forEach((exp) => {
        html += `
          <div class="experience-item">
            <p><strong>${exp.position}</strong></p>
            <p>${exp.company}</p>
            <p>${exp.startDate} - ${
          exp.currentJob ? "Present" : exp.endDate
        }</p>
            <p>${exp.description}</p>
          </div>
        `;
      });

      html += `
          </div>
        </div>
      `;
    }

    // Resume section
    if (profileData.resumeName) {
      html += `
        <div class="profile-section">
          <h3>Resume</h3>
          <div class="profile-info">
            <p><strong>Resume:</strong> ${profileData.resumeName}</p>
            <p><strong>Uploaded on:</strong> ${new Date(
              profileData.resumeDate
            ).toLocaleDateString()}</p>
          </div>
        </div>
      `;
    }
  } else if (userType === "recruiter") {
    // Recruiter profile
    html += `
      <div class="profile-section">
        <h3>Company Information</h3>
        <div class="profile-info">
          <p><strong>Company Name:</strong> ${
            profileData.companyName || "Not specified"
          }</p>
          <p><strong>Industry:</strong> ${
            profileData.industry || "Not specified"
          }</p>
          <p><strong>Company Email:</strong> ${
            profileData.companyEmail || "Not specified"
          }</p>
          <p><strong>Company Phone:</strong> ${
            profileData.companyPhone || "Not specified"
          }</p>
          <p><strong>Location:</strong> ${
            profileData.companyLocation || "Not specified"
          }</p>
          <p><strong>Website:</strong> ${
            profileData.companyWebsite || "Not specified"
          }</p>
        </div>
      </div>
    `;

    // Company description
    if (profileData.companyDescription) {
      html += `
        <div class="profile-section">
          <h3>Company Description</h3>
          <div class="profile-info">
            <p>${profileData.companyDescription}</p>
          </div>
        </div>
      `;
    }

    // Jobs posted
    if (profileData.jobs && profileData.jobs.length > 0) {
      html += `
        <div class="profile-section">
          <h3>Jobs Posted (${profileData.jobs.length})</h3>
          <div class="profile-info">
            <ul class="job-list">
      `;

      profileData.jobs.forEach((job) => {
        html += `
          <li>
            <strong>${job.title}</strong> - ${job.company}
            <p>${job.location} | ${formatJobType(job.jobType)} | ${formatStatus(
          job.status
        )}</p>
            <button class="small-btn view-btn" onclick="viewJobDetails('${
              job._id
            }')">View Job</button>
          </li>
        `;
      });

      html += `
            </ul>
          </div>
        </div>
      `;
    }
  }

  profileContent.innerHTML = html;
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function deactivateUser(userId, currentStatus) {
  const action = currentStatus ? "deactivate" : "activate";

  if (confirm(`Are you sure you want to ${action} this user account?`)) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}/status`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isActive: !currentStatus }),
        }
      );

      if (response.ok) {
        alert(`User account ${action}d successfully`);

        // Update the button text
        const deactivateBtn = document.getElementById("deactivateUserBtn");
        deactivateBtn.textContent = currentStatus
          ? "Activate Account"
          : "Deactivate Account";

        // Update the status text in the modal
        const statusSpan = document.querySelector(
          ".profile-info .text-success, .profile-info .text-danger"
        );
        if (statusSpan) {
          statusSpan.className = currentStatus ? "text-danger" : "text-success";
          statusSpan.textContent = currentStatus ? "Inactive" : "Active";
        }

        // Refresh the user list
        fetchUsers();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing user:`, error);
      alert(`An error occurred while ${action}ing the user account`);
    }
  }
}

async function deleteUser(userId) {
  if (
    confirm(
      "Are you sure you want to delete this user? This action cannot be undone."
    )
  ) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/users/${userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("User deleted successfully");
        // Refresh the user list
        fetchUsers();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("An error occurred while deleting the user");
    }
  }
}

function searchUsers() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const userTypeFilter = document.getElementById("userTypeFilter").value;

  const rows = document.querySelectorAll("#usersTableBody tr");

  rows.forEach((row) => {
    const name = row.cells[0].textContent.toLowerCase();
    const email = row.cells[1].textContent.toLowerCase();
    const userType = row.cells[3].textContent.toLowerCase();

    const matchesSearch =
      name.includes(searchTerm) || email.includes(searchTerm);
    const matchesFilter =
      userTypeFilter === "all" ||
      userType.includes(userTypeFilter.replace("_", " "));

    if (matchesSearch && matchesFilter) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function filterUsers() {
  searchUsers(); // Reuse the search function which also handles filtering
}

function viewJobDetails(jobId) {
  window.open(`job-details.html?id=${jobId}`, "_blank");
}
