export function getApiErrorMessage(error, fallbackMessage) {
  const responseData = error?.response?.data;

  if (Array.isArray(responseData?.errors) && responseData.errors.length > 0) {
    return responseData.errors[0];
  }

  return responseData?.message || fallbackMessage;
}
