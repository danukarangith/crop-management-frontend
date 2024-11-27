document.addEventListener("DOMContentLoaded", function() {
    const popupForm = document.getElementById("popupForm");
    const addStaffBtn = document.getElementById("addStaffBtn");
    const closeModal = document.getElementById("closeModal");
    const cancelBtn = document.getElementById("cancelBtn");
    const staffForm = document.getElementById("staffForm");

    // Open Add Staff Popup
    addStaffBtn.addEventListener("click", function() {
        popupForm.style.display = "block";
        popupForm.style.display="flex"
    });

    // Close Add Staff Popup when clicking on close button (X)
    closeModal.addEventListener("click", function() {
        closePopupForm();
    });

    // Close Add Staff Popup when clicking on Cancel button
    cancelBtn.addEventListener("click", function() {
        closePopupForm();
    });

    // Close Add Staff Popup when clicking outside of the popup form
    window.addEventListener("click", function(event) {
        if (event.target === popupForm) {
            closePopupForm();
        }
    });

    // Function to close the popup form
    function closePopupForm() {
        popupForm.style.display = "none";
    }

    // Handling "Enter" key press to navigate to the next input field
    staffForm.addEventListener("keydown", function(event) {
        if (event.key === "Enter") {
            event.preventDefault(); // Prevent form submission
            const inputs = Array.from(staffForm.getElementsByTagName("input"));
            const currentIndex = inputs.indexOf(event.target);
            if (currentIndex < inputs.length - 1) {
                inputs[currentIndex + 1].focus(); // Move focus to next input
            } else {
                inputs[0].focus(); // Go back to the first input field after the last one
            }
        }
    });

    // Optionally, you can add a focusout event listener for better navigation (when clicking outside)
    const inputFields = document.querySelectorAll("#staffForm input, #staffForm select");
    inputFields.forEach(field => {
        field.addEventListener("focusout", function(event) {
            const nextField = getNextField(event.target);
            if (nextField) {
                nextField.focus();
            }
        });
    });

    // Function to get the next field based on current field
    function getNextField(currentField) {
        let next = false;
        for (const field of inputFields) {
            if (next) return field;
            if (field === currentField) next = true;
        }
        return null;
    }

    // Handling form submission (you can extend this based on actual submission logic)
    staffForm.addEventListener("submit", function(event) {
        event.preventDefault();
        saveStaff(); // Call your save function
    });

    // Function to save staff (for now, just logging data)
    function saveStaff() {
        const formData = {
            staffId: document.getElementById("staffId").value,
            firstName: document.getElementById("firstName").value,
            lastName: document.getElementById("lastName").value,
            designation: document.getElementById("designation").value,
            gender: document.getElementById("gender").value,
            joinedDate: document.getElementById("joinedDate").value,
            dob: document.getElementById("dob").value,
            address: [
                document.getElementById("addressLine1").value,
                document.getElementById("addressLine2").value,
                document.getElementById("addressLine3").value,
                document.getElementById("addressLine4").value,
                document.getElementById("addressLine5").value
            ].join(", "),
            contactNo: document.getElementById("contactNo").value,
            email: document.getElementById("email").value,
            role: document.getElementById("role").value
        };

        console.log("Staff Saved:", formData);
        Swal.fire({
            title: "Success!",
            text: "Staff has been added successfully",
            icon: "success",
            confirmButtonColor: "#4a90e2",
            willClose: () => {
                closePopupForm();
            }
        });
    }
});
