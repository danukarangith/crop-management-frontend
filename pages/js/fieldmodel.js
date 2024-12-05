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

// Delete Field (DELETE)
const deleteField = async (fieldId) => {
    const token = getToken();
    const headers = {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
    };

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
        renderFieldTable();
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
const renderFieldTable = async () => {
    try {
        toggleLoading(true);
        const fieldsList = await getAllFields();
        fieldTableBody.innerHTML = "";

        fieldsList.forEach((field) => {
            const row = `
                <tr>
                    <td>${field.fieldCode}</td>
                    <td>${field.extendSize}</td>
                    <td><img src="data:image/png;base64,${field.fieldImage1}" alt="${field.fieldName}" width="50"></td>
                    <td><img src="data:image/png;base64,${field.fieldImage2}" alt="${field.fieldName}" width="50"></td>
                    <td>${field.fieldLocation.x},${field.fieldLocation.y}</td>
                    <td>${field.fieldName}</td>
                    <td>
                        <button class="edit-btn" onclick="editField('${field.fieldCode}')">Edit</button>
                        <button class="delete-btn" onclick="deleteField('${field.fieldCode}')">Delete</button>
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

// Save or Update Field
fieldForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    let location=document.getElementById("fieldLocation").value 
    const [latitude, longitude] = location.split(',').map(coord => coord.trim());
    

    const formdata = new FormData();
    formdata.append("fieldName", document.getElementById("fieldName").value);
    formdata.append("extentSize", document.getElementById("extendSize").value);
    formdata.append("longitude",longitude);
    formdata.append("latitude",  latitude);
    formdata.append("fieldImage1", document.getElementById("fieldImage1").files[0],document.getElementById("fieldImage1").files[0].name);
    formdata.append("fieldImage2", document.getElementById("fieldImage2").files[0],document.getElementById("fieldImage2").files[0].name);
    formdata.append("staffIds", document.getElementById("staffId").value);

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

// Initial Render
renderFieldTable();

// Add new staff button
addFieldBtn.addEventListener("click", () => showPopup("ADD"));
cancelBtn.addEventListener("click", hidePopup);
closeModal.addEventListener("click", hidePopup);
