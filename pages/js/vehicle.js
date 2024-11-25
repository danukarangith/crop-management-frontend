document.addEventListener('DOMContentLoaded', function() {
    const modal = document.getElementById('vehicleModal');
    const openModalBtn = document.getElementById('openModal');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const saveButton = document.getElementById('saveButton');
    const vehicleForm = document.getElementById('vehicleForm');
    const loadingSpinner = document.getElementById('loadingSpinner');


    

    const formFields = [
        'vehicleCode',
        'fuelType',
        'plateNumber',
        'remarks',
        'status',
        'category',
        'staffId'
    ];

    // Add keyboard navigation
    formFields.forEach((fieldId, index) => {
        const field = document.getElementById(fieldId);
        
        field.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                
                // If it's the last field and all fields are valid, save the form
                if (index === formFields.length - 1 && vehicleForm.checkValidity()) {
                    saveVehicle(); // Trigger save on Enter after last field
                    return;
                }
                
                // Move to next field
                const nextField = document.getElementById(formFields[index + 1]);
                if (nextField) {
                    nextField.focus();
                }
            }
        });

        // Add focus and blur event listeners for styling
        field.addEventListener('focus', () => {
            field.parentElement.classList.add('active');
        });

        field.addEventListener('blur', () => {
            field.parentElement.classList.remove('active');
        });
    });

    // Function to create tooltip
    function createTooltip(content) {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = content;
        document.body.appendChild(tooltip);
        return tooltip;
    }

    // Enhance table row hover effects
    function enhanceTableRows() {
        const rows = document.querySelectorAll('#vehicleTableBody tr');
        const tooltip = createTooltip('');

        rows.forEach(row => {
            row.addEventListener('mouseenter', (e) => {
                const vehicleData = {
                    'Vehicle Code': row.cells[0].textContent,
                    'Fuel Type': row.cells[1].textContent,
                    'Plate Number': row.cells[2].textContent,
                    'Status': row.cells[4].textContent
                };

                const tooltipContent = Object.entries(vehicleData)
                    .map(([key, value]) => `${key}: ${value}`)
                    .join('\n');

                tooltip.textContent = tooltipContent;
                tooltip.style.display = 'block';
                
                // Position tooltip
                const rowRect = row.getBoundingClientRect();
                tooltip.style.top = `${rowRect.top - tooltip.offsetHeight - 10}px`;
                tooltip.style.left = `${rowRect.left + (rowRect.width / 2) - (tooltip.offsetWidth / 2)}px`;
            });

            row.addEventListener('mouseleave', () => {
                tooltip.style.display = 'none';
            });

            // Update tooltip position on mouse move
            row.addEventListener('mousemove', (e) => {
                tooltip.style.left = `${e.pageX - tooltip.offsetWidth / 2}px`;
                tooltip.style.top = `${e.pageY - tooltip.offsetHeight - 10}px`;
            });
        });
    }

    // Render table function
    function renderTable() {
        const tableBody = document.getElementById('vehicleTableBody');
        tableBody.innerHTML = '';

        vehicles.forEach(vehicle => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${vehicle.vehicleCode}</td>
                <td>${vehicle.fuelType}</td>
                <td>${vehicle.plateNumber}</td>
                <td>${vehicle.remarks}</td>
                <td>${vehicle.status}</td>
                <td>${vehicle.category}</td>
                <td>${vehicle.staffId}</td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn">Edit</button>
                        <button class="delete-btn">Delete</button>
                    </div>
                </td>
            `;
            tableBody.appendChild(row);
        });

        enhanceTableRows();
    }

    // Form validation feedback
    function showValidationMessage(field, message) {
        const validationMessage = field.parentElement.querySelector('.validation-message');
        if (validationMessage) {
            validationMessage.textContent = message;
            validationMessage.style.display = 'block';
        }
    }

    formFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        field.addEventListener('invalid', (e) => {
            e.preventDefault();
            showValidationMessage(field, field.validationMessage);
        });

        field.addEventListener('input', () => {
            if (field.validity.valid) {
                const validationMessage = field.parentElement.querySelector('.validation-message');
                if (validationMessage) {
                    validationMessage.style.display = 'none';
                }
            }
        });
    });

    // Sample data for demonstration
    let vehicles = [
        {
            vehicleCode: 'VH001',
            fuelType: 'Petrol',
            plateNumber: 'ABC123',
            remarks: 'Good condition',
            status: 'ACTIVE',
            category: 'Sedan',
            staffId: 'ST001'
        }
    ];

    function openModal() {
        modal.style.display = 'block';
        vehicleForm.reset();
    }

    function closeModal() {
        modal.style.display = 'none';
    }

    function showLoading() {
        loadingSpinner.style.display = 'block';
    }

    function hideLoading() {
        loadingSpinner.style.display = 'none';
    }

    // Save vehicle data
    function saveVehicle() {
        const formData = {
            vehicleCode: document.getElementById('vehicleCode').value,
            fuelType: document.getElementById('fuelType').value,
            plateNumber: document.getElementById('plateNumber').value,
            remarks: document.getElementById('remarks').value,
            status: document.getElementById('status').value,
            category: document.getElementById('category').value,
            staffId: document.getElementById('staffId').value
        };

        showLoading();

        // Simulate API call
        setTimeout(() => {
            hideLoading();

            if (Math.random() > 0.5) { // Simulate success/error randomly
                vehicles.push(formData);
                renderTable();

                // Show SweetAlert without closing the modal immediately
                Swal.fire({
                    title: 'Success!',
                    text: 'Vehicle has been added successfully',
                    icon: 'success',
                    confirmButtonColor: '#4a90e2',
                    willClose: () => {
                        closeModal();  // Close modal after SweetAlert is closed
                    }
                });
            } else {
                // Show error alert
                Swal.fire({
                    title: 'Error!',
                    text: 'Something went wrong while saving the vehicle',
                    icon: 'error',
                    confirmButtonColor: '#4a90e2',
                    willClose: () => {
                        closeModal();  // Close modal after SweetAlert is closed
                    }
                });
            }
        }, 1000);
    }

    // Event Listeners
    openModalBtn.addEventListener('click', openModal);
    closeModalBtns.forEach(btn => btn.addEventListener('click', closeModal));
    saveButton.addEventListener('click', (e) => {
        e.preventDefault();
        if (vehicleForm.checkValidity()) {
            saveVehicle();
        } else {
            Swal.fire({
                title: 'Validation Error!',
                text: 'Please fill in all required fields',
                icon: 'warning',
                confirmButtonColor: '#4a90e2'
            });
        }
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal();
        }
    });

    // Initial render
    renderTable();
});
