// ========================================
// Global State
// ========================================
let currentUser = null;

// ========================================
// Initialize
// ========================================
document.addEventListener('DOMContentLoaded', function() {
    initIcons();
    checkAuthStatus();
    initNavbar();
    initMobileMenu();
    initAuthModal();
    initSignInForm();
    initSignUpForm();
    initSocialLogin();
    initUserMenu();
    initSmoothScroll();
    initScrollAnimations();
    initContactForm();
});

function initIcons() {
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
}

window.addEventListener('load', function() {
    setTimeout(initIcons, 100);
});

setTimeout(initIcons, 500);

// ========================================
// Check Authentication Status
// ========================================
async function checkAuthStatus() {
    try {
        const response = await fetch('/api/auth/status');
        const result = await response.json();
        
        if (result.authenticated) {
            currentUser = result.user;
            updateUIForLoggedInUser(result.user);
        } else {
            updateUIForLoggedOutUser();
        }
    } catch (error) {
        console.log('Auth check failed:', error);
    }
}

function updateUIForLoggedInUser(user) {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const mobileAuth = document.getElementById('mobileAuth');
    const mobileUser = document.getElementById('mobileUser');
    
    if (navAuth) navAuth.style.display = 'none';
    if (navUser) {
        navUser.style.display = 'flex';
        const avatar = document.getElementById('userAvatar');
        const name = document.getElementById('userName');
        const email = document.getElementById('userEmail');
        
        if (avatar) avatar.textContent = user.name.charAt(0).toUpperCase();
        if (name) name.textContent = user.name;
        if (email) email.textContent = user.email;
    }
    
    if (mobileAuth) mobileAuth.style.display = 'none';
    if (mobileUser) {
        mobileUser.style.display = 'block';
        const mobileAvatar = document.getElementById('mobileUserAvatar');
        const mobileName = document.getElementById('mobileUserName');
        const mobileEmail = document.getElementById('mobileUserEmail');
        
        if (mobileAvatar) mobileAvatar.textContent = user.name.charAt(0).toUpperCase();
        if (mobileName) mobileName.textContent = user.name;
        if (mobileEmail) mobileEmail.textContent = user.email;
    }
}

function updateUIForLoggedOutUser() {
    const navAuth = document.getElementById('navAuth');
    const navUser = document.getElementById('navUser');
    const mobileAuth = document.getElementById('mobileAuth');
    const mobileUser = document.getElementById('mobileUser');
    
    if (navAuth) navAuth.style.display = 'flex';
    if (navUser) navUser.style.display = 'none';
    if (mobileAuth) mobileAuth.style.display = 'flex';
    if (mobileUser) mobileUser.style.display = 'none';
}

// ========================================
// Auth Modal
// ========================================
function initAuthModal() {
    const modal = document.getElementById('authModal');
    const overlay = document.getElementById('authModalOverlay');
    const closeBtn = document.getElementById('authModalClose');
    const signInBtn = document.getElementById('signInBtn');
    const showSignUp = document.getElementById('showSignUp');
    const showSignIn = document.getElementById('showSignIn');
    const signInContainer = document.getElementById('signInContainer');
    const signUpContainer = document.getElementById('signUpContainer');
    const mobileSignInBtn = document.getElementById('mobileSignInBtn');
    
    function openModal(isSignUp = false) {
        modal.classList.add('open');
        document.body.style.overflow = 'hidden';
        
        if (isSignUp) {
            signInContainer.style.display = 'none';
            signUpContainer.style.display = 'block';
        } else {
            signInContainer.style.display = 'block';
            signUpContainer.style.display = 'none';
        }
    }
    
    function closeModal() {
        modal.classList.remove('open');
        document.body.style.overflow = '';
        clearMessages();
    }
    
    function clearMessages() {
        document.getElementById('signInMessage').textContent = '';
        document.getElementById('signInMessage').className = 'form-message';
        document.getElementById('signUpMessage').textContent = '';
        document.getElementById('signUpMessage').className = 'form-message';
    }
    
    // Event listeners
    if (signInBtn) signInBtn.addEventListener('click', () => openModal(false));
    if (mobileSignInBtn) mobileSignInBtn.addEventListener('click', () => openModal(false));
    if (showSignUp) showSignUp.addEventListener('click', () => openModal(true));
    if (showSignIn) showSignIn.addEventListener('click', () => openModal(false));
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    
    // Close on escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && modal.classList.contains('open')) {
            closeModal();
        }
    });
}

