// Recruiter Dashboard JavaScript
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "recruiter") {
    window.location.href = "SignIn.html";
    return;
  }

  // Set user name in welcome message
  document.getElementById(
    "recruiterName"
  ).textContent = `${userInfo.firstName} ${userInfo.lastName}`;

  // Fetch dashboard stats
  fetchDashboardStats(userInfo.userId);

  // Fetch recent job postings
  fetchRecentJobs(userInfo.userId);
});

async function fetchDashboardStats(recruiterId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/stats/${recruiterId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch stats");
    }

    const stats = await response.json();

    // Update stats on the page
    document.getElementById("activeJobsCount").textContent = stats.activeJobs;
    document.getElementById("totalApplicationsCount").textContent =
      stats.totalApplications;
    document.getElementById("newApplicationsCount").textContent =
      stats.newApplications;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
    document.querySelector(".stats-container").innerHTML = `
      <div class="error-message">
        <p>Failed to load dashboard statistics. Please try again later.</p>
      </div>
    `;
  }
}

async function fetchRecentJobs(recruiterId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/jobs/${recruiterId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    displayRecentJobs(jobs.slice(0, 5)); // Display only the 5 most recent jobs
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    document.querySelector(".job-list").innerHTML = `
      <div class="error-message">
        <p>Failed to load recent job postings. Please try again later.</p>
      </div>
    `;
  }
}

function displayRecentJobs(jobs) {
  const jobListContainer = document.querySelector(".job-list");

  if (jobs.length === 0) {
    jobListContainer.innerHTML = `
      <div class="no-jobs-message">
        <p>You haven't posted any jobs yet.</p>
        <a href="post-job.html" class="action-btn">Post Your First Job</a>
      </div>
    `;
    return;
  }

  jobListContainer.innerHTML = "";

  jobs.forEach((job) => {
    const jobCard = document.createElement("div");
    jobCard.className = "job-card";

    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p class="job-location">${job.location}</p>
      <p class="job-type">${formatJobType(job.jobType)}</p>
      <div class="job-actions">
        <a href="view-applications.html?job=${
          job._id
        }" class="view-btn">View Applications</a>
        <button class="delete-btn" onclick="confirmDelete('${
          job._id
        }')">Delete</button>
      </div>
    `;

    jobListContainer.appendChild(jobCard);
  });
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

async function confirmDelete(jobId) {
  if (confirm("Are you sure you want to delete this job posting?")) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/recruiters/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        showNotification("Job deleted successfully!");

        // Refresh the job list and stats
        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        fetchRecentJobs(userInfo.userId);
        fetchDashboardStats(userInfo.userId);
      } else {
        const data = await response.json();
        showNotification(data.message || "Failed to delete job", "error");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      showNotification("An error occurred. Please try again later.", "error");
    }
  }
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
`;
document.head.appendChild(style);
