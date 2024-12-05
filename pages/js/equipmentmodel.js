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
    // Show confirmation alert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true, // This places 'No' button first
    });

    // If user clicks 'Yes'
    if (result.isConfirmed) {
        const token = getToken();
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        // Send DELETE request to the API
        const response = await fetch(`${API_BASE_URL}/${equipmentId}`, {
            method: "DELETE",
            headers,
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        // Show success alert if equipment is deleted
        Swal.fire({
            icon: "success",
            title: "Deleted!",
            text: "Equipment has been successfully deleted.",
            confirmButtonText: "OK",
        }).then(() => {
            renderEquipmentTable(); // Re-render the equipment table after deletion
        });
    } else {
        // If user clicks 'No' or closes the alert, do nothing
        Swal.fire({
            icon: 'info',
            title: 'Cancelled',
            text: 'The equipment has not been deleted.',
            confirmButtonText: 'OK'
        });
    }
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
let isMechanicalFirst = true; // Declare this variable globally to toggle sorting by type

// Function to sort equipment based on type (Mechanical, Electrical, etc.)
const sortEquipmentByType = (equipment) => {
    return equipment.sort((a, b) => {
        const typeA = a.type.trim().toLowerCase();
        const typeB = b.type.trim().toLowerCase();

        // Prioritize "Mechanical" first when isMechanicalFirst is true, otherwise prioritize "Electrical"
        if (isMechanicalFirst) {
            // If both types are "mechanical" or both are "electrical", compare alphabetically
            if (typeA === "mechanical" && typeB !== "mechanical") return -1; // Mechanical first
            if (typeB === "mechanical" && typeA !== "mechanical") return 1;  // Mechanical first
            return typeA.localeCompare(typeB); // Default alphabetical comparison for other types
        } else {
            // If both types are "mechanical" or both are "electrical", compare alphabetically
            if (typeA === "electrical" && typeB !== "electrical") return -1; // Electrical first
            if (typeB === "electrical" && typeA !== "electrical") return 1;  // Electrical first
            return typeA.localeCompare(typeB); // Default alphabetical comparison for other types
        }
    });
};

 
const renderEquipmentTable = async () => {
    try {
        toggleLoading(true);
        let equipmentList = await getAllEquipment(); // Fetch all equipment data

        // Get selected equipment type from the dropdown
        const selectedType = document.getElementById("equipmentTypeSelector").value;

        // Filter equipment by selected type (if any)
        if (selectedType !== "ALL") {
            equipmentList = equipmentList.filter(equipment => equipment.type === selectedType);
        }

        // Sort the equipment list based on equipment type
        equipmentList = sortEquipmentByType(equipmentList);

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
                        <button class="view-btn" onclick="viewEquipment('${equipment.equipmentId}')">View</button>
                        <button class="edit-btn" onclick="editEquipment('${equipment.equipmentId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                        <button class="download-btn" onclick="downloadEquipmentData('${equipment.equipmentId}')">Download</button>
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


const toggleSortingOrderByType = () => {
    isMechanicalFirst = !isMechanicalFirst; // Toggle the sorting preference for equipment type
    renderEquipmentTable(); // Re-render the table with the new sorting order
};

 //save and update
equipmentForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const equipmentData = {
        name: document.getElementById("equipmentName").value,
        type: document.getElementById("equipmentType").value,
        status: document.getElementById("equipmentStatus").value,
        staffId: document.getElementById("staffId").value,
        fieldCode: document.getElementById("fieldCode").value,
    };

    // Simple Validation
    let validationError = false;
    let errorMessage = "";

    // Check if the required fields are filled
    if (!equipmentData.name) {
        validationError = true;
        errorMessage = "Equipment name is required.";
    } else if (!equipmentData.type) {
        validationError = true;
        errorMessage = "Equipment type is required.";
    } else if (!equipmentData.status) {
        validationError = true;
        errorMessage = "Equipment status is required.";
    } else if (!equipmentData.staffId) {
        validationError = true;
        errorMessage = "Staff ID is required.";
    } else if (!equipmentData.fieldCode) {
        validationError = true;
        errorMessage = "Field code is required.";
    }

    // If validation fails, show error message and stop the form submission
    if (validationError) {
        Swal.fire({
            icon: "error",
            title: "Validation Error",
            text: errorMessage,
            confirmButtonText: "OK",
        });
        return; // Stop execution if validation fails
    }

    try {
        // Check if we are in EDIT mode and have the current edit ID
        if (formMode === "EDIT" && currentEditEquipmentId) {
            // Update equipment
            await updateEquipment(currentEditEquipmentId, equipmentData);
            Swal.fire({
                icon: "success",
                title: "Updated!",
                text: "Equipment data has been successfully updated.",
                confirmButtonText: "OK",
            });
            // Reset form mode and edit ID after update
            formMode = "ADD";
            currentEditEquipmentId = null;
        } else {
            // Create new equipment
            await createEquipment(equipmentData);
            Swal.fire({
                icon: "success",
                title: "Saved!",
                text: "Equipment data has been successfully saved.",
                confirmButtonText: "OK",
            });
        }

        // Re-render the table and reset the form
        renderEquipmentTable();
        hidePopup();
        equipmentForm.reset(); // Clear the form after submission

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

// View Equipment (Details)
window.viewEquipment = async (equipmentId) => {
    try {
        // Fetch equipment details using its ID
        const equipment = await getSingleEquipment(equipmentId);

        // Populate a modal or alert with the details

        swal.fire({
            title: `Vehicle Details: ${equipmentId}`,
            html:`  <b>ID:</b> ${equipment.equipmentId}<br>
            <b>Name:</b> ${equipment.name}<br>
            <b>Type:</b> ${equipment.type}<br><strong>Equipment Details:</strong><br>
            <b>Status:</b> ${equipment.status}<br>
            <b>Staff ID:</b> ${equipment.staffId}<br>
            <b>Field Code:</b> ${equipment.fieldCode}<br>  `,

            confirmButtonText: "Close"

        })
         

        
        
    } catch (error) {
        console.error("Error viewing equipment data:", error);
        Swal.fire({
            icon: "error",
            title: "Error",
            text: "Failed to fetch equipment details. Please try again.",
            confirmButtonText: "OK",
        });
    }
};

const showModal = (action, equipmentId) => {
    switch (action) {
        case "VIEW":
            viewEquipment(equipmentId);
            break;
        case "EDIT":
            editEquipment(equipmentId);
            break;
        case "DELETE":
            deleteEquipment(equipmentId);
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
const downloadEquipmenteData = async (equipmentId) => {
    try {
        // Fetch the data for the specific vehicle
        // const vehicle = await getSingleVehicle(equipmentId);
        const equipment = await getSingleEquipment(equipmentId);

        // Convert the data to CSV format
        const csvData = convertToCSV([equipment]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `equipment_${equipmentId}_data.csv`;  // Filename for the downloaded file
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
document.addEventListener("DOMContentLoaded", renderEquipmentTable);
