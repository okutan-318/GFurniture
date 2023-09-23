// Saves options to chrome.storage
function save_options() {
}

// Restores select box and checkbox state using the preferences
// stored in chrome.storage.
function restore_options() {
}

document.addEventListener('DOMContentLoaded', restore_options);
document.getElementById('save').addEventListener('click', save_options);
