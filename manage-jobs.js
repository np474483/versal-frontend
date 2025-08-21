document.addEventListener("DOMContentLoaded", () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "recruiter") {
    window.location.href = "SignIn.html";
    return;
  }

  fetchJobs(userInfo.userId);

  const searchInput = document.getElementById("searchInput");
  searchInput.addEventListener("input", filterJobs);
});

async function fetchJobs(recruiterId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/jobs/${recruiterId}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    displayJobs(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.querySelector(".jobs-container").innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>Failed to load jobs. Please try again later.</p>
      </div>
    `;
  }
}

function displayJobs(jobs) {
  const jobsContainer = document.querySelector(".jobs-container");

  if (jobs.length === 0) {
    jobsContainer.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>You haven't posted any jobs yet.</p>
        <a href="post-job.html" class="action-btn">Post Your First Job</a>
      </div>
    `;
    return;
  }

  jobsContainer.innerHTML = "";

  jobs.forEach((job) => {
    const postedDate = new Date(job.postedDate).toLocaleDateString();

    const jobItem = document.createElement("div");
    jobItem.className = "job-item";
    jobItem.setAttribute("data-title", job.title.toLowerCase());
    jobItem.setAttribute("data-company", job.company.toLowerCase());
    jobItem.setAttribute("data-location", job.location.toLowerCase());

    jobItem.innerHTML = `
      <div class="job-info">
        <h3>${job.title}</h3>
        <p class="job-details">${formatJobType(job.jobType)} • ${
      job.location
    }</p>
        <p class="job-date">Posted on: ${postedDate}</p>
      </div>
      <div class="job-status">
        <span class="status ${job.status}">${formatStatus(job.status)}</span>
        <p>${job.applications ? job.applications : 0} Applications</p>
      </div>
      <div class="job-actions">
        <a href="view-applications.html?job=${
          job._id
        }" class="action-btn view">View Applications</a>
        <a href="job-details.html?id=${
          job._id
        }" class="action-btn view">View Details</a>
        <a href="post-job.html?edit=${job._id}" class="action-btn edit">Edit</a>
        <button class="action-btn delete" onclick="confirmDelete('${
          job._id
        }')">Delete</button>
      </div>
    `;

    jobsContainer.appendChild(jobItem);
  });
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
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
        alert("Job deleted successfully!");

        const userInfo = JSON.parse(localStorage.getItem("userInfo"));
        fetchJobs(userInfo.userId);
      } else {
        const data = await response.json();
        alert(data.message || "Failed to delete job");
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An error occurred. Please try again later.");
    }
  }
}

function filterJobs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const jobItems = document.querySelectorAll(".job-item");

  jobItems.forEach((item) => {
    const title = item.getAttribute("data-title");
    const company = item.getAttribute("data-company");
    const location = item.getAttribute("data-location");

    if (
      title.includes(searchTerm) ||
      company.includes(searchTerm) ||
      location.includes(searchTerm)
    ) {
      item.style.display = "";
    } else {
      item.style.display = "none";
    }
  });
}
