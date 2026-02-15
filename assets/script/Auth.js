// ============================================================================
// AUTHENTICATION JAVASCRIPT FOR LOGIN & SIGNUP PAGES
// ============================================================================


if (typeof authService === 'undefined') {
    const authService = new AuthService();
    window.authService = authService;
}

// ============================================================================
// SIGNUP PAGE LOGIC
// ============================================================================

function initSignupPage() {
    // Check if already authenticated
    if (authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const signupForm = document.getElementById('signupForm');
    
    if (!signupForm) return; // Not on signup page

    signupForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const email = document.getElementById('email').value.trim();
        const username = document.getElementById('username')?.value.trim(); // Optional
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        // Validate passwords match
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }

        // Validate password strength (optional)
        if (password.length < 8) {
            showToast('Password must be at least 8 characters', 'error');
            return;
        }

        // Prepare user data
        const userData = {
            email: email,
            password: password
        };

        if (username) {
            userData.username = username;
        }

        // Show loading state
        const submitButton = signupForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Creating account...';

        try {
            // Call signup endpoint
            await authService.signup(userData);
            
        } catch (error) {
            console.error('Signup failed:', error);
        } finally {
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    const loginLink = document.getElementById('loginLink');
    if (loginLink) {
        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'login.html';
        });
    }
}

// ============================================================================
// LOGIN PAGE LOGIC
// ============================================================================


function initLoginPage() {
   
    if (authService.isAuthenticated()) {
        window.location.href = 'dashboard.html';
        return;
    }

    const loginForm = document.getElementById('loginForm');
    
    if (!loginForm) return; 

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        // Get form values
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;

        // Basic validation
        if (!email || !password) {
            showToast('Please fill in all fields', 'error');
            return;
        }

        // Prepare credentials
        const credentials = {
            email: email,
            password: password
        };

        // Show loading state
        const submitButton = loginForm.querySelector('button[type="submit"]');
        const originalButtonText = submitButton.textContent;
        submitButton.disabled = true;
        submitButton.textContent = 'Logging in...';

        try {
            // Call login endpoint
            await authService.login(credentials);
            
           
        } catch (error) {
            
            console.error('Login failed:', error);
        } finally {
            // Reset button state
            submitButton.disabled = false;
            submitButton.textContent = originalButtonText;
        }
    });

    // Add "Don't have an account? Sign up" link handler if exists
    const signupLink = document.getElementById('signupLink');
    if (signupLink) {
        signupLink.addEventListener('click', (e) => {
            e.preventDefault();
            window.location.href = 'signup.html';
        });
    }

    // Add "Forgot Password" link handler if exists
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', (e) => {
            e.preventDefault();
            handleForgotPassword();
        });
    }
}

// ============================================================================
// TOAST NOTIFICATION (if not already defined)
// ============================================================================

if (typeof showToast === 'undefined') {
    function showToast(message, type = 'info') {
        // Create toast if it doesn't exist
        let toast = document.getElementById('toast');
        
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            toast.className = 'toast';
            document.body.appendChild(toast);
        }

        toast.textContent = message;
        toast.className = `toast show ${type}`;
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }
    
    window.showToast = showToast;
}

// ============================================================================
// AUTO-INITIALIZE ON PAGE LOAD
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    // Detect which page we're on and initialize accordingly
    if (document.getElementById('signupForm')) {
        initSignupPage();
    } else if (document.getElementById('loginForm')) {
        initLoginPage();
    }
});

// ============================================================================
// EXAMPLE HTML STRUCTURE FOR LOGIN PAGE
// ============================================================================

/*
Expected HTML structure for login.html:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Login - Screen Recorder</title>
    <link rel="stylesheet" href="auth-styles.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <h1>Login</h1>
            <form id="loginForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <button type="submit">Login</button>
            </form>
            <p>
                Don't have an account? 
                <a href="signup.html" id="signupLink">Sign up</a>
            </p>
            <p>
                <a href="#" id="forgotPasswordLink">Forgot password?</a>
            </p>
        </div>
    </div>
    
    <div id="toast" class="toast"></div>
    
    <script src="app.js"></script>
    <script src="auth.js"></script>
</body>
</html>
*/

// ============================================================================
// EXAMPLE HTML STRUCTURE FOR SIGNUP PAGE
// ============================================================================

/*
Expected HTML structure for signup.html:

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Sign Up - Screen Recorder</title>
    <link rel="stylesheet" href="auth-styles.css">
</head>
<body>
    <div class="auth-container">
        <div class="auth-card">
            <h1>Sign Up</h1>
            <form id="signupForm">
                <div class="form-group">
                    <label for="email">Email</label>
                    <input type="email" id="email" required>
                </div>
                <div class="form-group">
                    <label for="username">Username (optional)</label>
                    <input type="text" id="username">
                </div>
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" required>
                </div>
                <div class="form-group">
                    <label for="confirmPassword">Confirm Password</label>
                    <input type="password" id="confirmPassword" required>
                </div>
                <button type="submit">Sign Up</button>
            </form>
            <p>
                Already have an account? 
                <a href="login.html" id="loginLink">Login</a>
            </p>
        </div>
    </div>
    
    <div id="toast" class="toast"></div>
    
    <script src="app.js"></script>
    <script src="auth.js"></script>
</body>
</html>
*/
