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

    // --- 2. CONTACT FORM HANDLING (Netlify-compatible + fallback) ---
    const contactForm = document.querySelector('.contact-form');

    if (contactForm) {
        // Debounced form validation
        const inputs = contactForm.querySelectorAll('input, textarea');
        inputs.forEach(input => {
            input.addEventListener('input', debounce(() => {
                if (input.checkValidity()) {
                    input.style.borderColor = 'rgba(0, 255, 255, 0.3)';
                } else {
                    input.style.borderColor = '';
                }
            }, 300));
        });

        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // collect form data
            const formData = new FormData(contactForm);
            const data = {};
            formData.forEach((value, key) => (data[key] = value));

            // UI: loading state
            const submitButton = contactForm.querySelector('button[type="submit"]');
            const originalText = submitButton.textContent;
            submitButton.textContent = 'Sending...';
            submitButton.disabled = true;

            // Determine endpoint behavior:
            // If form has data-netlify or window.API_ENDPOINT === '/', send to Netlify (urlencoded to '/')
            // Otherwise send JSON to API_ENDPOINT (if provided) or fallback to '/'
            const apiEndpoint = window.API_ENDPOINT || '/';
            const isNetlify = contactForm.hasAttribute('data-netlify') || apiEndpoint === '/';

            // helper to encode for application/x-www-form-urlencoded
            const encode = (obj) =>
                Object.keys(obj)
                      .map(k => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
                      .join('&');

            try {
                let response;

                if (isNetlify) {
                    // Netlify requires form-name field to match the <form name="...">
                    // Ensure the form has a name attribute (we expect name="contact")
                    const formName = contactForm.getAttribute('name') || 'contact';
                    const payload = Object.assign({ 'form-name': formName }, data);

                    response = await fetch('/', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: encode(payload)
                    });

                    // Netlify returns HTML on redirect or 200, treat any ok status as success
                    if (!response.ok) {
                        throw new Error(`Netlify form submit failed: ${response.status}`);
                    }
                } else {
                    // Post JSON to custom API endpoint (existing Cloudflare worker or other)
                    response = await fetch(apiEndpoint, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(data)
                    });

                    if (!response.ok) {
                        // try to parse JSON error for more detail
                        let text = await response.text().catch(() => '');
                        throw new Error(`API submit failed: ${response.status} - ${text}`);
                    }
                }

                // success UI
                submitButton.textContent = '✓ Sent!';
                submitButton.style.background = 'rgba(0, 255, 0, 0.15)';
                // reset after short delay
                setTimeout(() => {
                    contactForm.reset();
                    submitButton.textContent = originalText;
                    submitButton.disabled = false;
                    submitButton.style.background = '';
                }, 1800);

                console.info('Form submitted successfully', { isNetlify, endpoint: isNetlify ? '/' : apiEndpoint });
            } catch (err) {
                console.error('Error submitting form:', err);
                submitButton.textContent = originalText;
                submitButton.disabled = false;

                // show friendly error to user
                alert('Oops — something went wrong sending your message. Please try again later.');

                // Optional: fallback: open user's email client prefilled (uncomment if desired)
                // const email = data.email || '';
                // const message = data.message ? encodeURIComponent(data.message) : '';
                // window.location = `mailto:asifahmadbengal04@gmail.com?subject=Portfolio%20message%20from%20${encodeURIComponent(data.name || '')}&body=${message}`;
            }
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
