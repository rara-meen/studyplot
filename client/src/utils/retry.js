export const withRetry = async (fn, retries = 2, delayMs = 800) => {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      const isLastAttempt = attempt === retries;
      const isClientError =
        error?.response?.status >= 400 && error?.response?.status < 500;

      if (isLastAttempt || isClientError) {
        throw error;
      }

      await new Promise((resolve) => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
};
