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


// Delete Staff (DELETE)
const deleteStaff = async (staffId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

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
        renderStaffTable();
    });

  


    // const result = await response.json();
    // return result;
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

// Render Staff Table
const renderStaffTable = async () => {
    try {
        toggleLoading(true);
        const staffList = await getAllStaff();
        staffTableBody.innerHTML = ""; // Clear the table

        staffList.forEach((staff) => {
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
                        <button class="edit-btn" onclick="editStaff('${staff.staffId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteStaff('${staff.staffId}')">Delete</button>
                    </td>
                </tr>
            `;
            staffTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading staff data:", error);
        alert("Failed to load staff data.");
    } finally {
        toggleLoading(false);
    }
};

// Save or Update Staff
staffForm.addEventListener("submit", async (event) => {
    event.preventDefault();

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


// Event Listeners
// addStaffBtn.addEventListener("click", showPopup);
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Load table data on page load
document.addEventListener("DOMContentLoaded", renderStaffTable);
