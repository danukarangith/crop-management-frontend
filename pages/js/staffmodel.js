const API_BASE_URL = "http://localhost:8080/api/v1/staff";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditStaffId = null;

// Create Staff (POST)
const createStaff = async (staffData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(staffData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // const result = await response.json();
    // return result;
};

// Get All Staff (GET)
const getAllStaff = async () => {
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

    const staffList = await response.json();
    return staffList;
};


// Get Single Staff (GET)
const getSingleStaff = async (staffId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${staffId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const staff = await response.json();
    return staff;
};


// Update Staff (PATCH)
const updateStaff = async (staffId, staffData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${staffId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(staffData),
    });

    // Check for response status
    if (!response.ok) {
        const errorText = await response.text(); // Log the response text for debugging
        console.error("Update failed:", errorText);
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    // Handle possible empty body response
    const responseBody = await response.text();
    return responseBody ? JSON.parse(responseBody) : null;
};


 

const deleteStaff = async (staffId) => {
    // Show SweetAlert confirmation before deletion
    Swal.fire({
        title: 'Are you sure?',
        text: 'Do you want to delete this staff member?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, keep it',
    }).then(async (result) => {
        if (result.isConfirmed) {
            // If user confirms, proceed with deletion
            const token = getToken();
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/${staffId}`, {
                    method: "DELETE",
                    headers,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Staff has been successfully deleted.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    renderStaffTable(); // Refresh the staff table after deletion
                });
            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Oops...',
                    text: error.message,
                });
            }
        } else {
            // If user clicks 'No', the alert will be closed and nothing happens
            Swal.fire({
                icon: 'info',
                title: 'Cancelled',
                text: 'The staff member was not deleted.',
            });
        }
    });
};


// Elements
const addStaffBtn = document.getElementById("addStaffBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const staffForm = document.getElementById("staff-form");
const staffTableBody = document.querySelector("#staffTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
// Show Popup Form
const showPopup = (mode = "ADD", staffId = null) => {
    popupForm.style.display = "block";
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditStaffId = staffId;
        // Don't reset the form in "EDIT" mode
    } else {
        formMode = "ADD";
        currentEditStaffId = null;
        staffForm.reset(); // Reset the form fields for "ADD" mode
    }
};


// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Function to sort staff based on designation (MANAGER, WORKER, SUPERVISOR, TECHNICIAN)
let isSortedAscending = true; // Global variable to track current sorting order

// Function to sort staff based on designation (with toggle)
const designationPriorityMap = new Map([
    ["MANAGER", 1],
    ["SUPERVISOR", 2],
    ["TECHNICIAN", 3],
    ["WORKER", 4],
]);

// Function to update priority map dynamically
const updateDesignationPriority = (selectedDesignation) => {
    const designations = ["MANAGER", "SUPERVISOR", "TECHNICIAN", "WORKER"];
    let priority = 1;

    // Set the selected designation as the highest priority
    designationPriorityMap.set(selectedDesignation, priority++);

    // Set the remaining designations in order, excluding the selected one
    for (const designation of designations) {
        if (designation !== selectedDesignation) {
            designationPriorityMap.set(designation, priority++);
        }
    }
};

// Function to sort staff by designation with updated priority
const sortStaffByDesignation = (staffList) => {
    return staffList.sort((a, b) => {
        const priorityA = designationPriorityMap.get(a.designation?.toUpperCase()) || Number.MAX_VALUE;
        const priorityB = designationPriorityMap.get(b.designation?.toUpperCase()) || Number.MAX_VALUE;

        return priorityA - priorityB; // Ascending order based on priority
    });
};
// Event listener for sorting
document.getElementById("sortByDesignation").addEventListener("click", () => {
    isSortedAscending = !isSortedAscending; // Toggle sorting order
    renderStaffTable(); // Re-render the table
});


document.getElementById("sortByDesignation").addEventListener("click", () => {
    toggleSort(); // Toggle sort order
});

 

// Render Staff Table
// Function to render staff table with dynamic priority
const renderStaffTable = async () => {
    try {
        toggleLoading(true);

        // Get selected designation from dropdown
        const selectedDesignation = document.getElementById("sortByDesignation").value;

        // Fetch all staff data
        const staffList = await getAllStaff();

        // Update priority map if a specific designation is selected
        if (selectedDesignation !== "ALL") {
            updateDesignationPriority(selectedDesignation.toUpperCase());
        }

        // Sort the staff list based on updated priority
        const sortedStaffList = sortStaffByDesignation(staffList);

        // Clear and populate the table
        staffTableBody.innerHTML = "";
        sortedStaffList.forEach((staff) => {
            const row = `
                <tr>
                    <td>${staff.staffId}</td>
                    <td>${staff.firstName}</td>
                    <td>${staff.lastName}</td>
                    <td>${staff.designation}</td>
                    <td>${staff.gender}</td>
                    <td>${staff.joinedDate}</td>
                    <td>${staff.dob}</td>
                    <td>${staff.addressLine1}</td>
                    <td>${staff.contactNo}</td>
                    <td>${staff.email}</td>
                    <td>${staff.role}</td>
                    <td>
                        <button class="sview-btn" onclick="viewStaff('${staff.staffId}')">View</button>
                        <button class="sedit-btn" onclick="editStaff('${staff.staffId}')">Edit</button>
                        <button class="sdelete-btn" onclick="deleteStaff('${staff.staffId}')">Delete</button>
                        <button class="sdownload-btn" onclick="downloadstaffData('${staff.staffId}')">Download</button>
                    </td>
                </tr>
            `;
            staffTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error rendering staff table:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to load staff data. Please try again.",
            confirmButtonText: "OK",
        });
    } finally {
        toggleLoading(false);
    }
};

 

// Function to toggle sorting order and render the table
const toggleSort = () => {
    isSortedAscending = !isSortedAscending; // Toggle the sorting order
    renderStaffTable(); // Re-render the table with the new order
};

 


staffForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get the form data
    const staffData = {
        firstName: document.getElementById("first_name").value,
        lastName: document.getElementById("last_name").value,
        designation: document.getElementById("designation").value,
        gender: document.getElementById("gender").value,
        joinedDate: document.getElementById("joined_date").value,
        dob: document.getElementById("dob").value,
        addressLine1: document.getElementById("address_line1").value,
        addressLine2: document.getElementById("address_line2").value,
        addressLine3: document.getElementById("address_line3").value,
        addressLine4: document.getElementById("address_line4").value,
        addressLine5: document.getElementById("address_line5").value,
        contactNo: document.getElementById("contact_no").value,
        email: document.getElementById("email").value,
        role: document.getElementById("role").value,
    };

    // Simple validation: Check if all required fields are filled
    for (let key in staffData) {
        if (!staffData[key]) {
            Swal.fire({
                icon: 'warning',
                title: 'Validation Error',
                text: `Please fill in the ${key.replace(/([A-Z])/g, ' $1').toLowerCase()}.`,
                confirmButtonText: 'OK',
            });
            return; // Stop further execution if validation fails
        }
    }

    // Additional validation for specific fields

    // Check for a valid email format
    const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailPattern.test(staffData.email)) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please provide a valid email address.',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Check for a valid phone number (numbers only)
    const phonePattern = /^[0-9]{10}$/; // Assuming a 10-digit phone number
    if (!phonePattern.test(staffData.contactNo)) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please provide a valid 10-digit contact number.',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Check if the date of birth is not in the future
    const dobDate = new Date(staffData.dob);
    const today = new Date();
    if (dobDate > today) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Date of birth cannot be in the future.',
            confirmButtonText: 'OK',
        });
        return;
    }

    // Check if the joined date is not in the future
    const joinedDate = new Date(staffData.joinedDate);
    if (joinedDate > today) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Joined date cannot be in the future.',
            confirmButtonText: 'OK',
        });
        return;
    }

    try {
        if (formMode === "EDIT" && currentEditStaffId) {
            // Update existing staff
            await updateStaff(currentEditStaffId, staffData);
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Staff data has been successfully updated.',
                confirmButtonText: 'OK',
            });

            formMode = "ADD";
            currentEditStaffId = null;
        } else {
            // Add new staff
            await createStaff(staffData);
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Staff data has been successfully saved.',
                confirmButtonText: 'OK',
            });
        }

        renderStaffTable();
        hidePopup();
        staffForm.reset();
    } catch (error) {
        console.error("Error saving staff:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save staff data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
});

    
window.editStaff = async (staffId) => {
    try {
        console.log("Fetching staff data for ID:", staffId);
        const staff = await getSingleStaff(staffId);

        // Populate the form with fetched data
        document.getElementById("first_name").value = staff.firstName || "";
        document.getElementById("last_name").value = staff.lastName || "";
        document.getElementById("designation").value = staff.designation || "";
        document.getElementById("gender").value = staff.gender || "";
        document.getElementById("joined_date").value = staff.joinedDate || "";
        document.getElementById("dob").value = staff.dob || "";
        document.getElementById("address_line1").value = staff.addressLine1 || "";
        document.getElementById("address_line2").value = staff.addressLine2 || "";
        document.getElementById("address_line3").value = staff.addressLine3 || "";
        document.getElementById("address_line4").value = staff.addressLine4 || "";
        document.getElementById("address_line5").value = staff.addressLine5 || "";
        document.getElementById("contact_no").value = staff.contactNo || "";
        document.getElementById("email").value = staff.email || "";
        document.getElementById("role").value = staff.role || "";

        // Show popup in edit mode
        showPopup("EDIT", staffId);
    } catch (error) {
        console.error("Error fetching staff data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch staff data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
};


// View Vehicle (GET)
window.viewStaff = async (staffId) => {
    try {
        const staff = await getSingleStaff(staffId);
        
        // Show detailed information about the vehicle
        Swal.fire({
            title: `Staff Details: ${staffId}`,
            html: `
                <p><strong>First Name:</strong> ${staff.firstName }</p>
                <p><strong>Last Name:</strong> ${staff.lastName }</p>
                <p><strong>Designation:</strong> ${staff.designation }</p>
                <p><strong>Gender:</strong> ${staff.gender}</p>
                <p><strong>Joined Date:</strong> ${staff.joinedDate}</p>
                <p><strong>Date Of Birth:</strong> ${staff.dob}</p>
                <p><strong>Address:</strong> ${staff.addressLine1 }</p>
                <p><strong>Contact No:</strong> ${staff.contactNo}</p>
                <p><strong>Email:</strong> ${staff.email}</p>
                <p><strong>Role:</strong> ${staff.role }</p>
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


// Convert an array of objects (vehicle data) to CSV
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
const downloadstaffData = async (staffId) => {
    try {
        // Fetch the data for the specific vehicle
        const staff = await getSingleStaff(staffId);

        // Convert the data to CSV format
        const csvData = convertToCSV([staff]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `staff_${staffId}_data.csv`;  // Filename for the downloaded file
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

// Event Listeners
// addStaffBtn.addEventListener("click", showPopup);
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);
document.getElementById("sortByDesignation").addEventListener("change", renderStaffTable);
// Event listener to trigger sorting (attach to a sort button or column header)
document.getElementById("sortByDesignation").addEventListener("click", toggleSort);
// Load table data on page load
document.addEventListener("DOMContentLoaded", renderStaffTable);
