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
                         <button class="view-btn" onclick="viewEquipment('${equipment.equipmentId}')">View</button>
                        <button class="edit-btn" onclick="editEquipment('${equipment.equipmentId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteEquipment('${equipment.equipmentId}')">Delete</button>
                        <button class="download-btn" onclick="downloadEquipmenteData('${equipment.equipmentId}')">Download</button>
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
