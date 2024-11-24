const API_URL = 'http://localhost:8080/api/v1/vehicles';
let isEditing = false;
let currentVehicleCode = null;


const openModal = document.getElementById("openModal");
const closeModal = document.querySelectorAll(".close-modal, #closeModal");
const modal = document.getElementById("vehicleModal");

openModal.addEventListener("click", () => {
    modal.style.display = "flex";
});

closeModal.forEach((btn) => {
    btn.addEventListener("click", () => {
        modal.style.display = "none";
    });
});

window.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


// Show/hide loading spinner
function toggleLoading(show) {
    document.getElementById('loadingSpinner').style.display = show ? 'block' : 'none';
}
// Enable Enter key to move to the next input field
function enableEnterKeyNavigation() {
    const formElements = document.querySelectorAll('#vehicleForm input, #vehicleForm select, #vehicleForm textarea');

    formElements.forEach((element, index) => {
        element.addEventListener('keydown', (event) => {
            if (event.key === 'Enter') {
                event.preventDefault(); // Prevent form submission on Enter
                const nextElement = formElements[index + 1];
                if (nextElement) {
                    nextElement.focus(); // Focus on the next field
                } else {
                    document.getElementById('saveButton').focus(); // Focus on Save button if it's the last field
                }
            }
        });
    });
}

// Show alert message using SweetAlert2
function showAlert(message, type) {
     // Temporarily hide the Bootstrap modal
     modal.hide();

     Swal.fire({
         icon: type, // 'success', 'error', 'warning', etc.
         title: type === 'success' ? 'Success' : 'Error',
         text: message,
         confirmButtonText: 'OK',
         showCloseButton: true,
         didClose: () => {
             // Bring back the modal (if needed)
             if (isEditing || document.getElementById('vehicleModal').classList.contains('show')) {
                 modal.show();
             }
         }
     });
    
}

// Load all vehicles
async function loadVehicles() {
    try {
        toggleLoading(true);
        const response = await fetch(API_URL);
        const vehicles = await response.json();
        const tbody = document.getElementById('vehicleTableBody');
        tbody.innerHTML = '';

        vehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.vehicleCode}</td>
                <td>${vehicle.fuelType}</td>
                <td>${vehicle.plateNumber}</td>
                <td>${vehicle.remarks || ''}</td>
                <td>${vehicle.status}</td>
                <td>${vehicle.category}</td>
                <td>${vehicle.staffId}</td>
                <td>
                    <button class="btn btn-sm btn-warning me-1" onclick="editVehicle('${vehicle.vehicleCode}')">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteVehicle('${vehicle.vehicleCode}')">
                        <i class="fas fa-trash"></i>
                    </button>
                </td>
            `;
            tbody.appendChild(row);
        });
    } catch (error) {
        showAlert('Failed to load vehicles', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Save or update vehicle
async function saveVehicle() {
    const vehicleData = {
        vehicleCode: document.getElementById('vehicleCode').value,
        fuelType: document.getElementById('fuelType').value,
        plateNumber: document.getElementById('plateNumber').value,
        remarks: document.getElementById('remarks').value,
        status: document.getElementById('status').value,
        category: document.getElementById('category').value,
        staffId: document.getElementById('staffId').value
    };

    try {
        toggleLoading(true);
        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing ? `${API_URL}/${currentVehicleCode}` : API_URL;

        const response = await fetch(url, {
            method: method,
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vehicleData)
        });

        if (response.ok) {
            showAlert(`Vehicle ${isEditing ? 'updated' : 'added'} successfully`, 'success');
            modal.hide();
            loadVehicles();
            resetForm();
        } else {
            showAlert(`Failed to ${isEditing ? 'update' : 'add'} vehicle`, 'error');
        }
    } catch (error) {
        showAlert(`Error: ${error.message}`, 'error');
    } finally {
        toggleLoading(false);
    }
}

// Edit vehicle
async function editVehicle(vehicleCode) {
    try {
        toggleLoading(true);
        const response = await fetch(`${API_URL}/${vehicleCode}`);
        const vehicle = await response.json();

        document.getElementById('vehicleCode').value = vehicle.vehicleCode;
        document.getElementById('fuelType').value = vehicle.fuelType;
        document.getElementById('plateNumber').value = vehicle.plateNumber;
        document.getElementById('remarks').value = vehicle.remarks || '';
        document.getElementById('status').value = vehicle.status;
        document.getElementById('category').value = vehicle.category;
        document.getElementById('staffId').value = vehicle.staffId;

        isEditing = true;
        currentVehicleCode = vehicleCode;
        document.getElementById('modalTitle').textContent = 'Edit Vehicle';
        document.getElementById('vehicleCode').readOnly = true;
        modal.show();
    } catch (error) {
        showAlert('Failed to load vehicle details', 'error');
    } finally {
        toggleLoading(false);
    }
}

// Delete vehicle
async function deleteVehicle(vehicleCode) {
    const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
        try {
            toggleLoading(true);
            const response = await fetch(`${API_URL}/${vehicleCode}`, {
                method: 'DELETE'
            });

            if (response.ok) {
                Swal.fire('Deleted!', 'The vehicle has been deleted.', 'success');
                loadVehicles();
            } else {
                Swal.fire('Error!', 'Failed to delete the vehicle.', 'error');
            }
        } catch (error) {
            Swal.fire('Error!', `Error: ${error.message}`, 'error');
        } finally {
            toggleLoading(false);
        }
    }
}

// Reset form
function resetForm() {
    document.getElementById('vehicleForm').reset();
    isEditing = false;
    currentVehicleCode = null;
    document.getElementById('modalTitle').textContent = 'Add Vehicle';
    document.getElementById('vehicleCode').readOnly = false;
}

// Event Listeners
document.getElementById('saveButton').addEventListener('click', saveVehicle);
document.getElementById('vehicleModal').addEventListener('hidden.bs.modal', resetForm);
document.addEventListener('DOMContentLoaded', loadVehicles);
enableEnterKeyNavigation();
