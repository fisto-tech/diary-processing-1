/* ==========================================================================
   MILKNEST PREMIUM FUNCTIONALITY SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    
    // ----------------------------------------------------------------------
    // 1. STATE & RESOURCE PRELOADING CONFIG
    // ----------------------------------------------------------------------
    const totalFrames = 240;
    const images = [];
    let loadedResourcesCount = 0;

    // List of static assets to preload in addition to journey frames
    const staticAssets = [
        'assets/images/milknest-updated-logo.png',
        'assets/images/product-image.png',
        'assets/images/products/product1.png',
        'assets/images/products/product2.png',
        'assets/images/products/product3.png',
        'assets/images/products/product4.png',
        'assets/images/products/product5.png',
        'assets/images/products/product6.png',
        'assets/images/products/product7.png',
        'assets/images/products/product8.png',
        'assets/images/products/product9.png',
        'assets/images/products/product10.png'
    ];

    const totalResources = totalFrames + staticAssets.length;
    
    // Status text mapping for high-tech preloader feedback
    const preloaderStates = [
        { threshold: 10, text: "Booting core database..." },
        { threshold: 25, text: "Preloading collection telemetry..." },
        { threshold: 45, text: "Calibrating lab analysis frames..." },
        { threshold: 65, text: "Configuring pasteurization model..." },
        { threshold: 85, text: "Syncing packaging line graphics..." },
        { threshold: 95, text: "Finalizing logistics map system..." },
        { threshold: 100, text: "System ready. Launching." }
    ];

    // UI Elements for Preloader
    const preloaderEl = document.getElementById('preloader');
    const progressBarEl = document.getElementById('preloader-bar');
    const progressPercentEl = document.getElementById('preloader-percentage');
    const statusTextEl = document.getElementById('preloader-status-text');
    const milkLiquidEl = document.querySelector('.milk-liquid');
    const milkWaveEl = document.querySelector('.milk-wave');

    // Canvas configuration
    const canvas = document.getElementById('journey-canvas');
    const ctx = canvas.getContext('2d');
    let currentFrameIndex = 0;

    // ----------------------------------------------------------------------
    // 2. RESOURCE PRELOADER RUNNER
    // ----------------------------------------------------------------------
    function initPreloading() {
        // Preload static layout images first
        staticAssets.forEach(src => {
            const img = new Image();
            img.src = src;
            img.onload = onResourceLoaded;
            img.onerror = onResourceLoaded; // Fail-safe
        });

        // Preload scroll sequence canvas frames (00001.webp - 00240.webp)
        for (let i = 1; i <= totalFrames; i++) {
            const img = new Image();
            const frameName = String(i).padStart(5, '0');
            img.src = `assets/images/frames/${frameName}.webp`;
            img.onload = onResourceLoaded;
            img.onerror = onResourceLoaded; // Fail-safe
            images.push(img);
        }
    }

    function onResourceLoaded() {
        loadedResourcesCount++;
        const progress = (loadedResourcesCount / totalResources) * 100;
        
        // Update preloader bar and percentage text
        progressBarEl.style.width = `${progress}%`;
        progressPercentEl.textContent = `${Math.round(progress)}%`;

        // Animate milk filling bottle SVG
        // Bottle SVG height ranges from y=120 (empty) to y=15 (full)
        const newY = 120 - (progress / 100) * 105;
        milkLiquidEl.setAttribute('y', newY);
        milkLiquidEl.setAttribute('height', 120 - newY);
        milkWaveEl.setAttribute('d', `M 0 ${newY} Q 25 ${newY - 8}, 50 ${newY} T 100 ${newY} L 100 120 L 0 120 Z`);

        // Update preloader status text
        const stateObj = preloaderStates.find(state => progress <= state.threshold);
        if (stateObj) {
            statusTextEl.textContent = stateObj.text;
        }

        if (loadedResourcesCount === totalResources) {
            setTimeout(completePreloading, 500); // 500ms delay for visual completeness
        }
    }

    function completePreloading() {
        preloaderEl.classList.add('fade-out');
        
        // Draw the very first frame onto canvas immediately
        resizeCanvas();
        drawFrame(0);
        
        // Start Intersection Observer reveals
        initScrollReveals();
        initStatsCounters();
        
        // Enable page interactions
        document.body.style.overflowY = 'auto';
    }

    // Disable scrolling during preloader
    document.body.style.overflowY = 'hidden';
    initPreloading();

    // ----------------------------------------------------------------------
    // 3. CANVAS CONTROLLER & RESIZING (STICKY SEQUENCE)
    // ----------------------------------------------------------------------
    function resizeCanvas() {
        if (!canvas) return;
        canvas.width = canvas.parentElement.clientWidth;
        canvas.height = canvas.parentElement.clientHeight;
        drawFrame(currentFrameIndex);
    }

    function drawFrame(index) {
        if (!images[index] || !images[index].complete) return;
        const img = images[index];

        // Custom Object-Fit Cover formula for canvas drawing
        const canvasRatio = canvas.width / canvas.height;
        const imgRatio = img.width / img.height;
        let drawWidth, drawHeight, drawX, drawY;

        if (canvasRatio > imgRatio) {
            drawWidth = canvas.width;
            drawHeight = canvas.width / imgRatio;
            drawX = 0;
            drawY = (canvas.height - drawHeight) / 2;
        } else {
            drawWidth = canvas.height * imgRatio;
            drawHeight = canvas.height;
            drawX = (canvas.width - drawWidth) / 2;
            drawY = 0;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, drawX, drawY, drawWidth, drawHeight);
    }

    window.addEventListener('resize', resizeCanvas);

    // ----------------------------------------------------------------------
    // 4. SCROLL INTERACTION & JOURNEY STEP ACTIONS
    // ----------------------------------------------------------------------
    const journeySection = document.getElementById('journey');
    const journeyStepCards = document.querySelectorAll('.journey-step-card');
    const stepperDots = document.querySelectorAll('.step-dot');
    const stepperProgress = document.getElementById('journey-stepper-progress');

    // Milestones definition based on normalized scroll ratios
    const stepThresholds = [
        { step: 1, min: 0.0,  max: 0.20 },
        { step: 2, min: 0.20, max: 0.40 },
        { step: 3, min: 0.40, max: 0.60 },
        { step: 4, min: 0.60, max: 0.80 },
        { step: 5, min: 0.80, max: 1.00 }
    ];

    function handleJourneyScroll() {
        if (!journeySection) return;

        const rect = journeySection.getBoundingClientRect();
        const sectionTop = window.scrollY + rect.top;
        const sectionHeight = rect.height;
        const viewportHeight = window.innerHeight;

        // Calculate scroll ratio inside 400vh journey container
        let scrollRatio = (window.scrollY - sectionTop) / (sectionHeight - viewportHeight);
        scrollRatio = Math.max(0, Math.min(1, scrollRatio));

        // 1. Draw frame based on progress
        const frameIndex = Math.floor(scrollRatio * (totalFrames - 1));
        if (frameIndex !== currentFrameIndex) {
            currentFrameIndex = frameIndex;
            drawFrame(currentFrameIndex);
        }

        // 2. Update vertical stepper progress bar height
        if (stepperProgress) {
            stepperProgress.style.height = `${scrollRatio * 100}%`;
        }

        // 3. Active step cards fade transitions based on scroll thresholds
        let activeStep = 1;
        stepThresholds.forEach(threshold => {
            const card = document.getElementById(`journey-step-${threshold.step}`);
            const dot = document.querySelector(`.step-dot[data-step="${threshold.step}"]`);

            if (scrollRatio >= threshold.min && scrollRatio <= threshold.max) {
                activeStep = threshold.step;
                if (card) card.classList.add('active');
                if (dot) dot.classList.add('active');
            } else {
                if (card) card.classList.remove('active');
                if (dot) dot.classList.remove('active');
            }
        });
    }

    // Scroll to specific step when clicking stepper dots
    stepperDots.forEach(dot => {
        dot.addEventListener('click', () => {
            const stepNum = parseInt(dot.getAttribute('data-step'));
            const threshold = stepThresholds.find(t => t.step === stepNum);
            if (!threshold || !journeySection) return;

            const rect = journeySection.getBoundingClientRect();
            const sectionTop = window.scrollY + rect.top;
            const sectionHeight = rect.height;
            const viewportHeight = window.innerHeight;

            // Target scroll offset
            const targetRatio = (threshold.min + threshold.max) / 2;
            const targetScroll = sectionTop + targetRatio * (sectionHeight - viewportHeight);
            
            window.scrollTo({
                top: targetScroll,
                behavior: 'smooth'
            });
        });
    });

    window.addEventListener('scroll', handleJourneyScroll);

    // ----------------------------------------------------------------------
    // 5. SHRUNKEN STICKY HEADER & NAV ACTIVE STATE (SCROLL SPY)
    // ----------------------------------------------------------------------
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    function handleHeaderScroll() {
        // Sticky shrink class trigger
        if (window.scrollY > 50) {
            header.classList.add('shrink');
        } else {
            header.classList.remove('shrink');
        }

        // Scroll Spy active nav linking
        let activeSectionId = "";
        sections.forEach(section => {
            const sectionTop = section.offsetTop - 120;
            const sectionHeight = section.offsetHeight;
            if (window.scrollY >= sectionTop && window.scrollY < sectionTop + sectionHeight) {
                activeSectionId = section.getAttribute('id');
            }
        });

        navItems.forEach(item => {
            item.classList.remove('active');
            if (item.getAttribute('href') === `#${activeSectionId}`) {
                item.classList.add('active');
            }
        });
    }

    window.addEventListener('scroll', handleHeaderScroll);

    // ----------------------------------------------------------------------
    // 6. MOBILE NAVIGATION DRAWER
    // ----------------------------------------------------------------------
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        // Close menu on clicking nav link
        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 7. COUNTER ANIMATION FOR STATS CARDS
    // ----------------------------------------------------------------------
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000; // 2 seconds
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic ease-out formula
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeProgress * target);
            
            // Format number (add commas if over 1000)
            element.textContent = currentValue.toLocaleString();

            if (progress < 1) {
                requestAnimationFrame(updateNumber);
            } else {
                element.textContent = target.toLocaleString();
            }
        }
        requestAnimationFrame(updateNumber);
    }

    function initStatsCounters() {
        const statsSection = document.getElementById('about');
        const counters = document.querySelectorAll('.stat-number');
        let animated = false;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animated) {
                    counters.forEach(counter => animateCounter(counter));
                    
                    // Trigger stat fill lines
                    const fills = document.querySelectorAll('.stat-progress-fill');
                    fills.forEach(fill => {
                        const targetWidth = fill.style.width;
                        fill.style.width = '0%';
                        setTimeout(() => {
                            fill.style.width = targetWidth;
                        }, 100);
                    });
                    
                    animated = true;
                    observer.unobserve(statsSection);
                }
            });
        }, { threshold: 0.15 });

        if (statsSection) {
            observer.observe(statsSection);
        }
    }

    // ----------------------------------------------------------------------
    // 8. INTERSECTION OBSERVER FOR SCROLL REVEALS
    // ----------------------------------------------------------------------
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right');
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    observer.unobserve(entry.target); // Reveal only once
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }

    // ----------------------------------------------------------------------
    // 9. LIGHTBOX MODAL FOR GALLERY
    // ----------------------------------------------------------------------
    const galleryItems = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption-text');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');
    let currentGalleryIndex = 0;

    function openLightbox(index) {
        currentGalleryIndex = index;
        const item = galleryItems[index];
        const src = item.getAttribute('data-src');
        const caption = item.getAttribute('data-caption');

        lightboxImg.src = src;
        lightboxCaption.textContent = caption;
        
        lightbox.classList.add('show');
        lightbox.setAttribute('aria-hidden', 'false');
        document.body.style.overflow = 'hidden'; // Stop body scrolling
    }

    function closeLightbox() {
        lightbox.classList.remove('show');
        lightbox.setAttribute('aria-hidden', 'true');
        document.body.style.overflow = ''; // Resume body scrolling
    }

    function showNextImage() {
        let nextIndex = currentGalleryIndex + 1;
        if (nextIndex >= galleryItems.length) nextIndex = 0;
        openLightbox(nextIndex);
    }

    function showPrevImage() {
        let prevIndex = currentGalleryIndex - 1;
        if (prevIndex < 0) prevIndex = galleryItems.length - 1;
        openLightbox(prevIndex);
    }

    galleryItems.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

    // Close lightbox when clicking background overlay
    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    // Keyboard controls for lightbox
    document.addEventListener('keydown', (e) => {
        if (!lightbox.classList.contains('show')) return;
        
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // ----------------------------------------------------------------------
    // 10. CONTACT FORM HANDLING
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('milknest-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('contact-form-submit-btn');
            const originalText = submitBtn.innerHTML;

            // Simple loading state
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Sending Inquiry... <span class="spinner"></span>';
            
            // Clear prior feedback
            formFeedback.style.display = 'none';
            formFeedback.className = 'form-feedback';

            // Simulate form submission API call
            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
                
                // Show success status
                formFeedback.textContent = "Inquiry submitted successfully! Our partnership team will contact you shortly.";
                formFeedback.classList.add('success');
                contactForm.reset();
            }, 1800);
        });
    }

    // ----------------------------------------------------------------------
    // 11. BACK TO TOP BUTTON WITH PROGRESS CIRCLE
    // ----------------------------------------------------------------------
    const backToTopBtn = document.getElementById('back-to-top');
    const progressFill = document.getElementById('back-to-top-progress');
    const circleLength = 125.6; // 2 * PI * r (2 * 3.14 * 20)

    function handleBackToTop() {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;

        if (scrollTotal <= 0) return;

        // Show button after scrolling 400px
        if (scrollPosition > 400) {
            backToTopBtn.classList.add('show');
        } else {
            backToTopBtn.classList.remove('show');
        }

        // Calculate progress percentage
        const progressPercent = Math.min(scrollPosition / scrollTotal, 1);
        
        // Update circular stroke offset
        if (progressFill) {
            const offset = circleLength - (progressPercent * circleLength);
            progressFill.style.strokeDashoffset = offset;
        }
    }

    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    window.addEventListener('scroll', handleBackToTop);

});
