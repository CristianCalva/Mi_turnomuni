export default function debounce<T extends (...args: any[]) => any>(fn: T, wait = 300) {
  let timer: any = null;
  return (...args: Parameters<T>) => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => fn(...args), wait);
  };
}