// ========================================
// Sign In Form
// ========================================
function initSignInForm() {
    const form = document.getElementById('signInForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const email = document.getElementById('signInEmail').value.trim();
        const password = document.getElementById('signInPassword').value;
        const messageEl = document.getElementById('signInMessage');
        const submitBtn = document.getElementById('signInSubmit');
        
        if (!email || !password) {
            showAuthMessage(messageEl, 'Please fill in all fields.', 'error');
            return;
        }
        
        // Show loading
        setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/signin', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                currentUser = result.user;
                showAuthMessage(messageEl, result.message, 'success');
                updateUIForLoggedInUser(result.user);
                
                setTimeout(() => {
                    document.getElementById('authModal').classList.remove('open');
                    document.body.style.overflow = '';
                }, 1000);
            } else {
                showAuthMessage(messageEl, result.message, 'error');
            }
        } catch (error) {
            showAuthMessage(messageEl, 'Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
}

// ========================================
// Sign Up Form
// ========================================
function initSignUpForm() {
    const form = document.getElementById('signUpForm');
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const name = document.getElementById('signUpName').value.trim();
        const email = document.getElementById('signUpEmail').value.trim();
        const password = document.getElementById('signUpPassword').value;
        const messageEl = document.getElementById('signUpMessage');
        const submitBtn = document.getElementById('signUpSubmit');
        
        if (!name || !email || !password) {
            showAuthMessage(messageEl, 'Please fill in all fields.', 'error');
            return;
        }
        
        if (password.length < 6) {
            showAuthMessage(messageEl, 'Password must be at least 6 characters.', 'error');
            return;
        }
        
        // Show loading
        setButtonLoading(submitBtn, true);
        
        try {
            const response = await fetch('/api/auth/signup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password })
            });
            
            const result = await response.json();
            
            if (result.success) {
                currentUser = result.user;
                showAuthMessage(messageEl, result.message, 'success');
                updateUIForLoggedInUser(result.user);
                
                setTimeout(() => {
                    document.getElementById('authModal').classList.remove('open');
                    document.body.style.overflow = '';
                }, 1000);
            } else {
                showAuthMessage(messageEl, result.message, 'error');
            }
        } catch (error) {
            showAuthMessage(messageEl, 'Network error. Please try again.', 'error');
        } finally {
            setButtonLoading(submitBtn, false);
        }
    });
}

// ========================================
// Social Login
// ========================================
function initSocialLogin() {
    const socialButtons = document.querySelectorAll('[id$="SignIn"], [id$="SignUp"]');
    
    socialButtons.forEach(btn => {
        btn.addEventListener('click', async function() {
            // Get provider from button ID
            const id = this.id.toLowerCase();
            let provider = '';
            
            if (id.includes('google')) provider = 'google';
            else if (id.includes('github')) provider = 'github';
            else if (id.includes('facebook')) provider = 'facebook';
            else return;
            
            // Simulate social login (in production, this would redirect to OAuth)
            // For demo purposes, we'll use a mock user
            const mockUsers = {
                google: { name: 'Google User', email: 'user@gmail.com' },
                github: { name: 'GitHub User', email: 'user@github.com' },
                facebook: { name: 'Facebook User', email: 'user@facebook.com' }
            };
            
            const mockUser = mockUsers[provider];
            
            // Show loading
            const originalText = this.innerHTML;
            this.innerHTML = '<span class="btn-loading"><svg class="spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg> Connecting...</span>';
            this.disabled = true;
            
            try {
                const response = await fetch('/api/auth/social', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        provider: provider,
                        email: mockUser.email,
                        name: mockUser.name,
                        provider_id: provider + '_' + Date.now()
                    })
                });
                
                const result = await response.json();
                
                if (result.success) {
                    currentUser = result.user;
                    updateUIForLoggedInUser(result.user);
                    
                    // Close modal
                    document.getElementById('authModal').classList.remove('open');
                    document.body.style.overflow = '';
                    
                    // Show success toast
                    showToast(result.message, 'success');
                }
            } catch (error) {
                showToast('Login failed. Please try again.', 'error');
            } finally {
                this.innerHTML = originalText;
                this.disabled = false;
            }
        });
    });
}

