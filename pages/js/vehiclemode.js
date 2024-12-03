const API_BASE_URL = "http://localhost:8080/api/v1/vehicles";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditVehicleId = null;

// Create Vehicle (POST)
const createVehicle = async (vehicleData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Get All Vehicles (GET)
const getAllVehicles = async () => {
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

    const vehicleList = await response.json();
    return vehicleList;
};

// Get Single Vehicle (GET)
const getSingleVehicle = async (vehicleId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const vehicle = await response.json();
    return vehicle;
};

// Update Vehicle (PATCH)
const updateVehicle = async (vehicleId, vehicleData) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: "PATCH",
        headers,
        body: JSON.stringify(vehicleData),
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Delete Vehicle (DELETE)
const deleteVehicle = async (vehicleId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${vehicleId}`, {
        method: "DELETE",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    Swal.fire({
        icon: "success",
        title: "Deleted!",
        text: "Vehicle has been successfully deleted.",
        confirmButtonText: "OK",
    }).then(() => {
        renderVehicleTable();
    });
};

// Elements
const addVehicleBtn = document.getElementById("addVehicleBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const vehicleForm = document.getElementById("vehicle-form");
const vehicleTableBody = document.querySelector("#vehicleTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", vehicleId = null) => {
    popupForm.style.display = "block";
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditVehicleId = vehicleId;
    } else {
        formMode = "ADD";
        currentEditVehicleId = null;
        vehicleForm.reset(); // Reset the form fields for "ADD" mode
    }
};


// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Render Vehicle Table
const renderVehicleTable = async () => {
    try {
        toggleLoading(true);
        const vehicleList = await getAllVehicles();
        vehicleTableBody.innerHTML = ""; // Clear the table

        vehicleList.forEach((vehicle) => {
            const row = `
                <tr>
                    <td>${vehicle.vehicleCode}</td>
                    <td>${vehicle.fuelType}</td>
                    <td>${vehicle.licensePlateNumber}</td>
                    <td>${vehicle.remarks}</td>
                    <td>${vehicle.status}</td>
                    <td>${vehicle.vehicleCategory}</td>
                    <td>${vehicle.staffId}</td>
                    <td>
                        <button class="edit-btn" onclick="editVehicle('${vehicle.vehicleCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteVehicle('${vehicle.vehicleCode}')">Delete</button>
                    </td>
                </tr>
            `;
            vehicleTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading vehicle data:", error);
        alert("Failed to load vehicle data.");
    } finally {
        toggleLoading(false);
    }
};

// Save or Update Vehicle
vehicleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const vehicleData = {
        fuelType: document.getElementById("fuelType").value,
        licensePlateNumber: document.getElementById("plateNumber").value,
        remarks: document.getElementById("remarks").value,
        status: document.getElementById("status").value,
        vehicleCategory: document.getElementById("category").value,
        staffId: document.getElementById("staffId").value,
    };

    try {
        if (formMode === "EDIT" && currentEditVehicleId) {
            await updateVehicle(currentEditVehicleId, vehicleData);
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Vehicle data has been successfully updated.",
                confirmButtonText: "OK",
            });
            // Reset form mode after update
            formMode = "ADD";
            currentEditVehicleId = null;
        } else {
            await createVehicle(vehicleData);
            Swal.fire({
                icon: "success",
                title: "Saved!",
                text: "Vehicle data has been successfully saved.",
                confirmButtonText: "OK",
            });
        }

        renderVehicleTable();
        hidePopup();
        vehicleForm.reset();
    } catch (error) {
        console.error("Error saving vehicle:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to save vehicle data. Please try again.",
            confirmButtonText: "OK",
        });
    }
});


// Edit Vehicle
window.editVehicle = async (vehicleId) => {
    try {
        const vehicle = await getSingleVehicle(vehicleId);

        // Populate the form with fetched data
        document.getElementById("fuelType").value = vehicle.fuelType || "";
        document.getElementById("plateNumber").value = vehicle.licensePlateNumber || "";
        document.getElementById("remarks").value = vehicle.remarks || "";
        document.getElementById("status").value = vehicle.status || "";
        document.getElementById("category").value = vehicle.vehicleCategory || "";
        document.getElementById("staffId").value = vehicle.staffId || "";

        // Show popup in edit mode
        showPopup("EDIT", vehicleId);
    } catch (error) {
        console.error("Error fetching vehicle data:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch vehicle data. Please try again.",
            confirmButtonText: "OK",
        });
    }
};

// Event Listeners
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Load table data on page load
document.addEventListener("DOMContentLoaded", renderVehicleTable);
