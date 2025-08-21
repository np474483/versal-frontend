document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "recruiter") {
    window.location.href = "SignIn.html";
    return;
  }

  // Set up modals
  setupModals();

  // Get job ID from URL if present
  const urlParams = new URLSearchParams(window.location.search);
  const jobId = urlParams.get("job");

  if (jobId) {
    // Fetch applications for specific job
    fetchApplicationsForJob(jobId);
  } else {
    // Fetch all applications for this recruiter
    fetchAllApplications(userInfo.userId);
  }

  // Set up filter event listeners
  const jobFilter = document.getElementById("jobFilter");
  const statusFilter = document.getElementById("statusFilter");

  if (jobFilter) jobFilter.addEventListener("change", filterApplications);
  if (statusFilter) statusFilter.addEventListener("change", filterApplications);
});

function setupModals() {
  // Resume Modal
  const resumeModal = document.getElementById("resumeModal");
  const resumeCloseBtn = resumeModal.querySelector(".close");
  const closeResumeBtn = document.getElementById("closeResumeBtn");

  resumeCloseBtn.onclick = () => {
    resumeModal.style.display = "none";
  };

  closeResumeBtn.onclick = () => {
    resumeModal.style.display = "none";
  };

  // Feedback Modal
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackCloseBtn = feedbackModal.querySelector(".close");
  const closeFeedbackBtn = document.getElementById("closeFeedbackBtn");
  const feedbackForm = document.getElementById("feedbackForm");

  feedbackCloseBtn.onclick = () => {
    feedbackModal.style.display = "none";
  };

  closeFeedbackBtn.onclick = () => {
    feedbackModal.style.display = "none";
  };

  feedbackForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const feedback = document.getElementById("feedbackMessage").value;
    const applicationId = feedbackForm.getAttribute("data-application-id");

    if (feedback.trim() === "") {
      alert("Please enter feedback before submitting.");
      return;
    }

    sendFeedback(applicationId, feedback);
  });

  // Close modals when clicking outside
  window.onclick = (event) => {
    if (event.target === resumeModal) {
      resumeModal.style.display = "none";
    }
    if (event.target === feedbackModal) {
      feedbackModal.style.display = "none";
    }
  };
}

async function fetchApplicationsForJob(jobId) {
  try {
    // Show loading message
    const loadingElement = document.getElementById("loadingApplications");
    loadingElement.style.display = "block";

    // Hide applications container
    document.getElementById("applicationsContainer").style.display = "none";

    // Fetch job details to display job title
    const jobResponse = await fetch(`http://localhost:3000/api/jobs/${jobId}`);

    if (!jobResponse.ok) {
      throw new Error("Failed to fetch job details");
    }

    const job = await jobResponse.json();

    // Update page title
    document.querySelector("h1").textContent = `Applications for: ${job.title}`;

    // Fetch applications for this job
    const applicationsResponse = await fetch(
      `http://localhost:3000/api/recruiters/applications/job/${jobId}`
    );

    // Hide loading message
    loadingElement.style.display = "none";

    if (!applicationsResponse.ok) {
      throw new Error("Failed to fetch applications");
    }

    const applications = await applicationsResponse.json();

    // Display applications
    displayApplications(applications, job);
  } catch (error) {
    console.error("Error fetching applications:", error);
    document.getElementById("loadingApplications").style.display = "none";
    document.getElementById("applicationsContainer").innerHTML = `
      <div class="error-message">
        <p>Failed to load applications. Please try again later.</p>
      </div>
    `;
  }
}

