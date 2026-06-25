/* ==========================================================================
   MILKNEST CLINICAL FOOD-TECH INTERACTIVE LOGIC
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

    // Status text mapping for clinical preloader feedback
    const preloaderStates = [
        { threshold: 15, text: "Initializing telemetry circuits..." },
        { threshold: 35, text: "Syncing collection silos data..." },
        { threshold: 55, text: "Configuring laboratory testing profiles..." },
        { threshold: 75, text: "Validating HTST pasteurization loops..." },
        { threshold: 90, text: "Syncing packaging sterilization codes..." },
        { threshold: 98, text: "Mapping active distribution cold chains..." },
        { threshold: 100, text: "Milknest online. System launching." }
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
        if (progressBarEl) progressBarEl.style.width = `${progress}%`;
        if (progressPercentEl) progressPercentEl.textContent = `${Math.round(progress)}%`;

        // Animate milk filling bottle SVG
        if (milkLiquidEl && milkWaveEl) {
            const newY = 120 - (progress / 100) * 105;
            milkLiquidEl.setAttribute('y', newY);
            milkLiquidEl.setAttribute('height', 120 - newY);
            milkWaveEl.setAttribute('d', `M 0 ${newY} Q 25 ${newY - 8}, 50 ${newY} T 100 ${newY} L 100 120 L 0 120 Z`);
        }

        // Update preloader status text
        const stateObj = preloaderStates.find(state => progress <= state.threshold);
        if (stateObj && statusTextEl) {
            statusTextEl.textContent = stateObj.text;
        }

        if (loadedResourcesCount === totalResources) {
            setTimeout(completePreloading, 500); // 500ms delay for visual completeness
        }
    }

    function completePreloading() {
        if (preloaderEl) preloaderEl.classList.add('fade-out');

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
    // 3. MOUSE GLOW ORB (SMOOTH INTERPOLATED TRACKING)
    // ----------------------------------------------------------------------
    const glowOrb = document.getElementById('mouse-glow-orb');
    let mouseX = 0, mouseY = 0;
    let orbX = 0, orbY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });

    // Lerp (Linear Interpolation) loop for ultra-smooth orb tracking
    function updateOrbPosition() {
        const dx = mouseX - orbX;
        const dy = mouseY - orbY;

        // Speed ratio (0.08 offers smooth fluid delay)
        orbX += dx * 0.08;
        orbY += dy * 0.08;

        if (glowOrb) {
            glowOrb.style.left = `${orbX}px`;
            glowOrb.style.top = `${orbY}px`;
        }

        requestAnimationFrame(updateOrbPosition);
    }
    requestAnimationFrame(updateOrbPosition);

    // ----------------------------------------------------------------------
    // 4. HERO SECTION 3D PARALLAX SHOWCASE
    // ----------------------------------------------------------------------
    const heroSection = document.getElementById('hero');
    const parallaxWrapper = document.getElementById('hero-parallax-wrapper');
    const parallaxImg = document.getElementById('hero-parallax-img');

    if (heroSection && parallaxWrapper && parallaxImg) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();

            // Normalize cursor position (-0.5 to 0.5)
            const xVal = (e.clientX - rect.left) / rect.width - 0.5;
            const yVal = (e.clientY - rect.top) / rect.height - 0.5;

            // Calculate 3D tilt coordinates
            const rotateX = -yVal * 25; // Max 12.5 deg tilt
            const rotateY = xVal * 25;
            const transX = xVal * 30;   // Max 15px translation
            const transY = yVal * 30;

            parallaxWrapper.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translate3d(${transX}px, ${transY}px, 0)`;
            parallaxImg.style.transform = `scale(1.03)`;
        });

        heroSection.addEventListener('mouseleave', () => {
            // Reset to identity
            parallaxWrapper.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) translate3d(0, 0, 0)';
            parallaxImg.style.transform = 'scale(1)';
        });
    }

    // ----------------------------------------------------------------------
    // 5. CANVAS CONTROLLER & RESIZING (STICKY SEQUENCE)
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

        // Object-Fit Cover formula for canvas drawing
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
    // 6. SCROLL INTERACTION & SCADA HUD SIGNAL CONTROLLER
    // ----------------------------------------------------------------------
    const journeySection = document.getElementById('journey');
    const stepperDots = document.querySelectorAll('.step-dot');
    const stepperProgress = document.getElementById('journey-stepper-progress');

    // SCADA HUD Elements
    const hudFlowVal = document.getElementById('hud-flow');
    const hudTempVal = document.getElementById('hud-temp');
    const hudPurityVal = document.getElementById('hud-purity');
    const hudPhVal = document.getElementById('hud-ph');

    // Milestones definitions
    const stepThresholds = [
        { step: 1, min: 0.0, max: 0.20 },
        { step: 2, min: 0.20, max: 0.40 },
        { step: 3, min: 0.40, max: 0.60 },
        { step: 4, min: 0.60, max: 0.80 },
        { step: 5, min: 0.80, max: 1.00 }
    ];

    // HUD Target values for each processing step
    const hudTelemetryData = {
        1: { temp: 4.1, flow: 15.2, purity: 99.2, ph: 6.60 },
        2: { temp: 4.0, flow: 0.0, purity: 99.5, ph: 6.65 },
        3: { temp: 72.2, flow: 22.4, purity: 99.8, ph: 6.62 },
        4: { temp: 6.0, flow: 10.5, purity: 99.9, ph: 6.68 },
        5: { temp: 4.2, flow: 35.8, purity: 99.9, ph: 6.67 }
    };

    function updateHudTelemetry(step, progressInRange) {
        const data = hudTelemetryData[step];
        if (!data) return;

        // Add a micro random noise to make the dashboard look "alive" and processing
        const noise = () => (Math.random() - 0.5) * 0.05;
        const flowNoise = step === 2 ? 0 : (Math.random() - 0.5) * 0.2;

        // Interpolate or apply variables
        const finalTemp = (data.temp + noise()).toFixed(1);
        const finalFlow = (data.flow + flowNoise).toFixed(1);
        const finalPurity = (data.purity + (Math.random() * 0.02)).toFixed(2);
        const finalPh = (data.ph + (noise() * 0.05)).toFixed(2);

        if (hudFlowVal) hudFlowVal.textContent = `${finalFlow} L/s`;
        if (hudTempVal) hudTempVal.textContent = `${finalTemp} °C`;
        if (hudPurityVal) hudPurityVal.textContent = `${finalPurity} %`;
        if (hudPhVal) hudPhVal.textContent = finalPh;
    }

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

        // 3. Active step cards fade transitions & telemetry updates
        let activeStep = 1;
        stepThresholds.forEach(threshold => {
            const card = document.getElementById(`journey-step-${threshold.step}`);
            const dot = document.querySelector(`.step-dot[data-step="${threshold.step}"]`);

            if (scrollRatio >= threshold.min && scrollRatio <= threshold.max) {
                activeStep = threshold.step;
                if (card) card.classList.add('active');
                if (dot) dot.classList.add('active');

                // Calculate local progress inside this specific step range
                const rangeSpan = threshold.max - threshold.min;
                const localProgress = (scrollRatio - threshold.min) / rangeSpan;
                updateHudTelemetry(activeStep, localProgress);
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
    // 7. SHRUNKEN STICKY HEADER & NAV ACTIVE STATE (SCROLL SPY)
    // ----------------------------------------------------------------------
    const header = document.getElementById('main-header');
    const sections = document.querySelectorAll('section');
    const navItems = document.querySelectorAll('.nav-item');

    function handleHeaderScroll() {
        if (window.scrollY > 50) {
            if (header) header.classList.add('shrink');
        } else {
            if (header) header.classList.remove('shrink');
        }

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

    // Mobile nav
    const navToggle = document.getElementById('mobile-nav-toggle');
    const navMenu = document.getElementById('nav-menu');

    if (navToggle && navMenu) {
        navToggle.addEventListener('click', () => {
            navToggle.classList.toggle('open');
            navMenu.classList.toggle('open');
        });

        navItems.forEach(item => {
            item.addEventListener('click', () => {
                navToggle.classList.remove('open');
                navMenu.classList.remove('open');
            });
        });
    }

    // ----------------------------------------------------------------------
    // 8. MASTER-DETAIL PRODUCT SWITCHER
    // ----------------------------------------------------------------------
    const masterCards = document.querySelectorAll('.product-master-card');
    const showcaseContainer = document.querySelector('.showcase-card-inner');

    // Showcase UI elements
    const showcaseImg = document.getElementById('showcase-main-img');
    const showcaseTag = document.getElementById('showcase-tag');
    const showcaseTitle = document.getElementById('showcase-title');
    const showcaseDesc = document.getElementById('showcase-desc');
    const showcaseFat = document.getElementById('showcase-fat');
    const showcaseSnf = document.getElementById('showcase-snf');
    const showcaseShelf = document.getElementById('showcase-shelf');
    const showcaseTemp = document.getElementById('showcase-temp');

    function updateProductShowcase(card) {
        if (!showcaseContainer || card.classList.contains('active')) return;

        // Toggle active classes
        masterCards.forEach(c => c.classList.remove('active'));
        card.classList.add('active');

        // Add soft fade-out transition
        showcaseContainer.classList.add('fade-out');

        setTimeout(() => {
            // Read parameters from data attributes
            const name = card.getAttribute('data-product-name');
            const tag = card.getAttribute('data-tag');
            const imgPath = card.getAttribute('data-image');
            const fat = card.getAttribute('data-fat');
            const snf = card.getAttribute('data-snf');
            const shelf = card.getAttribute('data-shelf');
            const temp = card.getAttribute('data-temp');
            const desc = card.getAttribute('data-desc');

            // Set content in showcase
            if (showcaseImg) {
                showcaseImg.src = imgPath;
                showcaseImg.alt = name;
            }
            if (showcaseTag) showcaseTag.textContent = tag;
            if (showcaseTitle) showcaseTitle.textContent = name;
            if (showcaseDesc) showcaseDesc.textContent = desc;
            if (showcaseFat) showcaseFat.textContent = fat;
            if (showcaseSnf) showcaseSnf.textContent = snf;
            if (showcaseShelf) showcaseShelf.textContent = shelf;
            if (showcaseTemp) showcaseTemp.textContent = temp;

            // Remove fade-out class to slide/fade back in
            showcaseContainer.classList.remove('fade-out');
        }, 200);
    }

    masterCards.forEach(card => {
        // Trigger on click
        card.addEventListener('click', () => {
            updateProductShowcase(card);
        });

        // Trigger on hover for premium seamless catalog interaction
        card.addEventListener('mouseenter', () => {
            updateProductShowcase(card);
        });
    });

    // ----------------------------------------------------------------------
    // 9. MAGNETIC CTA BUTTON CONTROLLER
    // ----------------------------------------------------------------------
    const magneticBtn = document.querySelector('.btn-magnetic');

    if (magneticBtn) {
        const mText = magneticBtn.querySelector('.magnetic-text');

        magneticBtn.addEventListener('mousemove', (e) => {
            const rect = magneticBtn.getBoundingClientRect();

            // Cursor position relative to center of button
            const x = e.clientX - rect.left - rect.width / 2;
            const y = e.clientY - rect.top - rect.height / 2;

            // Pull button border slightly (max 10px)
            magneticBtn.style.transform = `translate(${x * 0.25}px, ${y * 0.25}px)`;

            // Pull interior text slightly further for 3D depth (max 20px)
            if (mText) {
                mText.style.transform = `translate(${x * 0.4}px, ${y * 0.4}px)`;
            }
        });

        magneticBtn.addEventListener('mouseleave', () => {
            // Reset transforms with elastic transitions
            magneticBtn.style.transform = 'translate(0px, 0px)';
            if (mText) {
                mText.style.transform = 'translate(0px, 0px)';
            }
        });
    }

    // ----------------------------------------------------------------------
    // 10. OPERATIONS GALLERY CATEGORY FILTER
    // ----------------------------------------------------------------------
    const filterBtns = document.querySelectorAll('.filter-btn');
    const galleryItems = document.querySelectorAll('.gallery-item');

    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Active Class Switch
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const categoryFilter = btn.getAttribute('data-filter');

            galleryItems.forEach(item => {
                const itemCategory = item.getAttribute('data-category');

                if (categoryFilter === 'all' || itemCategory === categoryFilter) {
                    // Soft reveal
                    item.style.display = 'block';
                    setTimeout(() => {
                        item.style.opacity = '1';
                        item.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    // Soft fade hide
                    item.style.opacity = '0';
                    item.style.transform = 'scale(0.95)';
                    setTimeout(() => {
                        item.style.display = 'none';
                    }, 300);
                }
            });
        });
    });

    // ----------------------------------------------------------------------
    // 11. COUNTER ANIMATION FOR STATS CARDS
    // ----------------------------------------------------------------------
    function animateCounter(element) {
        const target = parseInt(element.getAttribute('data-target'));
        const duration = 2000;
        const startTime = performance.now();

        function updateNumber(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Cubic ease-out
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const currentValue = Math.floor(easeProgress * target);

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

                    // Trigger stat progress line fill animations
                    const fills = document.querySelectorAll('.stat-progress-fill');
                    fills.forEach(fill => {
                        const targetWidth = fill.parentElement.parentElement.querySelector('.stat-progress-fill').style.width;
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
    // 12. INTERSECTION OBSERVER FOR SCROLL REVEALS
    // ----------------------------------------------------------------------
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right');

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('reveal');
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

        revealElements.forEach(el => observer.observe(el));
    }

    // ----------------------------------------------------------------------
    // 13. LIGHTBOX MODAL FOR GALLERY
    // ----------------------------------------------------------------------
    const galleryItemContainers = document.querySelectorAll('.gallery-item');
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption-text');
    const lightboxClose = document.getElementById('lightbox-close-btn');
    const lightboxPrev = document.getElementById('lightbox-prev-btn');
    const lightboxNext = document.getElementById('lightbox-next-btn');
    let currentGalleryIndex = 0;

    function openLightbox(index) {
        currentGalleryIndex = index;
        const item = galleryItemContainers[index];
        const src = item.getAttribute('data-src');
        const caption = item.getAttribute('data-caption');

        if (lightboxImg) lightboxImg.src = src;
        if (lightboxCaption) lightboxCaption.textContent = caption;

        if (lightbox) {
            lightbox.classList.add('show');
            lightbox.setAttribute('aria-hidden', 'false');
        }
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (lightbox) {
            lightbox.classList.remove('show');
            lightbox.setAttribute('aria-hidden', 'true');
        }
        document.body.style.overflow = '';
    }

    function showNextImage() {
        let nextIndex = currentGalleryIndex + 1;
        if (nextIndex >= galleryItemContainers.length) nextIndex = 0;

        // Skip hidden filtered gallery items
        while (galleryItemContainers[nextIndex] && galleryItemContainers[nextIndex].style.display === 'none') {
            nextIndex++;
            if (nextIndex >= galleryItemContainers.length) nextIndex = 0;
            if (nextIndex === currentGalleryIndex) break;
        }
        openLightbox(nextIndex);
    }

    function showPrevImage() {
        let prevIndex = currentGalleryIndex - 1;
        if (prevIndex < 0) prevIndex = galleryItemContainers.length - 1;

        // Skip hidden filtered gallery items
        while (galleryItemContainers[prevIndex] && galleryItemContainers[prevIndex].style.display === 'none') {
            prevIndex--;
            if (prevIndex < 0) prevIndex = galleryItemContainers.length - 1;
            if (prevIndex === currentGalleryIndex) break;
        }
        openLightbox(prevIndex);
    }

    galleryItemContainers.forEach((item, index) => {
        item.addEventListener('click', () => openLightbox(index));
    });

    if (lightboxClose) lightboxClose.addEventListener('click', closeLightbox);
    if (lightboxNext) lightboxNext.addEventListener('click', showNextImage);
    if (lightboxPrev) lightboxPrev.addEventListener('click', showPrevImage);

    if (lightbox) {
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (!lightbox || !lightbox.classList.contains('show')) return;
        if (e.key === 'Escape') closeLightbox();
        if (e.key === 'ArrowRight') showNextImage();
        if (e.key === 'ArrowLeft') showPrevImage();
    });

    // ----------------------------------------------------------------------
    // 14. CONTACT FORM HANDLING
    // ----------------------------------------------------------------------
    const contactForm = document.getElementById('milknest-contact-form');
    const formFeedback = document.getElementById('form-feedback');

    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const submitBtn = document.getElementById('contact-form-submit-btn');
            const originalText = submitBtn.innerHTML;

            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Submitting Data... <span class="spinner"></span>';

            if (formFeedback) {
                formFeedback.style.display = 'none';
                formFeedback.className = 'form-feedback';
            }

            setTimeout(() => {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;

                if (formFeedback) {
                    formFeedback.textContent = "Telemetry submitted successfully! Our partnership board will establish contact.";
                    formFeedback.classList.add('success');
                }
                contactForm.reset();
            }, 1800);
        });
    }

    // ----------------------------------------------------------------------
    // 15. BACK TO TOP BUTTON WITH PROGRESS CIRCLE
    // ----------------------------------------------------------------------
    const backToTopBtn = document.getElementById('back-to-top');
    const progressFill = document.getElementById('back-to-top-progress');
    const circleLength = 125.6;

    function handleBackToTop() {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPosition = window.scrollY;

        if (scrollTotal <= 0) return;

        if (scrollPosition > 400) {
            if (backToTopBtn) backToTopBtn.classList.add('show');
        } else {
            if (backToTopBtn) backToTopBtn.classList.remove('show');
        }

        const progressPercent = Math.min(scrollPosition / scrollTotal, 1);

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
