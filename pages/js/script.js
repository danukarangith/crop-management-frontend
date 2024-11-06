// Toggle password visibility
document.querySelectorAll('.toggle-password').forEach(button => {
    button.addEventListener('click', function() {
        const input = this.previousElementSibling;
        const icon = this.querySelector('i');
        
        if (input.type === 'password') {
            input.type = 'text';
            icon.classList.remove('bi-eye');
            icon.classList.add('bi-eye-slash');
        } else {
            input.type = 'password';
            icon.classList.remove('bi-eye-slash');
            icon.classList.add('bi-eye');
        }
    });
});

// Password strength checker
const passwordInput = document.getElementById('password');
const strengthBar = document.querySelector('.progress-bar');
const strengthText = document.querySelector('.password-strength small');

if (passwordInput && strengthBar && strengthText) {
    passwordInput.addEventListener('input', function() {
        const password = this.value;
        let strength = 0;
        
        if (password.length >= 8) strength += 25;
        if (password.match(/[a-z]/)) strength += 25;
        if (password.match(/[A-Z]/)) strength += 25;
        if (password.match(/[0-9]/)) strength += 25;
        
        strengthBar.style.width = strength + '%';
        
        if (strength <= 25) {
            strengthBar.className = 'progress-bar bg-danger';
            strengthText.textContent = 'Password strength: Weak';
        } else if (strength <= 50) {
            strengthBar.className = 'progress-bar bg-warning';
            strengthText.textContent = 'Password strength: Medium';
        } else if (strength <= 75) {
            strengthBar.className = 'progress-bar bg-info';
            strengthText.textContent = 'Password strength: Good';
        } else {
            strengthBar.className = 'progress-bar bg-success';
            strengthText.textContent = 'Password strength: Strong';
        }
    });
}

// Form validation
document.querySelectorAll('form').forEach(form => {
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // Add your form validation and submission logic here
        console.log('Form submitted');
    });
});