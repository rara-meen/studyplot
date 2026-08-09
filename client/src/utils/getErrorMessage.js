export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (error?.response?.data?.message) {
    return error.response.data.message;
  }
  if (error?.message === "Network Error") {
    return "Couldn't reach the server. Check your connection and try again.";
  }
  if (error?.code === "ECONNABORTED") {
    return "That took too long to respond. Please try again.";
  }
  // Never surface raw JS/axios error internals to the user.
  return fallback;
};
