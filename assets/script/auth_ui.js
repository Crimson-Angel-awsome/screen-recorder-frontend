// ============================================================================
// AUTH UI INTERACTIONS - Password Toggle, Strength Meter, etc.
// ============================================================================

document.addEventListener('DOMContentLoaded', () => {
    
    // ========================================
    // PASSWORD VISIBILITY TOGGLE
    // ========================================
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const inputWrapper = this.closest('.input-wrapper');
            const input = inputWrapper.querySelector('input');
            const eyeIcon = this.querySelector('.eye-icon');
            
            if (input.type === 'password') {
                input.type = 'text';
                eyeIcon.textContent = '🙈';
            } else {
                input.type = 'password';
                eyeIcon.textContent = '👁️';
            }
        });
    });

    // ========================================
    // PASSWORD STRENGTH METER (Signup Page)
    // ========================================
    const passwordInput = document.getElementById('password');
    
    if (passwordInput && document.getElementById('signupForm')) {
        const strengthBar = document.getElementById('strengthBar');
        const strengthText = document.getElementById('strengthText');
        const strengthContainer = passwordInput.closest('.form-group').querySelector('.password-strength');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            if (password.length === 0) {
                strengthContainer.classList.remove('active');
                return;
            }
            
            strengthContainer.classList.add('active');
            
            // Calculate password strength
            const strength = calculatePasswordStrength(password);
            
            // Update UI
            strengthBar.className = 'strength-bar-fill';
            
            if (strength.score <= 2) {
                strengthBar.classList.add('weak');
                strengthText.textContent = 'Weak password';
                strengthText.style.color = '#ef4444';
            } else if (strength.score <= 3) {
                strengthBar.classList.add('medium');
                strengthText.textContent = 'Medium password';
                strengthText.style.color = '#f59e0b';
            } else {
                strengthBar.classList.add('strong');
                strengthText.textContent = 'Strong password';
                strengthText.style.color = '#10b981';
            }
        });
    }

    // ========================================
    // PASSWORD STRENGTH CALCULATION
    // ========================================
    function calculatePasswordStrength(password) {
        let score = 0;
        
        // Length check
        if (password.length >= 8) score++;
        if (password.length >= 12) score++;
        
        // Character variety checks
        if (/[a-z]/.test(password)) score++; // lowercase
        if (/[A-Z]/.test(password)) score++; // uppercase
        if (/[0-9]/.test(password)) score++; // numbers
        if (/[^a-zA-Z0-9]/.test(password)) score++; // special chars
        
        return {
            score: Math.min(score, 5),
            maxScore: 5
        };
    }

    // ========================================
    // CONFIRM PASSWORD VALIDATION
    // ========================================
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (confirmPasswordInput && passwordInput) {
        confirmPasswordInput.addEventListener('input', function() {
            if (this.value && this.value !== passwordInput.value) {
                this.setCustomValidity('Passwords do not match');
            } else {
                this.setCustomValidity('');
            }
        });
        
        passwordInput.addEventListener('input', function() {
            if (confirmPasswordInput.value) {
                if (confirmPasswordInput.value !== this.value) {
                    confirmPasswordInput.setCustomValidity('Passwords do not match');
                } else {
                    confirmPasswordInput.setCustomValidity('');
                }
            }
        });
    }

    // ========================================
    // SOCIAL AUTH BUTTONS (Placeholders)
    // ========================================
    const googleBtn = document.querySelector('.btn-google');
    const githubBtn = document.querySelector('.btn-github');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            showToast('Google authentication coming soon!', 'info');
            // Implement Google OAuth here
            // window.location.href = '/auth/google';
        });
    }
    
    if (githubBtn) {
        githubBtn.addEventListener('click', function() {
            showToast('GitHub authentication coming soon!', 'info');
            // Implement GitHub OAuth here
            // window.location.href = '/auth/github';
        });
    }

    // ========================================
    // DEMO/GUEST BUTTON (Login Page)
    // ========================================
    const demoBtn = document.querySelector('.btn-demo');
    
    if (demoBtn) {
        demoBtn.addEventListener('click', function() {
            // Create a demo/guest session
            const demoToken = 'demo_' + Date.now();
            const demoUser = {
                id: 'demo',
                email: 'guest@demo.com',
                username: 'Guest User',
                isDemo: true
            };
            
            // Store demo credentials
            localStorage.setItem('auth_token', demoToken);
            localStorage.setItem('user_data', JSON.stringify(demoUser));
            
            showToast('Entering demo mode...', 'success');
            
            // Redirect to dashboard after short delay
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        });
    }

    // ========================================
    // REMEMBER ME FUNCTIONALITY (Login Page)
    // ========================================
    const rememberCheckbox = document.getElementById('remember');
    const loginForm = document.getElementById('loginForm');
    
    if (rememberCheckbox && loginForm) {
        // Check if there's a remembered email
        const rememberedEmail = localStorage.getItem('remembered_email');
        if (rememberedEmail) {
            const emailInput = loginForm.querySelector('#email');
            if (emailInput) {
                emailInput.value = rememberedEmail;
                rememberCheckbox.checked = true;
            }
        }
        
        // Save email if remember me is checked
        loginForm.addEventListener('submit', function() {
            const emailInput = this.querySelector('#email');
            if (rememberCheckbox.checked && emailInput) {
                localStorage.setItem('remembered_email', emailInput.value);
            } else {
                localStorage.removeItem('remembered_email');
            }
        });
    }

    // ========================================
    // FORM LOADING STATE
    // ========================================
    const authForms = document.querySelectorAll('.auth-form');
    
    authForms.forEach(form => {
        form.addEventListener('submit', function() {
            const submitBtn = this.querySelector('.btn-submit');
            if (submitBtn && !submitBtn.classList.contains('loading')) {
                submitBtn.classList.add('loading');
                submitBtn.disabled = true;
                
                // Remove loading state after 5 seconds as fallback
                setTimeout(() => {
                    submitBtn.classList.remove('loading');
                    submitBtn.disabled = false;
                }, 5000);
            }
        });
    });

    // ========================================
    // TERMS & PRIVACY LINKS (Placeholder)
    // ========================================
    const termsLinks = document.querySelectorAll('a[href="#"]');
    
    termsLinks.forEach(link => {
        const text = link.textContent.toLowerCase();
        if (text.includes('terms') || text.includes('privacy')) {
            link.addEventListener('click', function(e) {
                e.preventDefault();
                showToast('Terms and Privacy pages coming soon!', 'info');
            });
        }
    });

    // ========================================
    // KEYBOARD SHORTCUTS
    // ========================================
    document.addEventListener('keydown', function(e) {
        // ESC to clear forms
        if (e.key === 'Escape') {
            const activeForm = document.querySelector('.auth-form');
            if (activeForm && !document.activeElement.matches('input')) {
                activeForm.reset();
            }
        }
    });

    // ========================================
    // INPUT VALIDATION FEEDBACK
    // ========================================
    const inputs = document.querySelectorAll('.auth-form input[required]');
    
    inputs.forEach(input => {
        input.addEventListener('blur', function() {
            if (this.value && !this.validity.valid) {
                this.style.borderColor = '#ef4444';
            } else if (this.value) {
                this.style.borderColor = '#10b981';
            }
        });
        
        input.addEventListener('input', function() {
            if (this.style.borderColor) {
                this.style.borderColor = '';
            }
        });
    });

    // ========================================
    // AUTO-FOCUS FIRST INPUT
    // ========================================
    const firstInput = document.querySelector('.auth-form input:not([type="checkbox"])');
    if (firstInput) {
        setTimeout(() => {
            firstInput.focus();
        }, 100);
    }

    // ========================================
    // ANIMATED BACKGROUND CIRCLES
    // ========================================
    const circles = document.querySelectorAll('.circle');
    
    circles.forEach((circle, index) => {
        circle.style.animationDelay = `${index * 2}s`;
        
        // Random movement on hover
        circle.addEventListener('mouseenter', function() {
            const randomX = Math.random() * 50 - 25;
            const randomY = Math.random() * 50 - 25;
            this.style.transform = `translate(${randomX}px, ${randomY}px)`;
        });
        
        circle.addEventListener('mouseleave', function() {
            this.style.transform = '';
        });
    });
});

// ========================================
// TOAST HELPER (if not already defined)
// ========================================
if (typeof showToast === 'undefined') {
    function showToast(message, type = 'info') {
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

// ========================================
// EMAIL VALIDATION HELPER
// ========================================
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ========================================
// EXPORT UTILITIES
// ========================================
window.authUI = {
    calculatePasswordStrength,
    isValidEmail
};
