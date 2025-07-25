// Browser console script to check current user
console.log('🔍 Current user info from localStorage:');
console.log('profileId:', localStorage.getItem('profileId'));
console.log('userId:', localStorage.getItem('userId'));
console.log('firstName:', localStorage.getItem('firstName'));
console.log('lastName:', localStorage.getItem('lastName'));

// If you need to switch to the doctor user who received reminders:
// localStorage.setItem('userId', '68828a93221a77604241a919');

// If you need to switch to the patient user who received reminders:
// localStorage.setItem('userId', '688286c9221a77604241a868');
