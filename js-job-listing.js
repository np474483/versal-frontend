document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "job_seeker") {
    window.location.href = "SignIn.html";
    return;
  }

  // Fetch jobs from database
  fetchJobs();

  // Add event listeners
  document.getElementById("searchInput").addEventListener("input", searchJobs);
});

async function fetchJobs() {
  try {
    const loadingElement = document.getElementById("loadingJobs");
    loadingElement.style.display = "block";

    const response = await fetch("http://localhost:3000/api/job-seekers/jobs");

    loadingElement.style.display = "none";

    if (!response.ok) {
      throw new Error("Failed to fetch jobs");
    }

    const jobs = await response.json();
    displayJobs(jobs);

    // Populate location filter
    populateLocationFilter(jobs);
  } catch (error) {
    console.error("Error fetching jobs:", error);
    document.getElementById("loadingJobs").style.display = "none";
    document.getElementById("jobList").innerHTML = `
      <div class="error-message">
        <p>Failed to load jobs. Please try again later.</p>
      </div>
    `;
  }
}

function displayJobs(jobs) {
  const jobList = document.getElementById("jobList");
  jobList.innerHTML = "";

  if (jobs.length === 0) {
    document.getElementById("noJobsMessage").style.display = "block";
    return;
  }

  document.getElementById("noJobsMessage").style.display = "none";

  jobs.forEach((job) => {
    // Extract location for data attribute (for filtering)
    const locationLower = job.location.toLowerCase().split(",")[0].trim();

    const jobCard = document.createElement("div");
    jobCard.className = "job-card";
    jobCard.setAttribute("data-location", locationLower);
    jobCard.setAttribute("data-type", job.jobType);

    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <p class="job-location">${job.location}</p>
      <p class="job-type">${formatJobType(job.jobType)}</p>
      <p class="job-salary">₹${job.salary.min.toLocaleString()} - ₹${job.salary.max.toLocaleString()} per month</p>
      <p class="job-description">${truncateText(job.description, 150)}</p>
      <div class="job-actions">
        <button class="save-btn" onclick="saveJob('${
          job._id
        }', this)">Save Job</button>
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

  // Check if any jobs are saved
  checkSavedJobs();
}

function populateLocationFilter(jobs) {
  const locationFilter = document.getElementById("locationFilter");
  const locations = new Set();

  // Clear existing options except "All Locations"
  while (locationFilter.options.length > 1) {
    locationFilter.remove(1);
  }

  // Extract unique locations
  jobs.forEach((job) => {
    const location = job.location.toLowerCase().split(",")[0].trim();
    locations.add(location);
  });

  // Add location options
  locations.forEach((location) => {
    const option = document.createElement("option");
    option.value = location;
    option.textContent = location.charAt(0).toUpperCase() + location.slice(1);
    locationFilter.appendChild(option);
  });
}

function searchJobs() {
  const searchTerm = document.getElementById("searchInput").value.toLowerCase();
  const jobCards = document.querySelectorAll(".job-card");
  let visibleCount = 0;

  jobCards.forEach((card) => {
    const title = card.querySelector("h3").textContent.toLowerCase();
    const company = card
      .querySelector(".company-name")
      .textContent.toLowerCase();
    const description = card
      .querySelector(".job-description")
      .textContent.toLowerCase();

    if (
      title.includes(searchTerm) ||
      company.includes(searchTerm) ||
      description.includes(searchTerm)
    ) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show/hide no jobs message
  document.getElementById("noJobsMessage").style.display =
    visibleCount === 0 ? "block" : "none";
}

function filterJobs() {
  const locationFilter = document.getElementById("locationFilter").value;
  const jobTypeFilter = document.getElementById("jobTypeFilter").value;
  const jobCards = document.querySelectorAll(".job-card");
  let visibleCount = 0;

  jobCards.forEach((card) => {
    const location = card.getAttribute("data-location");
    const jobType = card.getAttribute("data-type");

    const locationMatch =
      locationFilter === "all" || location === locationFilter;
    const jobTypeMatch = jobTypeFilter === "all" || jobType === jobTypeFilter;

    if (locationMatch && jobTypeMatch) {
      card.style.display = "";
      visibleCount++;
    } else {
      card.style.display = "none";
    }
  });

  // Show/hide no jobs message
  document.getElementById("noJobsMessage").style.display =
    visibleCount === 0 ? "block" : "none";
}

function resetFilters() {
  document.getElementById("searchInput").value = "";
  document.getElementById("locationFilter").value = "all";
  document.getElementById("jobTypeFilter").value = "all";

  const jobCards = document.querySelectorAll(".job-card");
  jobCards.forEach((card) => {
    card.style.display = "";
  });

  document.getElementById("noJobsMessage").style.display = "none";
}

async function saveJob(jobId, button) {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  try {
    if (button.classList.contains("saved")) {
      // Unsave job
      const response = await fetch(
        `http://localhost:3000/api/job-seekers/unsave-job/${jobId}/${userInfo.userId}`,
        {
          method: "DELETE",
        }
      );

      if (response.ok) {
        button.classList.remove("saved");
        button.textContent = "Save Job";
        alert("Job removed from saved jobs");
      } else {
        alert("Failed to remove job from saved jobs");
      }
    } else {
      // Save job
      const response = await fetch(
        "http://localhost:3000/api/job-seekers/save-job",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            jobId: jobId,
            userId: userInfo.userId,
          }),
        }
      );

      if (response.ok) {
        button.classList.add("saved");
        button.textContent = "Saved";
        alert("Job saved successfully!");
      } else {
        const data = await response.json();
        alert(data.message || "Failed to save job");
      }
    }
  } catch (error) {
    console.error("Error saving/unsaving job:", error);
    alert("An error occurred. Please try again later.");
  }
}

async function checkSavedJobs() {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));

  try {
    const response = await fetch(
      `http://localhost:3000/api/job-seekers/saved-jobs/${userInfo.userId}`
    );

    if (!response.ok) {
      return;
    }

    const savedJobs = await response.json();
    const savedJobIds = savedJobs.map((job) => job.jobId._id);

    // Update save buttons
    const saveButtons = document.querySelectorAll(".save-btn");
    saveButtons.forEach((button) => {
      const jobId = button.onclick.toString().match(/'([^']+)'/)[1];

      if (savedJobIds.includes(jobId)) {
        button.classList.add("saved");
        button.textContent = "Saved";
      }
    });
  } catch (error) {
    console.error("Error checking saved jobs:", error);
  }
}

function applyForJob(jobId) {
  window.location.href = "job-details.html?id=" + jobId;
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

function truncateText(text, maxLength) {
  if (text.length <= maxLength) return text;
  return text.substr(0, maxLength) + "...";
}
