document.addEventListener("DOMContentLoaded", () => {
  // Check if admin is logged in
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  if (!adminInfo) {
    // Instead of redirecting, we'll just show a message and fetch jobs anyway
    console.warn(
      "Admin info not found in localStorage. Some features may be limited."
    );
  }

  // Fetch all jobs
  fetchJobs();

  // Set up modal
  const modal = document.getElementById("jobDetailsModal");
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

async function fetchJobs() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/jobs");
    const jobs = await response.json();

    displayJobs(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    alert("Failed to load jobs. Please try again later.");
  }
}

function displayJobs(jobs) {
  const tableBody = document.getElementById("jobsTableBody");
  tableBody.innerHTML = "";

  jobs.forEach((job) => {
    const row = document.createElement("tr");
    const postedDate = new Date(job.postedDate).toLocaleDateString();

    row.innerHTML = `
      <td>${job.title}</td>
      <td>${job.company}</td>
      <td>${job.location}</td>
      <td>${job.category}</td>
      <td><span class="status-badge status-${job.status}">${formatStatus(
      job.status
    )}</span></td>
      <td>${postedDate}</td>
      <td>
        <button class="table-action-btn view-btn" onclick="viewJobDetails('${
          job._id
        }')">View Details</button>
        <button class="table-action-btn delete-btn" onclick="deleteJob('${
          job._id
        }')">Delete</button>
      </td>
    `;

    tableBody.appendChild(row);
  });
}

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

async function viewJobDetails(jobId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/admin/jobs/${jobId}`
    );
    if (!response.ok) {
      throw new Error("Failed to fetch job details");
    }

    const job = await response.json();

    // Fetch recruiter details
    const recruiterResponse = await fetch(
      `http://localhost:3000/api/admin/users/${job.recruiterId}`
    );
    let recruiter = { firstName: "Unknown", lastName: "User" };

    if (recruiterResponse.ok) {
      recruiter = await recruiterResponse.json();
    }

    // Display job details
    displayJobDetails(job, recruiter);

    // Set up action buttons
    const flagJobBtn = document.getElementById("flagJobBtn");
    const deleteJobBtn = document.getElementById("deleteJobBtn");

    flagJobBtn.onclick = () => flagJob(jobId, job.isFlagged);
    deleteJobBtn.onclick = () => deleteJob(jobId);

    // Update flag button text based on current status
    flagJobBtn.textContent = job.isFlagged
      ? "Remove Flag"
      : "Flag as Inappropriate";

    // Show the modal
    document.getElementById("jobDetailsModal").style.display = "block";
  } catch (error) {
    console.error("Error fetching job details:", error);
    alert("Failed to load job details. Please try again later.");
  }
}

function displayJobDetails(job, recruiter) {
  const jobDetailsContent = document.getElementById("jobDetailsContent");

  const postedDate = new Date(job.postedDate).toLocaleDateString();

  const html = `
    <div class="job-detail-section">
      <h3>${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <p class="job-meta"><strong>Location:</strong> ${job.location}</p>
      <p class="job-meta"><strong>Job Type:</strong> ${formatJobType(
        job.jobType
      )}</p>
      <p class="job-meta"><strong>Category:</strong> ${job.category}</p>
      <p class="job-meta"><strong>Salary Range:</strong> ₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} per month</p>
      <p class="job-meta"><strong>Status:</strong> <span class="status-badge status-${
        job.status
      }">${formatStatus(job.status)}</span></p>
      <p class="job-meta"><strong>Posted Date:</strong> ${postedDate}</p>
      <p class="job-meta"><strong>Posted By:</strong> ${recruiter.firstName} ${
    recruiter.lastName
  } (${recruiter.email})</p>
      ${
        job.isFlagged
          ? '<p class="job-meta warning-text"><strong>This job has been flagged as potentially inappropriate</strong></p>'
          : ""
      }
    </div>
    
    <div class="job-detail-section">
      <h3>Job Description</h3>
      <p>${job.description}</p>
    </div>
    
    <div class="job-detail-section">
      <h3>Required Skills</h3>
      <p>${job.requirements}</p>
    </div>
  `;

  jobDetailsContent.innerHTML = html;
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

async function flagJob(jobId, currentStatus) {
  const action = currentStatus ? "remove flag from" : "flag";

  if (confirm(`Are you sure you want to ${action} this job?`)) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/jobs/${jobId}/flag`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ isFlagged: !currentStatus }),
        }
      );

      if (response.ok) {
        alert(`Job ${currentStatus ? "unflagged" : "flagged"} successfully`);

        // Update the button text
        const flagJobBtn = document.getElementById("flagJobBtn");
        flagJobBtn.textContent = currentStatus
          ? "Flag as Inappropriate"
          : "Remove Flag";

        // Update the flag status in the modal
        const warningText = document.querySelector(".warning-text");
        if (warningText && currentStatus) {
          warningText.remove();
        } else if (!warningText && !currentStatus) {
          const jobMeta = document.querySelector(".job-detail-section");
          const flagElement = document.createElement("p");
          flagElement.className = "job-meta warning-text";
          flagElement.innerHTML =
            "<strong>This job has been flagged as potentially inappropriate</strong>";
          jobMeta.appendChild(flagElement);
        }

        // Refresh the job list
        fetchJobs();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error(`Error ${action}ing job:`, error);
      alert(`An error occurred while ${action}ing the job`);
    }
  }
}

async function deleteJob(jobId) {
  if (
    confirm(
      "Are you sure you want to delete this job? This action cannot be undone."
    )
  ) {
    try {
      const response = await fetch(
        `http://localhost:3000/api/admin/jobs/${jobId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        alert("Job deleted successfully");

        // Close the modal if it's open
        document.getElementById("jobDetailsModal").style.display = "none";

        // Refresh the job list
        fetchJobs();
      } else {
        const data = await response.json();
        alert(`Error: ${data.message}`);
      }
    } catch (error) {
      console.error("Error deleting job:", error);
      alert("An error occurred while deleting the job");
    }
  }
}

function searchJobs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const statusFilter = document.getElementById("statusFilter").value;
  const categoryFilter = document.getElementById("categoryFilter").value;

  const rows = document.querySelectorAll("#jobsTableBody tr");

  rows.forEach((row) => {
    const title = row.cells[0].textContent.toLowerCase();
    const company = row.cells[1].textContent.toLowerCase();
    const category = row.cells[3].textContent.toLowerCase();
    const status = row.cells[4].textContent.toLowerCase();

    const matchesSearch =
      title.includes(searchTerm) || company.includes(searchTerm);
    const matchesStatus =
      statusFilter === "all" || status.toLowerCase() === statusFilter;
    const matchesCategory =
      categoryFilter === "all" || category.toLowerCase() === categoryFilter;

    if (matchesSearch && matchesStatus && matchesCategory) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}

function filterJobs() {
  searchJobs(); // Reuse the search function which also handles filtering
}
