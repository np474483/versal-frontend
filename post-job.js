document.addEventListener("DOMContentLoaded", () => {
  const userInfo = JSON.parse(localStorage.getItem("userInfo"));
  if (!userInfo || userInfo.userType !== "recruiter") {
    window.location.href = "SignIn.html";
    return;
  }

  const urlParams = new URLSearchParams(window.location.search);
  const editJobId = urlParams.get("edit");

  if (editJobId) {
    document.getElementById("page-title").textContent = "Edit Job Posting";
    document.getElementById("page-subtitle").textContent =
      "Update the details of your job listing";
    document.getElementById("submitButton").textContent = "Update Job";

    loadJobData(editJobId);
  } else {
    loadCompanyInfo(userInfo.userId);
  }

  const jobForm = document.getElementById("jobForm");
  jobForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const submitButton = document.getElementById("submitButton");
        const originalButtonText = submitButton.textContent;
        submitButton.textContent = editJobId ? "Updating..." : "Posting...";
        submitButton.disabled = true;

        const formData = new FormData(jobForm);

        const jobData = {
          title: formData.get("title"),
          company: formData.get("company"),
          category: formData.get("category"),
          jobType: formData.get("jobType"),
          salary: {
            min: Number.parseInt(formData.get("salaryMin")),
            max: Number.parseInt(formData.get("salaryMax")),
          },
          location: formData.get("location"),
          description: formData.get("description"),
          requirements: formData.get("requirements"),
          recruiterId: userInfo.userId,
          status: "active",
        };

        let response;

        if (editJobId) {
          response = await fetch(
            `http://localhost:3000/api/recruiters/jobs/${editJobId}`,
            {
              method: "PUT",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(jobData),
            }
          );
        } else {
          response = await fetch("http://localhost:3000/api/recruiters/jobs", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(jobData),
          });
        }

        submitButton.textContent = originalButtonText;
        submitButton.disabled = false;

        if (!response.ok) {
          throw new Error("Failed to save job");
        }

        alert(
          editJobId ? "Job updated successfully!" : "Job posted successfully!"
        );

        setTimeout(() => {
          window.location.href = "recruiter-dashboard.html";
        }, 1000);
      } catch (error) {
        console.error("Error saving job:", error);
        alert("Error saving job. Please try again.");

        const submitButton = document.getElementById("submitButton");
        submitButton.textContent = editJobId ? "Update Job" : "Post Job";
        submitButton.disabled = false;
      }
    }
  });

  const cancelButton = document.getElementById("cancelButton");
  cancelButton.addEventListener("click", () => {
    if (
      confirm(
        "Are you sure you want to cancel? Any unsaved changes will be lost."
      )
    ) {
      window.location.href = "recruiter-dashboard.html";
    }
  });
});

async function loadCompanyInfo(userId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/profile/${userId}`
    );

    if (response.status === 404) {
      return;
    }

    if (!response.ok) {
      throw new Error("Failed to load company info");
    }

    const profile = await response.json();

    document.getElementById("company").value = profile.companyName || "";
  } catch (error) {
    console.error("Error loading company info:", error);
  }
}

async function loadJobData(jobId) {
  try {
    const response = await fetch(
      `http://localhost:3000/api/recruiters/jobs/${jobId}`
    );

    if (!response.ok) {
      throw new Error("Failed to load job data");
    }

    const job = await response.json();

    document.getElementById("title").value = job.title || "";
    document.getElementById("company").value = job.company || "";
    document.getElementById("category").value = job.category || "";
    document.getElementById("jobType").value = job.jobType || "";
    document.getElementById("salaryMin").value = job.salary?.min || "";
    document.getElementById("salaryMax").value = job.salary?.max || "";
    document.getElementById("location").value = job.location || "";
    document.getElementById("description").value = job.description || "";
    document.getElementById("requirements").value = job.requirements || "";
  } catch (error) {
    console.error("Error loading job data:", error);
    alert("Error loading job data. Please try again.");
  }
}

function validateForm() {
  const title = document.getElementById("title").value.trim();
  const company = document.getElementById("company").value.trim();
  const category = document.getElementById("category").value;
  const jobType = document.getElementById("jobType").value;
  const salaryMin = document.getElementById("salaryMin").value.trim();
  const salaryMax = document.getElementById("salaryMax").value.trim();
  const location = document.getElementById("location").value.trim();
  const description = document.getElementById("description").value.trim();
  const requirements = document.getElementById("requirements").value.trim();

  if (!title) {
    alert("Please enter a job title");
    return false;
  }

  if (!company) {
    alert("Please enter a company name");
    return false;
  }

  if (!category) {
    alert("Please select a job category");
    return false;
  }

  if (!jobType) {
    alert("Please select a job type");
    return false;
  }

  if (!salaryMin || !salaryMax) {
    alert("Please enter both minimum and maximum salary");
    return false;
  }

  if (!location) {
    alert("Please enter a job location");
    return false;
  }

  if (!description) {
    alert("Please enter a job description");
    return false;
  }

  if (!requirements) {
    alert("Please enter required skills");
    return false;
  }

  if (Number.parseInt(salaryMin) > Number.parseInt(salaryMax)) {
    alert("Minimum salary cannot be greater than maximum salary");
    return false;
  }

  return true;
}
