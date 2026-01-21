export const generateSubTestId = (
  rootTestId?: string,
  suffix?: string
): string | undefined => {
  if (rootTestId && suffix) {
    return `${rootTestId}-${suffix}`;
  }
  return undefined;
};
