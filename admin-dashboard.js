document.addEventListener("DOMContentLoaded", () => {
  // Check if admin is logged in
  const adminInfo = JSON.parse(localStorage.getItem("adminInfo"));
  if (!adminInfo) {
    // Instead of redirecting, we'll just show a message and fetch data anyway
    console.warn(
      "Admin info not found in localStorage. Some features may be limited."
    );
  }

  // Fetch dashboard stats
  fetchDashboardStats();

  // Fetch recent users
  fetchRecentUsers();

  // Fetch recent jobs
  fetchRecentJobs();
});

async function fetchDashboardStats() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/stats");
    const data = await response.json();

    // Update stats on the page
    document.getElementById("totalUsers").textContent = data.totalUsers;
    document.getElementById("jobSeekers").textContent = data.jobSeekers;
    document.getElementById("recruiters").textContent = data.recruiters;
    document.getElementById("totalJobs").textContent = data.totalJobs;
    document.getElementById("activeJobs").textContent = data.activeJobs;
    document.getElementById("totalApplications").textContent =
      data.totalApplications;
  } catch (error) {
    console.error("Error fetching dashboard stats:", error);
  }
}

async function fetchRecentUsers() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/users");
    const users = await response.json();

    const recentUsersTable = document.getElementById("recentUsersTable");
    recentUsersTable.innerHTML = "";

    // Display only the 5 most recent users
    const recentUsers = users.slice(0, 5);

    recentUsers.forEach((user) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${user.firstName} ${user.lastName}</td>
        <td>${user.email}</td>
        <td>${formatUserType(user.userType)}</td>
        <td>
          <a href="admin-users.html" class="table-action-btn view-btn">View</a>
        </td>
      `;

      recentUsersTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching recent users:", error);
  }
}

async function fetchRecentJobs() {
  try {
    const response = await fetch("http://localhost:3000/api/admin/jobs");
    const jobs = await response.json();

    const recentJobsTable = document.getElementById("recentJobsTable");
    recentJobsTable.innerHTML = "";

    // Display only the 5 most recent jobs
    const recentJobs = jobs.slice(0, 5);

    recentJobs.forEach((job) => {
      const row = document.createElement("tr");

      row.innerHTML = `
        <td>${job.title}</td>
        <td>${job.company}</td>
        <td>${job.location}</td>
        <td><span class="status-badge status-${job.status}">${formatStatus(
        job.status
      )}</span></td>
        <td>
          <a href="admin-jobs.html" class="table-action-btn view-btn">View</a>
        </td>
      `;

      recentJobsTable.appendChild(row);
    });
  } catch (error) {
    console.error("Error fetching recent jobs:", error);
  }
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

function formatStatus(status) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}
