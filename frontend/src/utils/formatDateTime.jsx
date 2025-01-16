export const formatDateTime = (dateString) => {
  const date = new Date(dateString);
  const options = {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true, // Enables AM/PM format
    timeZone: "UTC", // Ensures UTC consistency
  };

  const formattedDate = new Intl.DateTimeFormat("en-US", options).format(date);
  const [datePart, timePart] = formattedDate.split(", ");
  const [month, day, year] = datePart.split("/");

  // Rearrange to YYYY-MM-DD
  return `${year}-${month}-${day} ${timePart}`;
};
