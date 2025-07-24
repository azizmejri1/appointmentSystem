// Debug script to understand day format issues

// Test different date formats
const testDate = new Date('2025-01-31'); // Friday
console.log("Test date:", testDate);
console.log("getDay():", testDate.getDay()); // 0-6 where 0=Sunday
console.log("toLocaleDateString('en-US', { weekday: 'long' }):", testDate.toLocaleDateString('en-US', { weekday: 'long' }));

// Test what different locales produce
console.log("\nDifferent locale tests:");
console.log("'en-US':", testDate.toLocaleDateString('en-US', { weekday: 'long' }));
console.log("'en-GB':", testDate.toLocaleDateString('en-GB', { weekday: 'long' }));

// Test the ScheduleCalendar days format
const daysOfWeek = [
  "Monday",
  "Tuesday", 
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

console.log("\nScheduleCalendar days format:");
daysOfWeek.forEach(day => console.log(`"${day}"`));

console.log("\nTest string matching:");
const targetDay = "Friday";
const testDays = ["Friday", "friday", "Friday December 31", "friday december 31"];

testDays.forEach(day => {
  const slotDay = day.toLowerCase().trim();
  const target = targetDay.toLowerCase().trim();
  
  console.log(`"${day}" vs "${targetDay}":`, {
    exact: slotDay === target,
    contains: slotDay.includes(target),
    startsWith: slotDay.startsWith(target)
  });
});
