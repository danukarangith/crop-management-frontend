const API_BASE_URL = "http://localhost:8080/api/v1/field";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditFieldId = null;

// Create Field (POST)
const createField = async (fieldData) => {
    const token = getToken();
    const headers = {
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: fieldData, // Send FormData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};

// Update Field (PATCH)
const updateField = async (fieldId, fieldData) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/${fieldId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`,
            },
            body: fieldData, // FormData with multipart data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Update failed: ${errorText}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

         
    } catch (error) {
        console.error("Error updating field:", error);
        throw error;
    }
};

// Get All Fields (GET)
const getAllFields = async () => {
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

    const fieldsList = await response.json();
    return fieldsList;
};

// Get Single Field (GET)
const getSingleField = async (fieldId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${fieldId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const field = await response.json();
    return field;
};

 
const deleteField = async (fieldId) => {
    // Show confirmation dialog
    Swal.fire({
        title: 'Are you sure?',
        text: "Do you really want to delete this field?",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    }).then(async (result) => {
        if (result.isConfirmed) {
            // If the user clicks "Yes, delete it!"
            const token = getToken();
            const headers = {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`,
            };

            try {
                const response = await fetch(`${API_BASE_URL}/${fieldId}`, {
                    method: "DELETE",
                    headers,
                });

                if (!response.ok) {
                    throw new Error(`HTTP error! Status: ${response.status}`);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Deleted!',
                    text: 'Field has been successfully deleted.',
                    confirmButtonText: 'OK',
                }).then(() => {
                    renderFieldTable(); // Re-render the table after deletion
                });

            } catch (error) {
                Swal.fire({
                    icon: 'error',
                    title: 'Error!',
                    text: `Failed to delete field. ${error.message}`,
                    confirmButtonText: 'OK',
                });
            }
        } else {
            // If the user clicks "No, cancel!"
            Swal.fire({
                icon: 'info',
                title: 'Cancelled',
                text: 'The field was not deleted.',
                confirmButtonText: 'OK',
            });
        }
    });
};

// Elements
const addFieldBtn = document.getElementById("addStaffBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const fieldForm = document.getElementById("staffForm");
const fieldTableBody = document.querySelector("#staffTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", fieldId = null) => {
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditFieldId = fieldId;
    } else {
        formMode = "ADD";
        currentEditFieldId = null;
        fieldForm.reset();
    }
};

// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

// Render Field Table
// const renderFieldTable = async () => {
//     try {
//         toggleLoading(true);
//         const fieldsList = await getAllFields();
//         fieldTableBody.innerHTML = "";

//         fieldsList.forEach((field) => {
//             const row = `
//                 <tr>
//                     <td>${field.fieldCode}</td>
//                     <td>${field.extendSize}</td>
//                     <td><img src="data:image/png;base64,${field.fieldImage1}" alt="${field.fieldName}" width="50"></td>
//                     <td><img src="data:image/png;base64,${field.fieldImage2}" alt="${field.fieldName}" width="50"></td>
//                     <td>${field.fieldLocation.x},${field.fieldLocation.y}</td>
//                     <td>${field.fieldName}</td>
//                     <td>
//                         <button class="view-btn" onclick="viewField('${field.fieldCode}')">View</button>
//                         <button class="edit-btn" onclick="editField('${field.fieldCode}')">Edit</button>
//                         <button class="delete-btn" onclick="deleteField('${field.fieldCode}')">Delete</button>
//                          <button class="download-btn" onclick="downloadfieldData('${field.fieldCode}')">Download</button>
//                     </td>
//                 </tr>
//             `;
//             fieldTableBody.innerHTML += row;
//         });
//     } catch (error) {
//         console.error("Error loading field data:", error);
//         alert("Failed to load field data.");
//     } finally {
//         toggleLoading(false);
//     }
// };

 
 // Add a dropdown to filter by extend size
const sizeFilterDropdown = document.getElementById("sizeFilter");

let extendSizeFilter = "all"; // Default filter to 'all'

const filterByExtendSize = () => {
    extendSizeFilter = sizeFilterDropdown.value; // Get the selected value
    renderFieldTable(); // Re-render table based on selected size
};