// ========================================
// User Menu Dropdown
// ========================================
function initUserMenu() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userMenu = document.querySelector('.user-menu');
    const signOutBtn = document.getElementById('signOutBtn');
    const mobileSignOutBtn = document.getElementById('mobileSignOutBtn');
    
    if (userMenuBtn && userMenu) {
        userMenuBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            userMenu.classList.toggle('open');
        });
        
        document.addEventListener('click', function(e) {
            if (!userMenu.contains(e.target)) {
                userMenu.classList.remove('open');
            }
        });
    }
    
    async function signOut() {
        try {
            await fetch('/api/auth/signout', { method: 'POST' });
            currentUser = null;
            updateUIForLoggedOutUser();
            showToast('Signed out successfully', 'success');
        } catch (error) {
            showToast('Sign out failed', 'error');
        }
    }
    
    if (signOutBtn) signOutBtn.addEventListener('click', signOut);
    if (mobileSignOutBtn) mobileSignOutBtn.addEventListener('click', signOut);
}

// ========================================
// Helper Functions
// ========================================
function showAuthMessage(element, message, type) {
    element.textContent = message;
    element.className = 'form-message ' + type;
    
    setTimeout(() => {
        element.textContent = '';
        element.className = 'form-message';
    }, 5000);
}

function setButtonLoading(button, isLoading) {
    const btnText = button.querySelector('.btn-text');
    const btnLoading = button.querySelector('.btn-loading');
    
    if (btnText && btnLoading) {
        btnText.style.display = isLoading ? 'none' : 'inline';
        btnLoading.style.display = isLoading ? 'inline-flex' : 'none';
    }
    
    button.disabled = isLoading;
}

function showToast(message, type = 'info') {
    // Create toast if it doesn't exist
    let toast = document.querySelector('.toast-notification');
    
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 500;
            z-index: 3000;
            transform: translateY(100px);
            opacity: 0;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.background = type === 'success' ? '#10B981' : type === 'error' ? '#EF4444' : '#6366F1';
    toast.style.color = 'white';
    
    // Show toast
    setTimeout(() => {
        toast.style.transform = 'translateY(0)';
        toast.style.opacity = '1';
    }, 10);
    
    // Hide toast after 3 seconds
    setTimeout(() => {
        toast.style.transform = 'translateY(100px)';
        toast.style.opacity = '0';
    }, 3000);
}

// ========================================
// Navbar
// ========================================
function initNavbar() {
    const navbar = document.getElementById('navbar');
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('section[id]');
    
    if (!navbar) return;
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 50) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        let current = '';
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 100;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                current = section.getAttribute('id');
            }
        });
        
        navLinks.forEach(link => {
            link.classList.remove('active');
            if (link.getAttribute('href') === '#' + current) {
                link.classList.add('active');
            }
        });
    });
}

