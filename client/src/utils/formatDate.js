export const formatDate = (dateInput) => {
  if (!dateInput) return "—";

  const date = new Date(dateInput);

  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};