// Render Field Table with filtering by extend size
const renderFieldTable = async () => {
    try {
        toggleLoading(true);
        const fieldsList = await getAllFields();
        fieldTableBody.innerHTML = "";

        let filteredFields = fieldsList;

        // Filter based on extend size
        if (extendSizeFilter === "1600+") {
            filteredFields = fieldsList.filter(field => field.extendSize > 1600);
        } else if (extendSizeFilter === "1600-") {
            filteredFields = fieldsList.filter(field => field.extendSize <=1600);
        }

        filteredFields.forEach((field) => {
            const row = `
                <tr>
                    <td>${field.fieldCode}</td>
                    <td>${field.extendSize}</td>
                    <td><img src="data:image/png;base64,${field.fieldImage1}" alt="${field.fieldName}" width="50"></td>
                    <td><img src="data:image/png;base64,${field.fieldImage2}" alt="${field.fieldName}" width="50"></td>
                    <td>${field.fieldLocation.x},${field.fieldLocation.y}</td>
                    <td>${field.fieldName}</td>
                    <td>
                        <button class="view-btn" onclick="viewField('${field.fieldCode}')">View</button>
                        <button class="edit-btn" onclick="editField('${field.fieldCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteField('${field.fieldCode}')">Delete</button>
                        <button class="download-btn" onclick="downloadfieldData('${field.fieldCode}')">Download</button>
                    </td>
                </tr>
            `;
            fieldTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading field data:", error);
        alert("Failed to load field data.");
    } finally {
        toggleLoading(false);
    }
};


 


fieldForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get values from the form
    let location = document.getElementById("fieldLocation").value;
    const [latitude, longitude] = location.split(',').map(coord => coord.trim());
    const fieldName = document.getElementById("fieldName").value;
    const extendSize = document.getElementById("extendSize").value;
    const fieldImage1 = document.getElementById("fieldImage1").files[0];
    const fieldImage2 = document.getElementById("fieldImage2").files[0];
    const staffIds = document.getElementById("staffId").value;

    // Simple Validation
    if (!fieldName) {
        return Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Field name is required.',
            confirmButtonText: 'OK',
        });
    }

    if (!location || !latitude || !longitude) {
        return Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Location (latitude and longitude) is required.',
            confirmButtonText: 'OK',
        });
    }

    if (!extendSize) {
        return Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Extend size is required.',
            confirmButtonText: 'OK',
        });
    }

    if (!fieldImage1 || !fieldImage2) {
        return Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Both field images are required.',
            confirmButtonText: 'OK',
        });
    }

    if (!staffIds) {
        return Swal.fire({
            icon: 'error',
            title: 'Validation Error',
            text: 'Staff IDs are required.',
            confirmButtonText: 'OK',
        });
    }

    // Create FormData object and append values
    const formdata = new FormData();
    formdata.append("fieldName", fieldName);
    formdata.append("extentSize", extendSize);
    formdata.append("longitude", longitude);
    formdata.append("latitude", latitude);
    formdata.append("fieldImage1", fieldImage1, fieldImage1.name);
    formdata.append("fieldImage2", fieldImage2, fieldImage2.name);
    formdata.append("staffIds", staffIds);

    try {
        if (formMode === "EDIT" && currentEditFieldId) {
            await updateField(currentEditFieldId, formdata);
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Field data has been successfully updated.',
                confirmButtonText: 'OK',
            });
        } else {
            await createField(formdata);
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Field data has been successfully saved.',
                confirmButtonText: 'OK',
            });
        }

        renderFieldTable();
        hidePopup();
        fieldForm.reset();
    } catch (error) {
        console.error("Error saving field:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save field data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
});


// Edit Field (Open Popup)
window.editField = async (fieldId) => {
    try {
        const field = await getSingleField(fieldId);

        // Populate form fields
        document.getElementById("fieldName").value = field.fieldName || "";
        document.getElementById("extendSize").value = field.extendSize || "";
        document.getElementById("fieldLocation").value = `${field.fieldLocation.x },${field.fieldLocation.y}`|| "";
        document.getElementById("staffId").value = field.staffId || "";

        // Reset file input and set image preview
        const fieldImage1Input = document.getElementById("fieldImage1");
        const fieldImage2Input = document.getElementById("fieldImage2");
        fieldImage1Input.value = ""; // Clear file input
        fieldImage2Input.value = ""; // Clear file input

        const imagePreview1 = document.getElementById("imagePreview1");
        const imagePreview2 = document.getElementById("imagePreview2");
        if (field.fieldImage1) {
            imagePreview1.src = `data:image/png;base64,${field.fieldImage1}`; // Update preview with base64 image
            imagePreview1.style.display = "block"; // Show preview
        } else {
            imagePreview1.style.display = "none"; // Hide preview element
        }
        if (field.fieldImage2) {
            imagePreview2.src = `data:image/png;base64,${field.fieldImage2}`; // Update preview with base64 image
            imagePreview2.style.display = "block"; // Show preview
        } else {
            imagePreview2.style.display = "none"; // Hide preview element
        }

        showPopup("EDIT", fieldId);
    } catch (error) {
        console.error("Error fetching field data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch field data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
};


window.viewField = async (fieldId) => {
    try {
        const field = await getSingleField(fieldId);
        
        // Show detailed information about the vehicle
        Swal.fire({
            title: `Field Details: ${fieldId}`,
            html: `
                <p><strong>Field Code:</strong> ${field.fieldCode}</p>
                <p><strong>Extend Size:</strong> ${field.extendSize}</p>
                <p><strong>Field Image 1:</strong> <img src="data:image/png;base64,${field.fieldImage1}" alt="${field.fieldName}" width="50"</p>
                <p><strong>Field Image 2:</strong> <img src="data:image/png;base64,${field.fieldImage2}" alt="${field.fieldName}" width="50"</p>
                <p><strong>Field Location:</strong> ${field.fieldLocation.x},${field.fieldLocation.y}</p>
                <p><strong>Field Name:</strong> ${field.fieldName}</p>
                
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
const downloadfieldData = async (fieldId) => {
    try {
        // Fetch the data for the specific vehicle
        const field = await getSingleField(fieldId);

        // Convert the data to CSV format
        const csvData = convertToCSV([field]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `field_${fieldId}_data.csv`;  // Filename for the downloaded file
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


// Attach event listeners for image preview
// document.getElementById("fieldImage1").addEventListener("change", (event) => previewImage(event, "imagePreview1"));
// document.getElementById("fieldImage2").addEventListener("change", (event) => previewImage(event, "imagePreview2"));

const previewImage = (event, previewId) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function () {
        document.getElementById(previewId).src = reader.result;
        document.getElementById(previewId).style.display = "block";
    };
    reader.readAsDataURL(file);
};
sizeFilterDropdown.addEventListener("change", filterByExtendSize);

// Initial Render
renderFieldTable();

// Add new staff button
addFieldBtn.addEventListener("click", () => showPopup("ADD"));
cancelBtn.addEventListener("click", hidePopup);
closeModal.addEventListener("click", hidePopup);
