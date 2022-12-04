export function assertDefined<T>(
  value: T,
  error?: string
): asserts value is NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(error ?? "assertDefined failed");
  }
}

export function ensureDefined<T>(value: T, error?: string): NonNullable<T> {
  if (value === undefined || value === null) {
    throw new Error(error ?? "assertDefined failed");
  }
  return value;
}
