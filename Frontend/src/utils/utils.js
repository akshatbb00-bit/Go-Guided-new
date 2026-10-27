export function formatDate(dateStr) {
  // Parse the input date string (assuming it's in YYYY-MM-DD format)
  const date = new Date(dateStr);

  // Format the day with leading zero if necessary
  const day = String(date.getDate()).padStart(2, "0");

  // Get the month in title case (e.g., 'Apr')
  const month = date.toLocaleString("en-US", { month: "short" }).slice(0, 3); // 'Apr' instead of 'APR'

  // Get the full year
  const year = date.getFullYear();

  // Return the formatted date as 'DD MMM YYYY'
  return `${day} ${month} ${year}`;
}
