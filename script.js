// Performance: Debounce utility
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

// Performance: Throttle utility for mousemove
function throttle(func, limit) {
    let inThrottle;
    return function(...args) {
        if (!inThrottle) {
            func.apply(this, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

document.addEventListener('DOMContentLoaded', () => {
    
    // --- 1. SMOOTH SCROLLING for Internal Links (Optimized) ---
    const anchors = document.querySelectorAll('a[href^="#"]');
    anchors.forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            if (this.getAttribute('href') === '#') return;
            
            e.preventDefault();
            const targetId = this.getAttribute('href').substring(1);
            const targetElement = document.getElementById(targetId);

            if (targetElement) {
                // Use requestAnimationFrame for smoother scrolling
                requestAnimationFrame(() => {
                    targetElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                });
            }
        }, { passive: false });
    });

    // --- 2. CONTACT FORM HANDLING (Optimized) ---
    const contactForm = document.querySelector('.contact-form');
    
    if (contactForm) {
        // Debounced form validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                // Real-time validation can be added here
                if (input.checkValidity()) {
                    input.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                }
            }, 300));
        });

        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            const formData = new FormData(contactForm);
            const data = {};
            
            formData.forEach((value, key) => (data[key] = value));

            // Show loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;
            
            // Cloudflare Worker endpoint
            // Update this URL with your deployed Cloudflare Worker URL
            // For local development, use: http://localhost:8787/api/contact
            // You can also set this via a data attribute on the form or a global variable
            const apiEndpoint = window.API_ENDPOINT || 
                                'https://dry-bonus-482a.asifahmadbengal04.workers.dev/api/contact';
            
            fetch(apiEndpoint, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            })
            .then(response => {
                if (response.ok) {
                    return response.json();
                }
                throw new Error('Network response was not ok.');
            })
            .then(result => {
                submitButton.textContent = '✓ Sent!';
                submitButton.style.background = 'rgba(0, 255, 0, 0.2)';
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 2000);
            })
            .catch(error => {
                console.error('Error submitting form:', error);
                submitButton.textContent = originalText;
                submitButton.disabled = false;
                alert('Oops! There was an error sending your message. Please try again later.');
            });
        });
    }

    // --- 3. LIQUID GLOW EFFECT ON PROJECTS (GPU Accelerated) ---
    const projectCards = document.querySelectorAll('.project-card');

    projectCards.forEach(card => {
        // Use CSS custom properties for better performance
        const handleMouseMove = throttle((e) => {
            const rect = card.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            
            // Use CSS variables instead of direct style manipulation
            requestAnimationFrame(() => {
                card.style.setProperty('--mouse-x', `${x}%`);
                card.style.setProperty('--mouse-y', `${y}%`);
            });
        }, 16); // ~60fps throttle

        card.addEventListener('mousemove', handleMouseMove, { passive: true });

        card.addEventListener('mouseleave', () => {
            requestAnimationFrame(() => {
                card.style.removeProperty('--mouse-x');
                card.style.removeProperty('--mouse-y');
            });
        }, { passive: true });
    });

    // --- 4. NAVBAR SCROLL EFFECT (Performance Optimized) ---
    const navbar = document.querySelector('.liquid-navbar');
    if (navbar) {
        let lastScrollY = window.scrollY;
        let ticking = false;

        const updateNavbar = () => {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                navbar.style.background = 'rgba(255, 255, 255, 0.12)';
                navbar.style.backdropFilter = 'blur(30px) saturate(180%)';
            } else {
                navbar.style.background = 'rgba(255, 255, 255, 0.08)';
                navbar.style.backdropFilter = 'blur(25px) saturate(180%)';
            }
            
            ticking = false;
        };

        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }, { passive: true });
    }

    // --- 5. INTERSECTION OBSERVER for Fade-in Animations ---
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translateY(0)';
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Observe all cards and sections
    document.querySelectorAll('.liquid-card, section').forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
        observer.observe(el);
    });
});