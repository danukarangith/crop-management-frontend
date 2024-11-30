
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
        field.addEventListener("focus", function(event) {
            event.target.parentElement.classList.add('active'); // Add 'active' class on focus
        });

        field.addEventListener("blur", function(event) {
            event.target.parentElement.classList.remove('active'); // Remove 'active' class on blur
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



    // const inputFields = document.querySelectorAll("#staffForm input, #staffForm select, #staffForm textarea");
    // inputFields.forEach(field => {
    //     field.addEventListener("focus", function(event) {
    //         event.target.parentElement.classList.add('active'); // Add 'active' class on focus
    //     });

    //     field.addEventListener("blur", function(event) {
    //         event.target.parentElement.classList.remove('active'); // Remove 'active' class on blur
    //     });
    // });

    // Function to save staff (for now, just logging data)
     
});
