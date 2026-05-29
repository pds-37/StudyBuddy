// Content Script for Auto-Filling Job Forms

console.log("StudyBuddy Auto-Apply loaded on this page.");

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "AUTO_FILL") {
    const data = request.profileData;
    
    // Basic Greenhouse / Lever targeting
    const nameInput = document.querySelector('input[name="name"], input[name="first_name"]');
    const emailInput = document.querySelector('input[name="email"], input[type="email"]');
    const phoneInput = document.querySelector('input[name="phone"], input[type="tel"]');
    
    if (nameInput) {
      nameInput.value = data.name;
      nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    if (emailInput) {
      emailInput.value = data.email;
      emailInput.dispatchEvent(new Event('input', { bubbles: true }));
    }
    
    // Note: File uploads (resume) require a bit more complexity due to browser security restrictions,
    // usually handled by linking to the StudyBuddy hosted resume URL instead.
    
    sendResponse({ success: true, fieldsFilled: 2 });
  }
});