async function fetchAllApplications(recruiterId) {
  try {
    // Show loading message
    const loadingElement = document.getElementById("loadingApplications");
    loadingElement.style.display = "block";

    // Hide applications container
    document.getElementById("applicationsContainer").style.display = "none";

    // Fetch all applications for this recruiter
    const response = await fetch(
      `http://localhost:3000/api/recruiters/applications/${recruiterId}`
    );

    // Hide loading message
    loadingElement.style.display = "none";

    if (!response.ok) {
      throw new Error("Failed to fetch applications");
    }

    const applications = await response.json();

    // Fetch all jobs posted by this recruiter for the filter dropdown
    const jobsResponse = await fetch(
      `http://localhost:3000/api/recruiters/jobs/${recruiterId}`
    );

    if (!jobsResponse.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await jobsResponse.json();

    // Populate job filter dropdown
    populateJobFilter(jobs);

    // Display applications
    displayApplications(applications);
  } catch (error) {
    console.error("Error fetching applications:", error);
    document.getElementById("loadingApplications").style.display = "none";
    document.getElementById("applicationsContainer").innerHTML = `
      <div class="error-message">
        <p>Failed to load applications. Please try again later.</p>
      </div>
    `;
  }
}

function populateJobFilter(jobs) {
  const jobFilter = document.getElementById("jobFilter");

  // Clear existing options except "All Jobs"
  while (jobFilter.options.length > 1) {
    jobFilter.remove(1);
  }

  // Add job options to filter
  jobs.forEach((job) => {
    const option = document.createElement("option");
    option.value = job._id;
    option.textContent = job.title;
    jobFilter.appendChild(option);
  });
}

function displayApplications(applications, specificJob = null) {
  const container = document.getElementById("applicationsContainer");
  container.innerHTML = "";
  container.style.display = "block";

  if (applications.length === 0) {
    document.getElementById("noApplicationsMessage").style.display = "block";
    return;
  }

  document.getElementById("noApplicationsMessage").style.display = "none";

  applications.forEach((application) => {
    // Get job details
    const job =
      specificJob ||
      (application.jobId && typeof application.jobId === "object"
        ? application.jobId
        : { title: "Unknown Job" });

    // Get applicant details
    const applicant = application.jobSeekerId || {};
    const applicantName =
      `${applicant.firstName || ""} ${applicant.lastName || ""}`.trim() ||
      "Unknown Applicant";

    // Format date
    const appliedDate = new Date(application.appliedDate).toLocaleDateString();

    // Create application card
    const card = document.createElement("div");
    card.className = "application-card";
    card.setAttribute("data-job", job._id || "");
    card.setAttribute("data-status", application.status);

    // Get applicant ID
    const applicantId = applicant._id || applicant;

    card.innerHTML = `
      <div class="applicant-info">
        <div class="applicant-header">
         

          <div class="applicant-details">
            <h3>${applicantName}</h3>
            <p class="applicant-email">${
              applicant.email || "No email provided"
            }</p>
            <p class="applicant-phone">${
              applicant.phone || "No phone provided"
            }</p>
          </div>
        </div>
      </div>
      <div class="application-details">
        <p class="job-applied">Applied for: <strong>${job.title}</strong></p>
        <p class="application-date">Applied on: ${appliedDate}</p>
        <p class="application-status">Status: <span class="status-badge ${
          application.status
        }">${formatStatus(application.status)}</span></p>
      </div>
      <div class="application-actions">
        <button class="action-btn view" onclick="viewResume('${
          application._id
        }', '${applicantId}')">View Resume</button>
        <button class="action-btn feedback" onclick="provideFeedback('${
          application._id
        }')">Send Feedback</button>
        <div class="status-actions">
          <button class="action-btn shortlist" onclick="updateStatus('${
            application._id
          }', 'shortlisted', this)" ${
      application.status === "shortlisted" ? "disabled" : ""
    }>Shortlist</button>
          <button class="action-btn reject" onclick="updateStatus('${
            application._id
          }', 'rejected', this)" ${
      application.status === "rejected" ? "disabled" : ""
    }>Reject</button>
        </div>
      </div>
    `;

    container.appendChild(card);
  });
}

async function viewResume(applicationId, jobSeekerId) {
  try {
    // Show resume modal
    const resumeModal = document.getElementById("resumeModal");
    const resumeContent = document.getElementById("resumeContent");

    // Show loading message
    resumeContent.innerHTML = `<p>Loading resume...</p>`;
    resumeModal.style.display = "block";

    // Extract the ID if jobSeekerId is an object
    const seekerId =
      typeof jobSeekerId === "object" ? jobSeekerId._id : jobSeekerId;

    // Fetch job seeker profile
    const response = await fetch(
      `http://localhost:3000/api/job-seekers/profile/${seekerId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch applicant profile");
    }

    const profile = await response.json();

    // Fetch education information
    const educationResponse = await fetch(
      `http://localhost:3000/api/job-seekers/education/${seekerId}`
    );
    let education = [];

    if (educationResponse.ok) {
      education = await educationResponse.json();
    }

    // Fetch experience information
    const experienceResponse = await fetch(
      `http://localhost:3000/api/job-seekers/experience/${seekerId}`
    );
    let experience = [];

    if (experienceResponse.ok) {
      experience = await experienceResponse.json();
    }

    // Display resume
    resumeContent.innerHTML = `
      <div class="resume-preview">
        <div class="resume-header">
          <div class="resume-profile-image">
            <img src="${
              profile.profileImage || "/placeholder.svg?height=100&width=100"
            }" alt="${profile.firstName} ${profile.lastName}" 
                 onerror="this.src='/placeholder.svg?height=100&width=100'">
          </div>
          <div class="resume-profile-info">
            <h3>${profile.firstName} ${profile.lastName}</h3>
            <p>${profile.email}</p>
            <p>${profile.phone}</p>
            <p>${profile.location || "Location not specified"}</p>
          </div>
        </div>
        
        <div class="resume-section">
          <h4>Professional Summary</h4>
          <p>${profile.bio || "No professional summary provided."}</p>
        </div>
        
        <div class="resume-section">
          <h4>Skills</h4>
          <p>${profile.skills || "No skills listed."}</p>
        </div>
        
        <div class="resume-section">
          <h4>Experience</h4>
          ${
            experience.length > 0
              ? experience
                  .map(
                    (exp) => `
              <div class="experience-item">
                <p><strong>${exp.position}</strong> at ${exp.company}</p>
                <p>${formatDate(exp.startDate)} - ${
                      exp.currentJob ? "Present" : formatDate(exp.endDate)
                    }</p>
                <p>${exp.description}</p>
              </div>
            `
                  )
                  .join("")
              : "<p>No experience listed.</p>"
          }
        </div>
        
        <div class="resume-section">
          <h4>Education</h4>
          ${
            education.length > 0
              ? education
                  .map(
                    (edu) => `
              <div class="education-item">
                <p><strong>${edu.degree}</strong> from ${edu.institution}</p>
                <p>${edu.startYear} - ${edu.endYear}</p>
              </div>
            `
                  )
                  .join("")
              : "<p>No education listed.</p>"
          }
        </div>
        
        ${
          profile.resumeName
            ? `<div class="resume-section">
            <h4>Attached Resume</h4>
            <p><strong>File:</strong> ${profile.resumeName}</p>
            <p><strong>Uploaded on:</strong> ${new Date(
              profile.resumeDate
            ).toLocaleDateString()}</p>
          </div>`
            : ""
        }
      </div>
    `;
  } catch (error) {
    console.error("Error fetching resume:", error);
    document.getElementById("resumeContent").innerHTML = `
      <div class="error-message">
        <p>Failed to load resume. Please try again later.</p>
      </div>
    `;
  }
}

function provideFeedback(applicationId) {
  // Show feedback modal
  const feedbackModal = document.getElementById("feedbackModal");
  const feedbackForm = document.getElementById("feedbackForm");

  // Clear previous feedback
  document.getElementById("feedbackMessage").value = "";

  // Set application ID as data attribute
  feedbackForm.setAttribute("data-application-id", applicationId);

  // Show modal
  feedbackModal.style.display = "block";
}

async function sendFeedback(applicationId, feedback) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/applications/${applicationId}/feedback`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ feedback }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to send feedback");
    }

    // Hide feedback modal
    document.getElementById("feedbackModal").style.display = "none";

    // Show success message
    alert("Feedback sent successfully!");
  } catch (error) {
    console.error("Error sending feedback:", error);
    alert("Failed to send feedback. Please try again later.");
  }
}

async function updateStatus(applicationId, status, button) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/applications/${applicationId}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      }
    );

    if (!response.ok) {
      throw new Error("Failed to update status");
    }

    // Update UI
    const card = button.closest(".application-card");
    const statusSpan = card.querySelector(".status-badge");

    // Update status badge
    statusSpan.className = `status-badge ${status}`;
    statusSpan.textContent = formatStatus(status);

    // Update data attribute
    card.setAttribute("data-status", status);

    // Update buttons
    const shortlistBtn = card.querySelector(".shortlist");
    const rejectBtn = card.querySelector(".reject");

    shortlistBtn.disabled = status === "shortlisted";
    rejectBtn.disabled = status === "rejected";

    // Show success message
    alert(`Application status updated to ${formatStatus(status)}`);
  } catch (error) {
    console.error("Error updating status:", error);
    alert("Failed to update application status. Please try again later.");
  }
}

function filterApplications() {
  const jobFilter = document.getElementById("jobFilter").value;
  const statusFilter = document.getElementById("statusFilter").value;

  const cards = document.querySelectorAll(".application-card");
  let visibleCount = 0;

  cards.forEach((card) => {
    const jobMatch =
      jobFilter === "all" || card.getAttribute("data-job") === jobFilter;
    const statusMatch =
      statusFilter === "all" ||
      card.getAttribute("data-status") === statusFilter;

    if (jobMatch && statusMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show/hide no applications message
  document.getElementById("noApplicationsMessage").style.display =
    visibleCount === 0 ? "block" : "none";
}

function formatStatus(status) {
  const statusMap = {
    new: "New",
    reviewed: "Reviewed",
    shortlisted: "Shortlisted",
    rejected: "Rejected",
  };

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1);
}

function formatDate(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const month = date.toLocaleString("default", { month: "short" });
  const year = date.getFullYear();
  return `${month} ${year}`;
}
