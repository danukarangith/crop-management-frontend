const API_BASE_URL = "http://localhost:8080/api/v1/equipment";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditEquipmentId = null;

// Create Equipment (POST)
const createEquipment = async (equipmentData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(equipmentData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Get All Equipment (GET)
const getAllEquipment = async () => {
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

    const equipmentList = await response.json();
    return equipmentList;
};

// Get Single Equipment (GET)
const getSingleEquipment = async (equipmentId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${equipmentId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const equipment = await response.json();
    return equipment;
};

// Update Equipment (PATCH)
const updateEquipment = async (equipmentId, equipmentData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${equipmentId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(equipmentData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Delete Equipment (DELETE)
const deleteEquipment = async (equipmentId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${equipmentId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Equipment has been successfully deleted.",
        confirmButtonText: "OK",
    }).then(() => {
        renderEquipmentTable();
    });
};

// Elements
const addEquipmentBtn = document.getElementById("addEquipmentBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const equipmentForm = document.getElementById("staffForm");
const equipmentTableBody = document.querySelector("#staffTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", equipmentId = null) => {
    popupForm.style.display = "block";
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditEquipmentId = equipmentId;
    } else {
        formMode = "ADD";
        currentEditEquipmentId = null;
        equipmentForm.reset(); // Reset the form fields for "ADD" mode
    }
};

// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Render Equipment Table
const renderEquipmentTable = async () => {
    try {
        toggleLoading(true);
        const equipmentList = await getAllEquipment();
        equipmentTableBody.innerHTML = ""; // Clear the table

        equipmentList.forEach((equipment) => {
            const row = `
                <tr>
                    <td>${equipment.equipmentId}</td>
                    <td>${equipment.name}</td>
                    <td>${equipment.type}</td>
                    <td>${equipment.status}</td>
                    <td>${equipment.staffId}</td>
                    <td>${equipment.fieldCode}</td>
                    <td>
                        <button class="edit-btn" onclick="editEquipment('${equipment.equipmentId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                    </td>
                </tr>
            `;
            equipmentTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading equipment data:", error);
        alert("Failed to load equipment data.");
    } finally {
        toggleLoading(false);
    }
};

// Save or Update Equipment
equipmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const equipmentData = {
        name: document.getElementById("equipmentName").value,
        type: document.getElementById("equipmentType").value,
        status: document.getElementById("equipmentStatus").value,
        staffId: document.getElementById("staffId").value,
        fieldCode: document.getElementById("fieldCode").value,
    };

    try {
        if (formMode === "EDIT" && currentEditEquipmentId) {
            await updateEquipment(currentEditEquipmentId, equipmentData);
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Equipment data has been successfully updated.",
                confirmButtonText: "OK",
            });
            // Reset form mode after update
            formMode = "ADD";
            currentEditEquipmentId = null;
        } else {
            await createEquipment(equipmentData);
            Swal.fire({
                icon: "success",
                title: "Saved!",
                text: "Equipment data has been successfully saved.",
                confirmButtonText: "OK",
            });
        }

        renderEquipmentTable();
        hidePopup();
        equipmentForm.reset();
    } catch (error) {
        console.error("Error saving equipment:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save equipment data. Please try again.",
            confirmButtonText: "OK",
        });
    }
});

// Edit Equipment
window.editEquipment = async (equipmentId) => {
    try {
        const equipment = await getSingleEquipment(equipmentId);

        // Populate the form with fetched data
        document.getElementById("equipmentName").value = equipment.name || "";
        document.getElementById("equipmentType").value = equipment.type || "";
        document.getElementById("equipmentStatus").value = equipment.status || "";
        document.getElementById("staffId").value = equipment.staffId || "";
        document.getElementById("fieldCode").value = equipment.fieldCode || "";

        // Show popup in edit mode
        showPopup("EDIT", equipmentId);
    } catch (error) {
        console.error("Error fetching equipment data:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch equipment data. Please try again.",
            confirmButtonText: "OK",
        });
    }
};

// Event Listeners
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Load table data on page load
document.addEventListener("DOMContentLoaded", renderEquipmentTable);
