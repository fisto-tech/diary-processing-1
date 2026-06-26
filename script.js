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

        // Start GSAP reveals, counters, and slider controllers
        initScrollReveals();
        initStatsCounters();
        initJourneyGSAP();
        initProductSlider();

        // Enable page interactions
        document.body.style.overflowY = 'auto';
    }

    // Disable scrolling during preloader
    document.body.style.overflowY = 'hidden';
    initPreloading();

    // ----------------------------------------------------------------------
    // 3. CUSTOM INTERACTIVE CURSOR & MOUSE GLOW ORB
    // ----------------------------------------------------------------------
    const cursor = document.getElementById('custom-cursor');
    const cursorDot = document.getElementById('custom-cursor-dot');
    const glowOrb = document.getElementById('mouse-glow-orb');

    let mouseX = 0, mouseY = 0;
    let orbX = 0, orbY = 0;

    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;

        // Position the inner dot immediately
        if (cursorDot) {
            gsap.set(cursorDot, { x: mouseX, y: mouseY });
        }

        // Lag-follow the outer ring using GSAP
        if (cursor) {
            gsap.to(cursor, {
                x: mouseX,
                y: mouseY,
                duration: 0.15,
                ease: "power2.out",
                overwrite: "auto"
            });
        }
    });

    // Add hover scale effect for interactive elements
    const interactiveSelectors = 'a, button, .product-slider-card, .gallery-item, .step-dot, .filter-btn, input, textarea';
    document.addEventListener('mouseover', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            if (cursor) cursor.classList.add('cursor-hover');
            if (cursorDot) cursorDot.classList.add('cursor-hover');
        }
    });
    document.addEventListener('mouseout', (e) => {
        if (e.target.closest(interactiveSelectors)) {
            if (cursor) cursor.classList.remove('cursor-hover');
            if (cursorDot) cursorDot.classList.remove('cursor-hover');
        }
    });

    // Lerp loop for the ambient light-mode background orb
    function updateOrbPosition() {
        const dx = mouseX - orbX;
        const dy = mouseY - orbY;

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
    // 4. HERO SECTION 3D PARALLAX SHOWCASE & TILT PHYSICS
    // ----------------------------------------------------------------------
    const heroSection = document.getElementById('hero');
    const parallaxWrapper = document.getElementById('hero-parallax-wrapper');
    const parallaxImg = document.getElementById('hero-parallax-img');

    if (heroSection && parallaxWrapper && parallaxImg) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const xVal = (e.clientX - rect.left) / rect.width - 0.5;
            const yVal = (e.clientY - rect.top) / rect.height - 0.5;

            // Tilt the outer blueprint panel in 3D
            gsap.to(parallaxWrapper, {
                rotateX: -yVal * 28,
                rotateY: xVal * 28,
                x: xVal * 35,
                y: yVal * 35,
                transformPerspective: 1200,
                duration: 0.4,
                ease: "power2.out",
                overwrite: "auto"
            });

            // Parallax the product image itself slightly slower for 3D depth separation
            gsap.to(parallaxImg, {
                scale: 1.06,
                x: xVal * 15,
                y: yVal * 15,
                duration: 0.4,
                overwrite: "auto"
            });
        });

        heroSection.addEventListener('mouseleave', () => {
            gsap.to(parallaxWrapper, {
                rotateX: 0,
                rotateY: 0,
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                overwrite: "auto"
            });
            gsap.to(parallaxImg, {
                scale: 1,
                x: 0,
                y: 0,
                duration: 0.8,
                ease: "power3.out",
                overwrite: "auto"
            });
        });
    }

    // Generic 3D Tilt helper for interactive cards
    function apply3DTilt(element, maxAngle = 15) {
        element.addEventListener('mousemove', (e) => {
            const rect = element.getBoundingClientRect();
            const x = (e.clientX - rect.left) / rect.width - 0.5;
            const y = (e.clientY - rect.top) / rect.height - 0.5;

            gsap.to(element, {
                rotateX: -y * maxAngle,
                rotateY: x * maxAngle,
                transformPerspective: 1000,
                duration: 0.3,
                ease: "power2.out",
                overwrite: "auto"
            });
        });

        element.addEventListener('mouseleave', () => {
            gsap.to(element, {
                rotateX: 0,
                rotateY: 0,
                duration: 0.6,
                ease: "power3.out",
                overwrite: "auto"
            });
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

    function initJourneyGSAP() {
        if (!journeySection) return;

        const frameObj = { frame: 0 };

        gsap.to(frameObj, {
            frame: totalFrames - 1,
            ease: "none",
            scrollTrigger: {
                trigger: journeySection,
                start: "top top",
                end: "bottom bottom",
                scrub: 1.2,
                onUpdate: (self) => {
                    const index = Math.floor(frameObj.frame);
                    if (index !== currentFrameIndex) {
                        currentFrameIndex = index;
                        drawFrame(currentFrameIndex);
                    }

                    const progress = self.progress;
                    if (stepperProgress) {
                        stepperProgress.style.height = `${progress * 100}%`;
                    }

                    stepThresholds.forEach(threshold => {
                        const card = document.getElementById(`journey-step-${threshold.step}`);
                        const dot = document.querySelector(`.step-dot[data-step="${threshold.step}"]`);

                        if (progress >= threshold.min && progress <= threshold.max) {
                            if (card && !card.classList.contains('active')) {
                                card.classList.add('active');
                                gsap.fromTo(card,
                                    { opacity: 0, y: 30, scale: 0.95, filter: "blur(6px)" },
                                    { opacity: 1, y: 0, scale: 1, filter: "blur(0px)", duration: 0.6, ease: "power3.out", overwrite: "auto" }
                                );
                            }
                            if (dot) dot.classList.add('active');

                            const rangeSpan = threshold.max - threshold.min;
                            const localProgress = (progress - threshold.min) / rangeSpan;
                            updateHudTelemetry(threshold.step, localProgress);
                        } else {
                            if (card && card.classList.contains('active')) {
                                card.classList.remove('active');
                                gsap.to(card, {
                                    opacity: 0,
                                    y: -30,
                                    scale: 0.95,
                                    filter: "blur(6px)",
                                    duration: 0.4,
                                    ease: "power2.in",
                                    overwrite: "auto"
                                });
                            }
                            if (dot) dot.classList.remove('active');
                        }
                    });
                }
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
    // Slider and Showcase UI elements
    const showcaseImg = document.getElementById('showcase-main-img');
    const showcaseTag = document.getElementById('showcase-tag');
    const showcaseTitle = document.getElementById('showcase-title');
    const showcaseDesc = document.getElementById('showcase-desc');
    const showcaseFat = document.getElementById('showcase-fat');
    const showcaseSnf = document.getElementById('showcase-snf');
    const showcaseShelf = document.getElementById('showcase-shelf');
    const showcaseTemp = document.getElementById('showcase-temp');
    const datasheetInner = document.getElementById('datasheet-panel-inner');

    function updateProductDatasheet(card) {
        if (!datasheetInner) return;

        const newName = card.getAttribute('data-product-name');
        if (showcaseTitle && showcaseTitle.textContent === newName) return;

        gsap.to(datasheetInner, {
            opacity: 0,
            y: 15,
            duration: 0.2,
            onComplete: () => {
                const tag = card.getAttribute('data-tag');
                const imgPath = card.getAttribute('data-image');
                const fat = card.getAttribute('data-fat');
                const snf = card.getAttribute('data-snf');
                const shelf = card.getAttribute('data-shelf');
                const temp = card.getAttribute('data-temp');
                const desc = card.getAttribute('data-desc');

                if (showcaseImg) {
                    showcaseImg.src = imgPath;
                    showcaseImg.alt = newName;
                }
                if (showcaseTag) showcaseTag.textContent = tag;
                if (showcaseTitle) showcaseTitle.textContent = newName;
                if (showcaseDesc) showcaseDesc.textContent = desc;
                if (showcaseFat) showcaseFat.textContent = fat;
                if (showcaseSnf) showcaseSnf.textContent = snf;
                if (showcaseShelf) showcaseShelf.textContent = shelf;
                if (showcaseTemp) showcaseTemp.textContent = temp;

                gsap.fromTo(datasheetInner,
                    { opacity: 0, y: -15 },
                    { opacity: 1, y: 0, duration: 0.4, ease: "power2.out" }
                );
            }
        });
    }

    function initProductSlider() {
        const viewport = document.getElementById('product-slider-viewport');
        const track = document.getElementById('product-slider-track');
        const cards = document.querySelectorAll('.product-slider-card');
        const prevBtn = document.getElementById('product-slider-prev');
        const nextBtn = document.getElementById('product-slider-next');

        if (!viewport || !track || !cards.length) return;

        let currentIdx = 0;
        let isDragging = false;
        let startX = 0;

        function scrollToProduct(idx) {
            // Circular rotation of card indices
            currentIdx = (idx + cards.length) % cards.length;

            cards.forEach(c => c.classList.remove('active'));
            const activeCard = cards[currentIdx];
            activeCard.classList.add('active');

            // Apply 3D Perspective Transformations
            cards.forEach((card, i) => {
                let diff = i - currentIdx;

                // Handle boundary warping for smooth wrapping
                if (diff > cards.length / 2) diff -= cards.length;
                if (diff < -cards.length / 2) diff += cards.length;

                const absDiff = Math.abs(diff);

                if (absDiff > 3) {
                    gsap.to(card, {
                        opacity: 0,
                        visibility: 'hidden',
                        duration: 0.4,
                        overwrite: "auto"
                    });
                    return;
                }

                // 3D positioning coordinates
                const translateX = diff * 220;     // Separation
                const translateZ = -absDiff * 160;  // Push back in depth
                const rotateY = diff * -28;         // Fan rotation
                const scale = 1 - absDiff * 0.12;   // Shrink
                const opacity = 1 - absDiff * 0.45; // Fade

                gsap.to(card, {
                    display: 'block',
                    visibility: 'visible',
                    x: translateX,
                    z: translateZ,
                    rotationY: rotateY,
                    scale: scale,
                    opacity: opacity,
                    zIndex: 100 - absDiff,
                    duration: 0.8,
                    ease: "power3.out",
                    overwrite: "auto"
                });

                // Disable interaction with non-focused cards to keep drag intuitive
                if (i === currentIdx) {
                    card.style.pointerEvents = 'auto';
                } else {
                    card.style.pointerEvents = 'none';
                }
            });

            updateProductDatasheet(activeCard);
        }

        if (prevBtn) {
            prevBtn.addEventListener('click', () => {
                scrollToProduct(currentIdx - 1);
            });
        }

        if (nextBtn) {
            nextBtn.addEventListener('click', () => {
                scrollToProduct(currentIdx + 1);
            });
        }

        cards.forEach((card, idx) => {
            card.addEventListener('click', (e) => {
                if (idx !== currentIdx) {
                    e.preventDefault();
                    scrollToProduct(idx);
                }
            });
            // Apply 3D card tilt physics on hover/mouse move
            apply3DTilt(card, 15);
        });

        // Swipe & Drag physics
        viewport.addEventListener('mousedown', (e) => {
            isDragging = true;
            startX = e.pageX;
            viewport.style.cursor = 'grabbing';
        });

        window.addEventListener('mouseup', (e) => {
            if (!isDragging) return;
            isDragging = false;
            viewport.style.cursor = 'grab';

            const deltaX = e.pageX - startX;
            if (deltaX > 60) {
                scrollToProduct(currentIdx - 1);
            } else if (deltaX < -60) {
                scrollToProduct(currentIdx + 1);
            }
        });

        let touchStartX = 0;
        viewport.addEventListener('touchstart', (e) => {
            touchStartX = e.touches[0].clientX;
        }, { passive: true });

        viewport.addEventListener('touchend', (e) => {
            const touchEndX = e.changedTouches[0].clientX;
            const deltaX = touchEndX - touchStartX;

            if (deltaX > 50) {
                scrollToProduct(currentIdx - 1);
            } else if (deltaX < -50) {
                scrollToProduct(currentIdx + 1);
            }
        }, { passive: true });

        // Center card 0 initially
        scrollToProduct(0);
    }

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
    // ----------------------------------------------------------------------
    // 11. COUNTER ANIMATION FOR STATS CARDS
    // ----------------------------------------------------------------------
    function initStatsCounters() {
        const statsSection = document.getElementById('about');
        if (!statsSection) return;

        const counters = document.querySelectorAll('.stat-number');
        const fills = document.querySelectorAll('.stat-progress-fill');

        ScrollTrigger.create({
            trigger: statsSection,
            start: "top 80%",
            toggleActions: "play reverse play reverse",
            onEnter: () => {
                counters.forEach(counter => {
                    const target = parseInt(counter.getAttribute('data-target'));
                    const obj = { val: 0 };
                    gsap.to(obj, {
                        val: target,
                        duration: 1.8,
                        ease: "power3.out",
                        overwrite: "auto",
                        onUpdate: () => {
                            counter.textContent = Math.floor(obj.val).toLocaleString();
                        }
                    });
                });

                fills.forEach(fill => {
                    const targetWidth = fill.style.width || "0%";
                    gsap.fromTo(fill,
                        { width: "0%" },
                        { width: targetWidth, duration: 1.5, ease: "power3.out", overwrite: "auto" }
                    );
                });
            },
            onLeaveBack: () => {
                // Reset to 0 when scrolled past upwards
                counters.forEach(counter => {
                    counter.textContent = "0";
                });
                fills.forEach(fill => {
                    gsap.set(fill, { width: "0%" });
                });
            }
        });
    }

    // ----------------------------------------------------------------------
    // 12. GSAP SCROLLTRIGGER FOR CINEMATIC SCROLL REVEALS
    // ----------------------------------------------------------------------
    function initScrollReveals() {
        const revealElements = document.querySelectorAll('.scroll-reveal-up, .scroll-reveal-left, .scroll-reveal-right');

        revealElements.forEach(el => {
            let xOffset = 0;
            let yOffset = 0;

            if (el.classList.contains('scroll-reveal-up')) yOffset = 60;
            if (el.classList.contains('scroll-reveal-left')) xOffset = -60;
            if (el.classList.contains('scroll-reveal-right')) xOffset = 60;

            gsap.fromTo(el,
                { 
                    opacity: 0, 
                    x: xOffset, 
                    y: yOffset,
                    scale: 0.94,
                    filter: "blur(8px)"
                },
                {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    scale: 1,
                    filter: "blur(0px)",
                    duration: 1.4,
                    delay: 0.15, // Cinematic delay feel
                    ease: "power4.out",
                    scrollTrigger: {
                        trigger: el,
                        start: "top 92%",
                        end: "bottom 8%",
                        toggleActions: "play reverse play reverse",
                        overwrite: "auto"
                    }
                }
            );
        });
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
