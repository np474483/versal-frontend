document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "job_seeker") {
    window.location.href = "SignIn.html";
    return;
  }

  // Fetch saved jobs from database
  fetchSavedJobs(userInfo.userId);
});

async function fetchSavedJobs(userId) {
  try {
    const loadingElement = document.getElementById("loadingJobs");
    loadingElement.style.display = "block";

    const response = await fetch(
      `http://localhost:3000/api/job-seekers/saved-jobs/${userId}`
    );

    loadingElement.style.display = "none";

    if (!response.ok) {
      throw new Error("Failed to fetch saved jobs");
    }

    const savedJobs = await response.json();
    displaySavedJobs(savedJobs);
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    document.getElementById("loadingJobs").style.display = "none";
    document.getElementById("jobList").innerHTML = `
      <div class="error-message">
        <p>Failed to load saved jobs. Please try again later.</p>
      </div>
    `;
  }
}

function displaySavedJobs(savedJobs) {
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  if (savedJobs.length === 0) {
    document.getElementById("noJobsMessage").style.display = "block";
    return;
  }

  document.getElementById("noJobsMessage").style.display = "none";

  savedJobs.forEach((savedJob) => {
    const job = savedJob.jobId;
    const savedDate = new Date(savedJob.savedDate).toLocaleDateString();

    const jobCard = document.createElement("div");
    jobCard.className = "job-card";

    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <p class="job-location">${job.location}</p>
      <p class="job-type">${formatJobType(job.jobType)}</p>
      <p class="job-salary">₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} per month</p>
      <p class="saved-date">Saved on: ${savedDate}</p>
      <div class="job-actions">
        <button class="remove-btn" onclick="removeJob('${
          job._id
        }', this)">Remove</button>
        <button class="apply-btn" onclick="applyForJob('${
          job._id
        }')">Apply Now</button>
        <a href="job-details.html?id=${
          job._id
        }" class="view-details-btn">View Details</a>
      </div>
    `;

    jobList.appendChild(jobCard);
  });
}

async function removeJob(jobId, button) {
  if (
    confirm("Are you sure you want to remove this job from your saved jobs?")
  ) {
    const userInfo = JSON.parse(localStorage.getItem("userInfo"));

    try {
      const response = await fetch(
        `http://localhost:3000/api/job-seekers/unsave-job/${jobId}/${userInfo.userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        const jobCard = button.closest(".job-card");
        jobCard.remove();

        // Check if there are any job cards left
        const remainingCards = document.querySelectorAll(".job-card");
        if (remainingCards.length === 0) {
          document.getElementById("noJobsMessage").style.display = "block";
        }

        alert("Job removed from saved jobs");
      } else {
        alert("Failed to remove job from saved jobs");
      }
    } catch (error) {
      console.error("Error removing job:", error);
      alert("An error occurred. Please try again later.");
    }
  }
}

function applyForJob(jobId) {
  window.location.href = "job-details.html?id=" + jobId;
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
