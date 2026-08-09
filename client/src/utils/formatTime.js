export const formatTime = (dateInput) => {
  if (!dateInput) return "";

  const date = new Date(dateInput);

  return date.toLocaleTimeString(undefined, {
    hour: "numeric",
    minute: "2-digit",
  });
};
