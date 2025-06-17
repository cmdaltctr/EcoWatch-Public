/**
 * @file darkMode.js
 * @description Functions for managing dark mode functionality, including toggling,
 * loading user preference from localStorage, and initializing the toggle button.
 */

/**
 * Toggle between dark and light mode
 */
export function toggleDarkMode() {
    const html = document.documentElement;
    const darkModeToggle = document.getElementById("darkModeToggle");
    const darkModeIcon = document.getElementById("darkModeIcon");

    html.classList.toggle("dark");

    // Update the icon based on dark/light mode
    const isDark = html.classList.contains("dark");
    darkModeIcon.className = `fa-solid ${isDark ? "fa-moon" : "fa-sun"}`;

    // Save preference to localStorage
    localStorage.setItem("darkMode", html.classList.contains("dark"));
}

/**
 * Load dark mode preference from localStorage and apply it
 */
export function loadDarkModePreference() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
    if (isDarkMode) {
        document.documentElement.classList.add("dark");
        const darkModeIcon = document.getElementById("darkModeIcon");
        if (darkModeIcon) darkModeIcon.className = "fa-solid fa-moon";
    }
}

/**
 * Initialize the dark mode toggle button
 */
export function initDarkModeToggle() {
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
        darkModeToggle.addEventListener("click", toggleDarkMode);
    }
}
