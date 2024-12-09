const API_BASE_URL = "http://localhost:8080/api/v1/user";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditUserId = null;

// Create User (POST)
const createUser = async (userData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Get All Users (GET)
const getAllUsers = async () => {
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

    const userList = await response.json();
    return userList;
};

// Get Single User (GET)
const getSingleUser = async (userId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const user = await response.json();
    return user;
};

// Update User (PATCH)
const updateUser = async (userId, userData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${userId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(userData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Delete User (DELETE)
const deleteUser = async (email) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${email}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "User has been successfully deleted.",
        confirmButtonText: "OK",
    }).then(() => {
        renderUserTable();
    });
};

// Elements
const addUserBtn = document.getElementById("addStaffBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const staffForm = document.getElementById("staffForm");
const staffTableBody = document.querySelector("#staffTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", userId = null) => {
    popupForm.style.display = "block";
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditUserId = userId;
    } else {
        formMode = "ADD";
        currentEditUserId = null;
        staffForm.reset(); // Reset the form fields for "ADD" mode
    }
};

// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Render User Table
const renderUserTable = async () => {
    try {
        toggleLoading(true);
        const userList = await getAllUsers();
        staffTableBody.innerHTML = ""; // Clear the table

        userList.forEach((user) => {
            const row = `
                <tr>
                    <td>${user.email}</td>
                    <td>${user.password}</td>
                    <td>${user.role}</td>
                    <td>
                        <button class="edit-btn" onclick="editUser('${user.userId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteUser('${user.userId}')">Delete</button>
                    </td>
                </tr>
            `;
            staffTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading user data:", error);
        alert("Failed to load user data.");
    } finally {
        toggleLoading(false);
    }
};

// Save or Update User
staffForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const userData = {
        email: document.getElementById("name").value,
        password: document.getElementById("password").value,
        role: document.getElementById("role").value,
    };

    try {
        if (formMode === "EDIT" && currentEditUserId) {
            await updateUser(currentEditUserId, userData);
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "User data has been successfully updated.",
                confirmButtonText: "OK",
            });
            // Reset form mode after update
            formMode = "ADD";
            currentEditUserId = null;
        } else {
            await createUser(userData);
            Swal.fire({
                icon: "success",
                title: "Saved!",
                text: "User data has been successfully saved.",
                confirmButtonText: "OK",
            });
        }

        renderUserTable();
        hidePopup();
        staffForm.reset();
    } catch (error) {
        console.error("Error saving user:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save user data. Please try again.",
            confirmButtonText: "OK",
        });
    }
});

// Edit User
window.editUser = async (userId) => {
    try {
        const user = await getSingleUser(userId);

        // Populate the form with fetched data
        document.getElementById("name").value = user.email || "";
        document.getElementById("password").value = user.password || "";
        document.getElementById("role").value = user.role || "";

        // Show popup in edit mode
        showPopup("EDIT", userId);
    } catch (error) {
        console.error("Error fetching user data:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch user data. Please try again.",
            confirmButtonText: "OK",
        });
    }
};

// Event Listeners
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Load table data on page load
document.addEventListener("DOMContentLoaded", renderUserTable);
