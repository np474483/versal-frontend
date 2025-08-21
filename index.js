document.addEventListener("DOMContentLoaded", () => {
  fetchRecentJobs();
});

async function fetchRecentJobs() {
  try {
    const response = await fetch("http://localhost:3000/api/jobs/recent");

    if (!response.ok) {
      throw new Error("Failed to fetch recent jobs");
    }

    const jobs = await response.json();
    displayRecentJobs(jobs);
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
    document.getElementById("recentJobsContainer").innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>Failed to load recent jobs. Please try again later.</p>
      </div>
    `;
  }
}

function displayRecentJobs(jobs) {
  const container = document.getElementById("recentJobsContainer");

  if (jobs.length === 0) {
    container.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <p>No jobs available at the moment. Please check back later.</p>
      </div>
    `;
    return;
  }

  container.innerHTML = "";

  const displayJobs = jobs.slice(0, 2);

  displayJobs.forEach((job, index) => {
    const postedDate = new Date(job.postedDate);
    const now = new Date();
    const diffTime = Math.abs(now - postedDate);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    let timeAgo;
    if (diffDays === 0) {
      timeAgo = "Today";
    } else if (diffDays === 1) {
      timeAgo = "Yesterday";
    } else {
      timeAgo = `${diffDays} days ago`;
    }

    const logoClass = index === 0 ? "green" : "orange";
    const titleClass = index === 0 ? "green-text" : "orange-text";

    const jobCard = document.createElement("div");
    jobCard.className = "job-card";

    jobCard.innerHTML = `
      <div class="job-header">
        <div class="job-info">
          <div class="company-logo ${logoClass}">${job.company.charAt(0)}</div>
          <div class="job-details">
            <span class="job-time">${timeAgo}</span>
            <h3 class="job-title ${titleClass}">${job.title}</h3>
            <p class="company-name">${job.company}</p>
          </div>
        </div>
        <button class="bookmark-btn" data-job-id="${job._id}">
          <i class="far fa-bookmark"></i>
        </button>
      </div>

      <div class="job-meta">
        <div class="meta-item">
          <i class="fas fa-briefcase"></i>
          <span>${job.category}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-clock"></i>
          <span>${formatJobType(job.jobType)}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-dollar-sign"></i>
          <span>${job.salary.min}-${job.salary.max}</span>
        </div>
        <div class="meta-item">
          <i class="fas fa-map-marker-alt"></i>
          <span>${job.location}</span>
        </div>
      </div>

      <div class="job-actions">
        <a href="job-details.html?id=${
          job._id
        }" class="details-btn">Job Details</a>
      </div>
    `;

    container.appendChild(jobCard);
  });

  const bookmarkButtons = document.querySelectorAll(".bookmark-btn");
  bookmarkButtons.forEach((button) => {
    button.addEventListener("click", () => {
      alert("Please sign in to save jobs");
      window.location.href = "SignIn.html";
    });
  });
}

function formatJobType(jobType) {
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}
