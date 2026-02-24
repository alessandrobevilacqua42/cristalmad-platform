import gsap from "gsap";

export function initPremiumCursor() {
    const dot = document.getElementById("cursor-dot");
    const ring = document.getElementById("cursor-ring");

    if (!dot || !ring) return;

    // Set initial position
    gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

    const pos = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    const mouse = { x: pos.x, y: pos.y };
    const speed = 0.2; // The lag factor

    // Quick setters for performance
    const setDotX = gsap.quickSetter(dot, "x", "px");
    const setDotY = gsap.quickSetter(dot, "y", "px");
    const setRingX = gsap.quickSetter(ring, "x", "px");
    const setRingY = gsap.quickSetter(ring, "y", "px");

    window.addEventListener("mousemove", (e) => {
        mouse.x = e.clientX;
        mouse.y = e.clientY;
    });

    // Ticker for smooth physics
    gsap.ticker.add(() => {
        // Dot is faster
        pos.x += (mouse.x - pos.x) * 0.5;
        pos.y += (mouse.y - pos.y) * 0.5;
        setDotX(pos.x);
        setDotY(pos.y);

        // Ring has more inertia (delay)
        const dt = 1.0 - Math.pow(1.0 - speed, gsap.ticker.deltaRatio());

        // We update ring position slightly slower
        // Note: for a true SV feel, the ring shouldn't just follow, 
        // it should have a 'magnetic' tension.
        gsap.set(ring, {
            x: mouse.x,
            y: mouse.y,
            duration: 0.8,
            ease: "power2.out",
            overwrite: "auto"
        });
    });

    // Simplified version using gsap.to for the ring to ensure smooth weighted delay
    // The 'SV' trick is using a slightly longer duration for the ring
    window.addEventListener("mousemove", (e) => {
        gsap.to(dot, {
            x: e.clientX,
            y: e.clientY,
            duration: 0, // Instant
            overwrite: true
        });

        gsap.to(ring, {
            x: e.clientX,
            y: e.clientY,
            duration: 0.4,
            ease: "power3.out",
            overwrite: "auto"
        });
    });

    // Hover states
    const interactables = "a, button, .product-card, .category-card";

    document.addEventListener("mouseover", (e) => {
        if (e.target.closest(interactables)) {
            document.body.classList.add("cursor--hover");
        }
    });

    document.addEventListener("mouseout", (e) => {
        if (e.target.closest(interactables)) {
            document.body.classList.remove("cursor--hover");
        }
    });
}
