const API_BASE_URL = "http://localhost:8080/api/v1/crop";

// Utility: Fetch token from local storage
const getToken = () => localStorage.getItem("token");

// Utility: Display or hide loading spinner
const toggleLoading = (show) => {
    loadingSpinner.style.display = show ? "block" : "none";
};

let formMode = "ADD"; // Can be "ADD" or "EDIT"
let currentEditCropId = null;

// Create Crop (POST)
const createCrop = async (cropData) => {
    const token = getToken();
     
  // Append JSON data

    const headers = {
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers,
        body: cropData, // Send FormData
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }
};
//updatecrop
const updateCrop = async (cropId, cropData) => {
    const token = getToken();
    try {
        const response = await fetch(`${API_BASE_URL}/${cropId}`, {
            method: "PATCH",
            headers: {
                "Authorization": `Bearer ${token}`, // Only Authorization, FormData handles Content-Type
            },
            body: cropData, // FormData with multipart data
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Update failed: ${errorText}`);
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        
    } catch (error) {
        console.error("Error updating crop:", error);
        throw error;
    }
};

// Get All Crops (GET)
const getAllCrops = async () => {
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

    const cropsList = await response.json();
    return cropsList;
};

// Get Single Crop (GET)
const getSingleCrop = async (cropId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

    const response = await fetch(`${API_BASE_URL}/${cropId}`, {
        method: "GET",
        headers,
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const crop = await response.json();
    return crop;
};

 
const deleteCrop = async (cropId) => {
    // Show confirmation prompt using SweetAlert
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'No, cancel!',
        reverseButtons: true
    });

    // If user clicked "Yes"
    if (result.isConfirmed) {
        const token = getToken();
        const headers = {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`,
        };

        try {
            const response = await fetch(`${API_BASE_URL}/${cropId}`, {
                method: "DELETE",
                headers,
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            Swal.fire({
                icon: 'success',
                title: 'Deleted!',
                text: 'Crop has been successfully deleted.',
                confirmButtonText: 'OK',
            }).then(() => {
                renderCropTable();
            });
        } catch (error) {
            console.error("Error deleting crop:", error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to delete crop data. Please try again.',
                confirmButtonText: 'OK',
            });
        }
    } else {
        // If user clicked "No", do nothing
        Swal.fire({
            icon: 'info',
            title: 'Cancelled',
            text: 'Your crop data is safe!',
        });
    }
};


// Elements
const addCropBtn = document.getElementById("addStaffBtn");
const popupForm = document.getElementById("popupForm");
const closeModal = document.getElementById("closeModal");
const cancelBtn = document.getElementById("cancelBtn");
const cropForm = document.getElementById("cropForm");
const cropTableBody = document.querySelector("#cropTable tbody");
const loadingSpinner = document.getElementById("loadingSpinner");

// Show Popup Form
const showPopup = (mode = "ADD", cropId = null) => {
    popupForm.style.display = "flex";

    if (mode === "EDIT") {
        formMode = "EDIT";
        currentEditCropId = cropId;
    } else {
        formMode = "ADD";
        currentEditCropId = null;
        cropForm.reset();
    }
};

// Hide Popup Form
const hidePopup = () => {
    popupForm.style.display = "none";
};

 

// Render Crop Table with Sorting
const renderCropTable = async () => {
    try {
        toggleLoading(true);
        let cropsList = await getAllCrops();
        
        // Get sorting option
        const sortOption = document.getElementById("sortOption").value;
        
        // Sort crops based on the selected option
        cropsList = sortOption === "asc" 
            ? cropsList.sort((a, b) => a.cropCommonName.localeCompare(b.cropCommonName))
            : cropsList.sort((a, b) => b.cropCommonName.localeCompare(a.cropCommonName));

        cropTableBody.innerHTML = "";

        cropsList.forEach((crop) => {
            const row = `
                <tr>
                    <td>${crop.cropCode}</td>
                    <td>${crop.cropCommonName}</td>
                    <td>${crop.cropScientificName}</td>
                    <td><img src="data:image/png;base64,${crop.cropImage}" alt="${crop.cropCommonName}" width="50"></td>
                    <td>${crop.category}</td>
                    <td>${crop.cropSeason}</td>
                    <td>${crop.fieldCode}</td>
                    <td>
                         <button class="view-btn" onclick="viewCrop('${crop.cropCode}')">View</button>
                        <button class="edit-btn" onclick="editCrop('${crop.cropCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteCrop('${crop.cropCode}')">Delete</button>
                        <button class="download-btn" onclick="downloadcropData('${crop.cropCode}')">Download</button>
                    </td>
                </tr>
            `;
            cropTableBody.innerHTML += row;
        });
    } catch (error) {
        console.error("Error loading crop data:", error);
        alert("Failed to load crop data.");
    } finally {
        toggleLoading(false);
    }
};

// Event listener for sorting option change
document.getElementById("sortOption").addEventListener("change", renderCropTable);

// Initialize the crop table with sorting functionality
renderCropTable();

// Save or Update Crop
// cropForm.addEventListener("submit", async (event) => {
//     event.preventDefault();

    


//             const formdata = new FormData();
//         formdata.append("cropCommonName",document.getElementById("cropCommonName").value);
//         formdata.append("cropScientificName", document.getElementById("cropScientificName").value);
//         formdata.append("cropImage", document.getElementById("cropImage").files[0],  document.getElementById("cropImage").files[0].name);
//         formdata.append("category",  document.getElementById("category").value);
//         formdata.append("cropSeason",  document.getElementById("cropSeason").value);
//         formdata.append("filedCode", document.getElementById("fieldCode").value);

//     try {
//         if (formMode === "EDIT" && currentEditCropId) {
//             await updateCrop(currentEditCropId, formdata);
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Updated!',
//                 text: 'Crop data has been successfully updated.',
//                 confirmButtonText: 'OK',
//             });
//         } else {
//             await createCrop(formdata);
//             Swal.fire({
//                 icon: 'success',
//                 title: 'Saved!',
//                 text: 'Crop data has been successfully saved.',
//                 confirmButtonText: 'OK',
//             });
//         }

//         renderCropTable();
//         hidePopup();
//         cropForm.reset();
//     } catch (error) {
//         console.error("Error saving crop:", error);
//         Swal.fire({
//             icon: 'error',
//             title: 'Error',
//             text: 'Failed to save crop data. Please try again.',
//             confirmButtonText: 'OK',
//         });
//     }
// });

cropForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    // Get form field values
    const cropCommonName = document.getElementById("cropCommonName").value;
    const cropScientificName = document.getElementById("cropScientificName").value;
    const cropImage = document.getElementById("cropImage").files[0];
    const category = document.getElementById("category").value;
    const cropSeason = document.getElementById("cropSeason").value;
    const fieldCode = document.getElementById("fieldCode").value;

    // Validation
    if (!cropCommonName || !cropScientificName || !cropImage || !category || !cropSeason || !fieldCode) {
        Swal.fire({
            icon: 'warning',
            title: 'Validation Error',
            text: 'Please fill in all required fields.',
            confirmButtonText: 'OK',
        });
        return; // Stop form submission if validation fails
    }

    const formdata = new FormData();
    formdata.append("cropCommonName", cropCommonName);
    formdata.append("cropScientificName", cropScientificName);
    formdata.append("cropImage", cropImage, cropImage.name);
    formdata.append("category", category);
    formdata.append("cropSeason", cropSeason);
    formdata.append("filedCode", fieldCode);

    try {
        if (formMode === "EDIT" && currentEditCropId) {
            await updateCrop(currentEditCropId, formdata);
            Swal.fire({
                icon: 'success',
                title: 'Updated!',
                text: 'Crop data has been successfully updated.',
                confirmButtonText: 'OK',
            });
        } else {
            await createCrop(formdata);
            Swal.fire({
                icon: 'success',
                title: 'Saved!',
                text: 'Crop data has been successfully saved.',
                confirmButtonText: 'OK',
            });
        }

        renderCropTable();
        hidePopup();
        cropForm.reset();
    } catch (error) {
        console.error("Error saving crop:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to save crop data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
});


// Edit Crop (Open Popup)
window.editCrop = async (cropId) => {
    try {
        const crop = await getSingleCrop(cropId);

        // Populate form fields
        document.getElementById("cropCommonName").value = crop.cropCommonName || "";
        document.getElementById("cropScientificName").value = crop.cropScientificName || "";
        document.getElementById("category").value = crop.category || "";
        document.getElementById("cropSeason").value = crop.cropSeason || "";
        document.getElementById("fieldCode").value = crop.fieldCode || "";

        // Reset file input and set image preview
        const fileInput = document.getElementById("cropImage");
        fileInput.value = ""; // Clear file input

        const imagePreview = document.getElementById("imagePreview");
        if (crop.cropImage) {
            imagePreview.src = `data:image/png;base64,${crop.cropImage}`; // Update preview with base64 image
            imagePreview.style.display = "block"; // Show preview
        } else {
            imagePreview.src = ""; // Clear preview if no image
            imagePreview.style.display = "none"; // Hide preview element
        }

        showPopup("EDIT", cropId);
    } catch (error) {
        console.error("Error fetching crop data:", error);
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'Failed to fetch crop data. Please try again.',
            confirmButtonText: 'OK',
        });
    }
};


