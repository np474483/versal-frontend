document.addEventListener("DOMContentLoaded", () => {
  // Check if user is logged in
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))
  if (!userInfo || userInfo.userType !== "job_seeker") {
    window.location.href = "SignIn.html"
    return
  }

  // Fetch applied jobs from database
  fetchAppliedJobs(userInfo.userId)

  // Set up modals
  setupModals()
})

function setupModals() {
  // Resume Modal
  const resumeModal = document.getElementById("resumeModal")
  const resumeCloseBtn = resumeModal.querySelector(".close")
  const closeResumeBtn = document.getElementById("closeResumeBtn")

  resumeCloseBtn.onclick = () => {
    resumeModal.style.display = "none"
  }

  closeResumeBtn.onclick = () => {
    resumeModal.style.display = "none"
  }

  // Message Modal
  const messageModal = document.getElementById("messageModal")
  const messageCloseBtn = messageModal.querySelector(".close")
  const closeMessageBtn = document.getElementById("closeMessageBtn")

  messageCloseBtn.onclick = () => {
    messageModal.style.display = "none"
  }

  closeMessageBtn.onclick = () => {
    messageModal.style.display = "none"
  }

  // Close modals when clicking outside
  window.onclick = (event) => {
    if (event.target === resumeModal) {
      resumeModal.style.display = "none"
    }
    if (event.target === messageModal) {
      messageModal.style.display = "none"
    }
  }
}

async function fetchAppliedJobs(userId) {
  try {
    const loadingElement = document.getElementById("loadingJobs")
    loadingElement.style.display = "block"

    const response = await fetch(`http://localhost:3000/api/job-seekers/applications/${userId}`)

    loadingElement.style.display = "none"

    if (!response.ok) {
      throw new Error("Failed to fetch applications")
    }

    const applications = await response.json()
    displayAppliedJobs(applications)
  } catch (error) {
    console.error("Error fetching applications:", error)
    document.getElementById("loadingJobs").style.display = "none"
    document.getElementById("jobList").innerHTML = `
      <div class="error-message">
        <p>Failed to load applications. Please try again later.</p>
      </div>
    `
  }
}

function displayAppliedJobs(applications) {
  const jobList = document.getElementById("jobList")
  jobList.innerHTML = ""

  if (applications.length === 0) {
    document.getElementById("noJobsMessage").style.display = "block"
    return
  }

  document.getElementById("noJobsMessage").style.display = "none"

  applications.forEach((application) => {
    // Check if jobId is an object (populated) or just an ID
    const job =
      typeof application.jobId === "object"
        ? application.jobId
        : { title: "Job Title", company: "Company", location: "Location", jobType: "full-time" }

    const appliedDate = new Date(application.appliedDate).toLocaleDateString()

    const jobCard = document.createElement("div")
    jobCard.className = "job-card"

    jobCard.innerHTML = `
      <h3>${job.title}</h3>
      <p class="company-name">${job.company}</p>
      <p class="job-location">${job.location}</p>
      <p class="job-type">${formatJobType(job.jobType)}</p>
      <p class="applied-date">Applied on: ${appliedDate}</p>
      <div class="status-container">
        <p class="status-label">Status:</p>
        <span class="status-badge ${application.status}">${formatStatus(application.status)}</span>
      </div>
      <div class="job-actions">
        <button class="view-btn" onclick="viewResume('${application._id}')">View My Resume</button>
        <a href="job-details.html?id=${typeof application.jobId === "object" ? application.jobId._id : application.jobId}" class="view-details-btn">View Job Details</a>
        ${application.feedback ? `<button class="message-btn" onclick="viewFeedback('${application._id}')">View Feedback</button>` : ""}
      </div>
    `

    jobList.appendChild(jobCard)
  })
}

function viewResume(applicationId) {
  // In a real application, we would fetch the resume from the server
  // For this demo, we'll display a sample resume
  const resumeModal = document.getElementById("resumeModal")
  const resumeContent = document.getElementById("resumeContent")

  // Fetch the user's profile to get resume information
  const userInfo = JSON.parse(localStorage.getItem("userInfo"))

  fetch(`http://localhost:3000/api/job-seekers/profile/${userInfo.userId}`)
    .then((response) => response.json())
    .then((profile) => {
      // Display resume information
      resumeContent.innerHTML = `
        <div class="resume-preview">
          <div class="resume-header">
            <h3>${userInfo.firstName} ${userInfo.lastName}</h3>
            <p>${profile.email || userInfo.email}</p>
            <p>${profile.phone || userInfo.phone}</p>
            <p>${profile.location || "Location not specified"}</p>
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
            <p>${profile.experience || "No experience listed."}</p>
          </div>
          
          <div class="resume-section">
            <h4>Education</h4>
            <p>Details would be fetched from the database in a real application.</p>
          </div>
          
          <div class="resume-note">
            <p><strong>Note:</strong> This is a preview of your resume as seen by recruiters. In a real application, this would display your actual resume file or a more detailed formatted resume.</p>
          </div>
        </div>
      `

      // Show the modal
      resumeModal.style.display = "block"
    })
    .catch((error) => {
      console.error("Error fetching profile:", error)
      resumeContent.innerHTML = `
        <div class="error-message">
          <p>Failed to load resume information. Please try again later.</p>
        </div>
      `
      resumeModal.style.display = "block"
    })
}

function viewFeedback(applicationId) {
  // In a real app, you would fetch the feedback from the database
  // For now, we'll show a sample feedback based on application status
  const messageModal = document.getElementById("messageModal")
  const messageContent = document.getElementById("messageContent")

  // Find the application status from the DOM
  const statusBadge = document
    .querySelector(`.job-card button[onclick="viewFeedback('${applicationId}')"]`)
    .closest(".job-card")
    .querySelector(".status-badge")

  const status = statusBadge.classList[1]

  // Sample feedback messages based on status
  const feedbackMessages = {
    new: "Thank you for your application. We are currently reviewing your profile and will get back to you soon.",
    reviewed:
      "We have reviewed your application and are impressed with your profile. We would like to schedule an interview with you. Please check your email for details.",
    shortlisted:
      "Congratulations! You have been shortlisted for the next round. Our HR team will contact you shortly to schedule an interview.",
    rejected:
      "Thank you for your interest in our company. After careful consideration, we have decided to move forward with other candidates whose qualifications better match our current needs.",
  }

  messageContent.innerHTML = `<p>${feedbackMessages[status] || "No feedback available at this time."}</p>`
  messageModal.style.display = "block"
}

function formatJobType(jobType) {
  if (!jobType) return "Not specified"
  return jobType.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())
}

function formatStatus(status) {
  const statusMap = {
    new: "Under Review",
    reviewed: "Application Reviewed",
    shortlisted: "Shortlisted for Interview",
    rejected: "Not Selected",
  }

  return statusMap[status] || status.charAt(0).toUpperCase() + status.slice(1)
}
