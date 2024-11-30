// API base URL
const apiUrl = 'http://localhost:8080/api/v1/staff';

const jwtToken = 'eyJhbGciOiJIUzI1NiJ9.eyJyb2xlIjpbeyJhdXRob3JpdHkiOiJST0xFX0FETUlOSVNUUkFUT1IifV0sInN1YiI6ImFkbWlzbkBleGFtcGxlLmNvbSIsImlhdCI6MTczMjc3MTk2OSwiZXhwIjoxNzMzODA4NzY5fQ._Ldohfv7rl4nPRLuSpjTvLBoHrqCwr5KrM007MtREsg'

// Fetch and display all staff in the table
function fetchStaff() {
    document.getElementById('loadingSpinner').style.display = 'block';  // Show loading spinner

    fetch(apiUrl,{
        method: "GET",
        headers: {
            Authorization: `Bearer ${jwtToken} ` 
        }
    })
        .then(response => response.json())
        .then(data => {
            const staffTableBody = document.querySelector('#staffTable tbody');
            staffTableBody.innerHTML = '';  // Clear previous data

            data.forEach(staff => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${staff.staffId}</td>
                    <td>${staff.firstName}</td>
                    <td>${staff.lastName}</td>
                    <td>${staff.designation}</td>
                    <td>${staff.gender}</td>
                    <td>${staff.joinedDate}</td>
                    <td>${staff.dob}</td>
                    <td>${staff.address}</td>
                    <td>${staff.contactNo}</td>
                    <td>${staff.email}</td>
                    <td>${staff.role}</td>
                    <td>
                        <button class="edit-btn" onclick="openEditModal('${staff.staffId}')">Edit</button>
                        <button class="delete-btn" onclick="deleteStaff('${staff.staffId}')">Delete</button>
                    </td>
                `;
                staffTableBody.appendChild(row);
            });

            document.getElementById('loadingSpinner').style.display = 'none';  // Hide loading spinner
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an issue fetching staff data!',
            });
            console.error('Error fetching staff:', error);
            document.getElementById('loadingSpinner').style.display = 'none';  // Hide loading spinner
        });
}

// Show the add staff form (popup modal)
function saveStaff() {
    const newStaff = {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        designation: document.getElementById('designation').value,
        gender: document.getElementById('gender').value,
        joinedDate: document.getElementById('joinedDate').value,
        dob: document.getElementById('dob').value,
        address: document.getElementById('addressLine1').value,
        contactNo: document.getElementById('contactNo').value,
        email: document.getElementById('email').value,
        role: document.getElementById('role').value
    };

    document.getElementById('loadingSpinner').style.display = 'block'; // Show loading spinner

    fetch(apiUrl, {
        method: "POST",
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jwtToken}`
        },
        body: JSON.stringify(newStaff)
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to save staff.');
            }
            return response.json();
        })
        .then(data => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Staff member saved successfully!',
            });

            // Clear form inputs
            document.getElementById('staffForm').reset();

            // Optionally refresh the staff list
            fetchStaff();
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'There was an issue saving the staff data!',
            });
            console.error('Error saving staff:', error);
        })
        .finally(() => {
            document.getElementById('loadingSpinner').style.display = 'none'; // Hide loading spinner
        });
}

            
            

// Delete staff using AJAX
function deleteStaff(staffId) {
    if (confirm('Are you sure you want to delete this staff member?')) {
        fetch(`${apiUrl}/${staffId}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (response.status === 204) {
                    alert('Staff deleted successfully!');
                    fetchStaff();  // Refresh staff list
                } else {
                    alert('Error deleting staff');
                }
            })
            .catch(error => {
                console.error('Error deleting staff:', error);
            });
    }
}

// Open the edit modal to update staff information
function openEditModal(staffId) {
    fetch(`${apiUrl}/${staffId}`)
        .then(response => response.json())
        .then(staff => {
            document.getElementById('staffId').value = staff.staffId;
            document.getElementById('firstName').value = staff.firstName;
            document.getElementById('lastName').value = staff.lastName;
            document.getElementById('designation').value = staff.designation;
            document.getElementById('gender').value = staff.gender;
            document.getElementById('joinedDate').value = staff.joinedDate;
            document.getElementById('dob').value = staff.dob;
            document.getElementById('addressLine1').value = staff.addressLine1;
            document.getElementById('addressLine2').value = staff.addressLine2;
            document.getElementById('addressLine3').value = staff.addressLine3;
            document.getElementById('addressLine4').value = staff.addressLine4;
            document.getElementById('addressLine5').value = staff.addressLine5;
            document.getElementById('contactNo').value = staff.contactNo;
            document.getElementById('email').value = staff.email;
            document.getElementById('role').value = staff.role;

            document.getElementById('popupForm').style.display = 'block';  // Show the edit form
        })
        .catch(error => console.error('Error fetching staff:', error));
}

// Initially load the staff list
fetchStaff();
