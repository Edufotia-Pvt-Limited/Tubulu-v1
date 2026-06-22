export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number = 2000
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    if (timeout) clearTimeout(timeout);
    timeout = setTimeout(() => {
      func(...args);
    }, wait);
  };
}
