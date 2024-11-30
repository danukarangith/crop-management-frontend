// Open and Close Modal
function openCropModal() {
    document.getElementById('cropModal').style.display = 'block';
}

function closeCropModal() {
    document.getElementById('cropModal').style.display = 'none';
    document.getElementById('cropForm').reset();
    document.getElementById('imagePreview').src = '';
    document.getElementById('imagePreview').style.display = 'none';
}

// Preview Image
function previewImage(event) {
    const imagePreview = document.getElementById('imagePreview');
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (e) {
            imagePreview.src = e.target.result;
            imagePreview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        imagePreview.src = '';
        imagePreview.style.display = 'none';
    }
}

// Add Crop with Image Upload
function addCrop() {
    const formData = new FormData();

    formData.append('cropCode', document.getElementById('cropCode').value);
    formData.append('cropCommonName', document.getElementById('cropCommonName').value);
    formData.append('cropScientificName', document.getElementById('cropScientificName').value);
    formData.append('cropImage', document.getElementById('cropImage').files[0]);
    formData.append('category', document.getElementById('category').value);
    formData.append('cropSeason', document.getElementById('cropSeason').value);
    formData.append('fieldCode', document.getElementById('fieldCode').value);

    fetch(apiBaseUrl, {
        method: "POST",
        body: formData
    })
        .then(response => {
            if (!response.ok) throw new Error('Failed to add crop');
            return response.json();
        })
        .then(() => {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Crop added successfully!'
            });
            closeCropModal();
            loadCrops(); // Reload crop list
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to add crop'
            });
            console.error(error);
        });
}

// Load Crops
function loadCrops() {
    fetch(apiBaseUrl)
        .then(response => response.json())
        .then(data => {
            const tableBody = document.querySelector('#cropTable tbody');
            tableBody.innerHTML = '';

            data.forEach(crop => {
                const row = document.createElement('tr');
                row.innerHTML = `
                    <td>${crop.cropCode}</td>
                    <td>${crop.cropCommonName}</td>
                    <td>${crop.cropScientificName}</td>
                    <td><img src="${crop.cropImage}" alt="Crop Image" width="50"></td>
                    <td>${crop.category}</td>
                    <td>${crop.cropSeason}</td>
                    <td>${crop.fieldCode}</td>
                    <td>
                        <button onclick="editCrop('${crop.cropCode}')">Edit</button>
                        <button onclick="deleteCrop('${crop.cropCode}')">Delete</button>
                    </td>
                `;
                tableBody.appendChild(row);
            });
        })
        .catch(error => console.error('Error loading crops:', error));
}
