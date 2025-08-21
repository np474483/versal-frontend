// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
    // Create hamburger menu if it doesn't exist
    const navbars = document.querySelectorAll('.navbar');
    
    navbars.forEach(navbar => {
        // Check if hamburger already exists
        if (!navbar.querySelector('.hamburger')) {
            // Create hamburger button
            const hamburger = document.createElement('button');
            hamburger.className = 'hamburger';
            hamburger.setAttribute('aria-label', 'Toggle navigation menu');
            hamburger.innerHTML = `
                <span class="bar"></span>
                <span class="bar"></span>
                <span class="bar"></span>
            `;
            
            // Insert hamburger before nav-links
            const navLinks = navbar.querySelector('.nav-links');
            if (navLinks) {
                navbar.insertBefore(hamburger, navLinks);
            }
        }
    });

    // Add event listeners for hamburger clicks
    document.addEventListener('click', function(e) {
        if (e.target.closest('.hamburger')) {
            const hamburger = e.target.closest('.hamburger');
            const navbar = hamburger.closest('.navbar');
            const navLinks = navbar.querySelector('.nav-links');
            
            if (navLinks) {
                hamburger.classList.toggle('active');
                navLinks.classList.toggle('active');
            }
        }
    });

    // Close menu when clicking outside
    document.addEventListener('click', function(e) {
        if (!e.target.closest('.navbar')) {
            const navLinks = document.querySelectorAll('.nav-links.active');
            const hamburgers = document.querySelectorAll('.hamburger.active');
            
            navLinks.forEach(link => link.classList.remove('active'));
            hamburgers.forEach(hamburger => hamburger.classList.remove('active'));
        }
    });

    // Close menu when clicking a link
    document.addEventListener('click', function(e) {
        if (e.target.closest('.nav-links a')) {
            const navLinks = document.querySelectorAll('.nav-links.active');
            const hamburgers = document.querySelectorAll('.hamburger.active');
            
            navLinks.forEach(link => link.classList.remove('active'));
            hamburgers.forEach(hamburger => hamburger.classList.remove('active'));
        }
    });
});