// ========================================
// Mobile Menu
// ========================================
function initMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    const menuIcon = document.getElementById('menuIcon');
    const mobileLinks = document.querySelectorAll('.mobile-link, .mobile-cta');
    
    if (!mobileMenuBtn || !mobileMenu) return;
    
    let isOpen = false;
    
    mobileMenuBtn.addEventListener('click', function() {
        isOpen = !isOpen;
        mobileMenu.classList.toggle('open', isOpen);
        
        if (menuIcon) {
            menuIcon.innerHTML = '';
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '24');
            svg.setAttribute('height', '24');
            svg.setAttribute('viewBox', '0 0 24 24');
            svg.setAttribute('fill', 'none');
            svg.setAttribute('stroke', 'currentColor');
            svg.setAttribute('stroke-width', '2');
            svg.setAttribute('stroke-linecap', 'round');
            svg.setAttribute('stroke-linejoin', 'round');
            
            if (isOpen) {
                svg.innerHTML = '<line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line>';
            } else {
                svg.innerHTML = '<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line>';
            }
            menuIcon.appendChild(svg);
        }
        
        document.body.style.overflow = isOpen ? 'hidden' : '';
    });
    
    mobileLinks.forEach(link => {
        link.addEventListener('click', function() {
            isOpen = false;
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
            
            if (menuIcon) {
                menuIcon.innerHTML = '';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.setAttribute('width', '24');
                svg.setAttribute('height', '24');
                svg.setAttribute('viewBox', '0 0 24 24');
                svg.setAttribute('fill', 'none');
                svg.setAttribute('stroke', 'currentColor');
                svg.setAttribute('stroke-width', '2');
                svg.setAttribute('stroke-linecap', 'round');
                svg.setAttribute('stroke-linejoin', 'round');
                svg.innerHTML = '<line x1="4" y1="12" x2="20" y2="12"></line><line x1="4" y1="6" x2="20" y2="6"></line><line x1="4" y1="18" x2="20" y2="18"></line>';
                menuIcon.appendChild(svg);
            }
        });
    });
    
    document.addEventListener('click', function(e) {
        if (isOpen && !mobileMenu.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
            isOpen = false;
            mobileMenu.classList.remove('open');
            document.body.style.overflow = '';
        }
    });
}

// ========================================
// Smooth Scroll
// ========================================
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const targetId = href.substring(1);
            const targetElement = document.getElementById(targetId);
            
            if (targetElement) {
                const offsetTop = targetElement.offsetTop - 80;
                
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
}

// ========================================
// Scroll Animations
// ========================================
function initScrollAnimations() {
    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver(function(entries) {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                const parent = entry.target.parentElement;
                const siblings = parent.querySelectorAll('.animate-on-scroll');
                const siblingIndex = Array.from(siblings).indexOf(entry.target);
                
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, siblingIndex * 100);
                
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    animatedElements.forEach(element => {
        observer.observe(element);
    });
}

// ========================================
// Contact Form
// ========================================
function initContactForm() {
    const form = document.getElementById('contactForm');
    const submitBtn = document.getElementById('submitBtn');
    const formMessage = document.getElementById('formMessage');
    
    if (!form) return;
    
    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const formData = {
            name: document.getElementById('name').value.trim(),
            email: document.getElementById('email').value.trim(),
            company: document.getElementById('company')?.value.trim() || '',
            phone: document.getElementById('phone')?.value.trim() || '',
            message: document.getElementById('message').value.trim()
        };
        
        if (!formData.name || !formData.email || !formData.message) {
            showMessage(formMessage, 'Please fill in all required fields.', 'error');
            return;
        }
        
        const btnText = submitBtn.querySelector('.btn-text');
        const btnLoading = submitBtn.querySelector('.btn-loading');
        if (btnText && btnLoading) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
        }
        submitBtn.disabled = true;
        
        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            
            const result = await response.json();
            
            if (result.success) {
                showMessage(formMessage, result.message, 'success');
                form.reset();
            } else {
                showMessage(formMessage, result.message || 'Something went wrong.', 'error');
            }
        } catch (error) {
            showMessage(formMessage, 'Network error. Please try again.', 'error');
        } finally {
            if (btnText && btnLoading) {
                btnText.style.display = 'inline';
                btnLoading.style.display = 'none';
            }
            submitBtn.disabled = false;
        }
    });
    
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = 'form-message ' + type;
        
        setTimeout(() => {
            element.className = 'form-message';
            element.textContent = '';
        }, 5000);
    }
}

// ========================================
// Utility
// ========================================
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}