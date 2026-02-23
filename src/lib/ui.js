/**
 * Global UI utilities for Cristalmad
 */

export function showToast(message, isError = false) {
    let toast = document.getElementById("global-toast");
    if (!toast) {
        toast = document.createElement("div");
        toast.id = "global-toast";
        toast.className = "toast-ui";
        document.body.appendChild(toast);
    }

    const iconSpan = isError ? '<span style="color: #e74c3c;">⚠️</span>' : '<span style="color: #2ecc71;">✓</span>';
    toast.innerHTML = `${iconSpan} <span>${message}</span>`;
    toast.classList.add("show");

    // Clear any existing timeout to avoid premature hiding
    if (toast.hideTimeout) clearTimeout(toast.hideTimeout);

    toast.hideTimeout = setTimeout(() => {
        toast.classList.remove("show");
    }, 4000);
}
