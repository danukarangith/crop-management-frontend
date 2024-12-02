// Base URL for the API
const API_BASE_URL = "http://localhost:8080/api/v1/auth";

// Utility function for API requests
async function apiRequest(url, method, body) {
  try {
    const response = await fetch(url, {
      method: method,
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Error during API request:", error.message);
    throw error;
  }
}

// Login functionality
// Login functionality
async function handleLogin(event) {
    event.preventDefault(); // Prevent form submission
  
    const email = document.querySelector(".login-form input[placeholder='Enter your email']").value;
    const password = document.querySelector(".login-form input[placeholder='Enter your password']").value;
  
    try {
      const data = await apiRequest(`${API_BASE_URL}/signin`, "POST", { email, password });
      console.log("Login successful:", data);
  
      // Store the token (and refreshToken if applicable) in localStorage
      localStorage.setItem("token", data.token);
      localStorage.setItem("refreshToken", data.refreshToken);
  
      // Show SweetAlert success message
      Swal.fire({
        title: 'Login Successful!',
        text: 'You will be redirected to your dashboard.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        // Redirect to dashboard after user closes the SweetAlert
        window.location.href = '/index.html'; // Change this to your actual dashboard URL
      });
  
    } catch (error) {
      // Show SweetAlert error message
      Swal.fire({
        title: 'Login Failed!',
        text: 'Please check your credentials and try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
  

// Signup functionality
async function handleSignup(event) {
    event.preventDefault(); // Prevent form submission
  
    const role = document.querySelector(".signup-form select[name='Role']").value;
    const email = document.querySelector(".signup-form input[placeholder='Enter your email']").value;
    const password = document.querySelector(".signup-form input[placeholder='Enter your password']").value;
  
    try {
      const data = await apiRequest(`${API_BASE_URL}/signup`, "POST", { role, email, password });
      console.log("Signup successful:", data);
  
      // Show SweetAlert success message
      Swal.fire({
        title: 'Signup Successful!',
        text: 'Please login to continue.',
        icon: 'success',
        confirmButtonText: 'OK',
      }).then(() => {
        // Optionally, switch to the login form
        document.querySelector("#flip").checked = false;
      });
  
    } catch (error) {
      // Show SweetAlert error message
      Swal.fire({
        title: 'Signup Failed!',
        text: 'Please try again.',
        icon: 'error',
        confirmButtonText: 'OK',
      });
    }
  }
  

// Attach event listeners to forms
document.querySelector(".login-form form").addEventListener("submit", handleLogin);
document.querySelector(".signup-form form").addEventListener("submit", handleSignup);
