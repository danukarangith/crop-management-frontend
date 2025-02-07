const API_BASE_URL = "http://localhost:8080/api/v1/cropDetails";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditLogId = null;

// Create Log (POST)
const createLog = async (logData) => {
    const token = getToken();
    const headers = {
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: logData, // Send FormData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Update Log (PATCH)
const updateLog = async (logId, logData) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/${logId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`, // Only Authorization, FormData handles Content-Type
            },
            body: logData, // FormData with multipart data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Update failed: ${errorText}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

         
    } catch (error) {
        console.error("Error updating log:", error);
        throw error;
    }
};

// Get All Logs (GET)
const getAllLogs = async () => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const logsList = await response.json();
    return logsList;
};

// Get Single Log (GET)
const getSingleLog = async (logId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${logId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const log = await response.json();
    return log;
};

// Delete Log (DELETE)
const deleteLog = async (logId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${logId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    Swal.fire({
        icon: 'success',
        title: 'Deleted!',
        text: 'Log has been successfully deleted.',
        confirmButtonText: 'OK',
    }).then(() => {
        renderLogTable();
    });
};

// Elements
const addLogBtn = document.getElementById("addLogBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const logForm = document.getElementById("staffForm");
const logTableBody = document.querySelector("#staffTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", logId = null) => {
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditLogId = logId;
    } else {
        formMode = "ADD";
        currentEditLogId = null;
        logForm.reset();
    }
};

// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Render Log Table
const renderLogTable = async () => {
    try {
        toggleLoading(true);
        const logsList = await getAllLogs();
        logTableBody.innerHTML = "";

        logsList.forEach((log) => {
            const row = `
                <tr>
                    <td>${log.logCode}</td>
                    <td>${log.logDate}</td>
                    <td>${log.logDetails}</td>
                    <td><img src="data:image/png;base64,${log.observedImage}" alt="${log.logDetails}" width="50"></td>
                    <td>
                         <button class="view-btn" onclick="viewLog('${log.logCode}')">View</button>
                        <button class="edit-btn" onclick="editLog('${log.logCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteLog('${log.logCode}')">Delete</button>
                          <button class="download-btn" onclick="downloadlogData('${log.logCode}')">Download</button>
                    </td>
                </tr>
            `;
            logTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading log data:", error);
        alert("Failed to load log data.");
    } finally {
        toggleLoading(false);
    }
};

// Save or Update Log
logForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const formdata = new FormData();
    formdata.append("logDetails", document.getElementById("logDetails").value);
    formdata.append("observedImage", document.getElementById("observeImage").files[0], document.getElementById("observeImage").files[0].name);
    formdata.append("fieldCodes", document.getElementById("fieldCode").value);
    formdata.append("cropCodes", document.getElementById("cropCode").value);
    formdata.append("staffIds", document.getElementById("staffId").value);

    try {
        if (formMode === "EDIT" && currentEditLogId) {
            await updateLog(currentEditLogId, formdata);
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Log data has been successfully updated.',
                confirmButtonText: 'OK',
            });
        } else {
            await createLog(formdata);
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Log data has been successfully saved.',
                confirmButtonText: 'OK',
            });
        }

        renderLogTable();
        hidePopup();
        logForm.reset();
    } catch (error) {
        console.error("Error saving log:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save log data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
});

// Edit Log (Open Popup)
window.editLog = async (logId) => {
    try {
        const log = await getSingleLog(logId);

        // Populate form fields
        document.getElementById("logDetails").value = log.logDetails || "";
        document.getElementById("fieldCode").value = log.fieldCodes || "";
        document.getElementById("cropCode").value = log.cropCodes || "";
        document.getElementById("staffId").value = log.staffIds || "";

        // Reset file input and set image preview
        const fileInput = document.getElementById("observeImage");
        fileInput.value = ""; // Clear file input

        const imagePreview = document.getElementById("imagePreviewcd");
        if (log.observedImage) {
            imagePreview.src = `data:image/png;base64,${log.observedImage}`; // Update preview with base64 image
            imagePreview.style.display = "block"; // Show preview
        } else {
            imagePreview.src = ""; // Clear preview if no image
            imagePreview.style.display = "none"; // Hide preview element
        }

        showPopup("EDIT", logId);
    } catch (error) {
        console.error("Error fetching log data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch log data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
};

// Image Preview Function
const previewImage = (event) => {
    const reader = new FileReader();
    reader.onload = function () {
        const imagePreview = document.getElementById("imagePreviewcd");
        imagePreview.src = reader.result; // Display uploaded image
    };
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
};

// View Vehicle (GET)
window.viewLog = async (logId) => {
    try {
        const log = await getSingleLog(logId);
        
        // Show detailed information about the vehicle
        Swal.fire({
            title: `Log Details: ${logId}`,
            html: `
                <p><strong>Log Code:</strong> ${log.logCode}</p>
                <p><strong>Log Date:</strong> ${log.logDate }</p>
                <p><strong>Log Details:</strong> ${log.logDetails}</p>
                <p><strong>image:</strong> <img src="data:image/png;base64,${log.observedImage}" alt="${log.logDetails}" width="50"</p>
                 
            `,
            confirmButtonText: "Close"
        });
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch vehicle data. Please try again.",
            confirmButtonText: "OK"
        });
    }
};

const convertToCSV = (data) => {
    // Get the headers (keys of the first object)
    const headers = Object.keys(data[0]);
    
    // Create the CSV header row
    const headerRow = headers.join(",") + "\n";
    
    // Map the data rows and join them with commas
    const dataRows = data.map((row) => {
        return headers.map((header) => row[header]).join(",");
    }).join("\n");
    
    // Return the complete CSV string
    return headerRow + dataRows;
};


// Download Vehicle Data for a specific vehicle
const downloadlogData = async (logId) => {
    try {
        // Fetch the data for the specific vehicle
        const log = await getSingleLog(logId);

        // Convert the data to CSV format
        const csvData = convertToCSV([log]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `log_${logId}_data.csv`;  // Filename for the downloaded file
        a.click();

        // Clean up by revoking the URL
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error("Error generating vehicle data CSV:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to generate CSV for this vehicle. Please try again.",
            confirmButtonText: "OK",
        });
    }
};

// Attach event listener to the file input
// document.getElementById("observeImage").addEventListener("change", previewImage);

// Event Listeners
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Initialize the log table
renderLogTable();
