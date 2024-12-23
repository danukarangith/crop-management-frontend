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

 


const deleteVehicle = async (vehicleId) => {
    // Show confirmation dialog
    Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to undo this action!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes, delete it!",
        cancelButtonText: "No, cancel!",
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            // Proceed with deletion if user clicks "Yes"
            try {
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
                    renderVehicleTable();  // Refresh the table after deletion
                });
            } catch (error) {
                Swal.fire({
                    icon: "error",
                    title: "Error!",
                    text: `Failed to delete the vehicle. ${error.message}`,
                    confirmButtonText: "OK",
                });
            }
        } else {
            // If user clicks "No", do nothing (alert will close)
            Swal.fire({
                icon: "info",
                title: "Cancelled",
                text: "The vehicle deletion was cancelled.",
                confirmButtonText: "OK",
            });
        }
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

 
// Sort vehicles by vehicleType
// Sort vehicles by status (Active first, then Non-Active)
let isActiveFirst = true; // Declare this variable globally

// Function to sort vehicles based on status
const sortVehiclesByStatus = (vehicles) => {
    return vehicles.sort((a, b) => {
        const statusA = a.status === 'Active' ? 1 : 0;
        const statusB = b.status === 'Active' ? 1 : 0;
        
        // Toggle sorting based on the isActiveFirst value
        if (isActiveFirst) {
            return statusB - statusA; // Active vehicles first
        } else {
            return statusA - statusB; // Non-active vehicles first
        }
    });
};

// Render Vehicle Table with Sorting
const renderVehicleTable = async () => {
    try {
        toggleLoading(true);
        let vehicleList = await getAllVehicles();
        
        // Sort the vehicle list based on the active/non-active status
        vehicleList = sortVehiclesByStatus(vehicleList);

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
                        <button class="view-btn" onclick="viewVehicle('${vehicle.vehicleCode}')">View</button>
                        <button class="edit-btn" onclick="editVehicle('${vehicle.vehicleCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteVehicle('${vehicle.vehicleCode}')">Delete</button>
                        <button class="download-btn" onclick="downloadVehicleData('${vehicle.vehicleCode}')">Download</button>
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
const toggleSort = () => {
    isActiveFirst = !isActiveFirst; // Toggle the sorting order
    renderVehicleTable(); // Re-render the table with the new order
};




// Save or Update Vehicle
vehicleForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get the form values
    const fuelType = document.getElementById("fuelType").value;
    const licensePlateNumber = document.getElementById("plateNumber").value;
    const remarks = document.getElementById("remarks").value;
    const status = document.getElementById("status").value;
    const vehicleCategory = document.getElementById("category").value;
    const staffId = document.getElementById("staffId").value;

    // Simple validation
    let validationError = false;
    let errorMessage = "";

    if (!fuelType) {
        validationError = true;
        errorMessage = "Fuel type is required.";
    } else if (!licensePlateNumber) {
        validationError = true;
        errorMessage = "License plate number is required.";
    } else if (licensePlateNumber.length < 5) {
        validationError = true;
        errorMessage = "License plate number must be at least 5 characters long.";
    } else if (!status) {
        validationError = true;
        errorMessage = "Status is required.";
    } else if (!vehicleCategory) {
        validationError = true;
        errorMessage = "Vehicle category is required.";
    } else if (!staffId) {
        validationError = true;
        errorMessage = "Staff ID is required.";
    } else if (remarks.length > 200) {
        validationError = true;
        errorMessage = "Remarks cannot exceed 200 characters.";
    }

    if (validationError) {
        // Show validation error message
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: errorMessage,
            confirmButtonText: "OK",
            customClass: {
                popup: 'swal-popup-front'  // This will apply custom styling to SweetAlert
            }
        });
        
        return; // Stop form submission if validation fails
    }

    const vehicleData = {
        fuelType,
        licensePlateNumber,
        remarks,
        status,
        vehicleCategory,
        staffId,
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

// View Vehicle (GET)
window.viewVehicle = async (vehicleId) => {
    try {
        const vehicle = await getSingleVehicle(vehicleId);
        
        // Show detailed information about the vehicle
        Swal.fire({
            title: `Vehicle Details: ${vehicleId}`,
            html: `
                <p><strong>Fuel Type:</strong> ${vehicle.fuelType}</p>
                <p><strong>License Plate Number:</strong> ${vehicle.licensePlateNumber}</p>
                <p><strong>Remarks:</strong> ${vehicle.remarks}</p>
                <p><strong>Status:</strong> ${vehicle.status}</p>
                <p><strong>Category:</strong> ${vehicle.vehicleCategory}</p>
                <p><strong>Staff ID:</strong> ${vehicle.staffId}</p>
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
// Show a modal for View/Edit/Delete actions
const showModal = (action, vehicleId) => {
    switch (action) {
        case "VIEW":
            viewVehicle(vehicleId);
            break;
        case "EDIT":
            editVehicle(vehicleId);
            break;
        case "DELETE":
            deleteVehicle(vehicleId);
            break;
        default:
            console.error("Unknown action: ", action);
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
const downloadVehicleData = async (vehicleId) => {
    try {
        // Fetch the data for the specific vehicle
        const vehicle = await getSingleVehicle(vehicleId);

        // Convert the data to CSV format
        const csvData = convertToCSV([vehicle]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `vehicle_${vehicleId}_data.csv`;  // Filename for the downloaded file
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
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Load table data on page load
document.addEventListener("DOMContentLoaded", renderVehicleTable);
// Event listener to handle sorting change
document.getElementById("sortBy").addEventListener("change", renderVehicleTable);