// View Vehicle (GET)
window.viewCrop = async (cropId) => {
    try {
        const crop = await getSingleCrop(cropId);
        
        // Show detailed information about the vehicle
        Swal.fire({
            title: `Crop Details: ${cropId}`,
            html: `
                <p><strong>Crop Code:</strong> ${crop.cropCode }</p>
                <p><strong>Crop Common Name:</strong> ${crop.cropCommonName}</p>
                <p><strong>Crop Scientific Name:</strong> ${crop.cropScientificName}</p>
                <p><strong>Crop Image:</strong> <img src="data:image/png;base64,${crop.cropImage}" alt="${crop.cropCommonName}" width="50"</p>
                <p><strong>Category:</strong> ${crop.category}</p>
                <p><strong>Crop Season:</strong> ${crop.cropSeason}</p>
                <p><strong>Field Code:</strong> ${crop.fieldCode}</p>
                
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
const downloadcropData = async (cropId) => {
    try {
        // Fetch the data for the specific vehicle
        const crop = await getSingleCrop(cropId);

        // Convert the data to CSV format
        const csvData = convertToCSV([crop]);  // Wrap the vehicle in an array

        // Create a Blob from the CSV data
        const blob = new Blob([csvData], { type: "text/csv" });
        const url = URL.createObjectURL(blob);

        // Create a temporary anchor element to trigger the download
        const a = document.createElement("a");
        a.href = url;
        a.download = `crop_${cropId}_data.csv`;  // Filename for the downloaded file
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




const previewImage = (event) => {
    const reader = new FileReader();
    reader.onload = function () {
        const imagePreview = document.getElementById("imagePreview");
        imagePreview.src = reader.result; // Display uploaded image
    };
    if (event.target.files[0]) {
        reader.readAsDataURL(event.target.files[0]);
    }
};

// Attach event listener to the file input
document.getElementById("cropImage").addEventListener("change", previewImage);

// Event Listeners
closeModal.addEventListener("click", hidePopup);
cancelBtn.addEventListener("click", hidePopup);

// Initialize the crop table
renderCropTable();
