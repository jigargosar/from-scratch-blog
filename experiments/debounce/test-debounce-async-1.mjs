// Debounce an async function: only executes on the trailing edge, never within the debounce window
export function debounceAsync(fn, wait) {
  let timeout;
  let lastArgs;
  let lastPromiseResolve, lastPromiseReject;

  return function(...args) {
    lastArgs = args;
    clearTimeout(timeout);
    return new Promise((resolve, reject) => {
      lastPromiseResolve = resolve;
      lastPromiseReject = reject;
      timeout = setTimeout(async () => {
        try {
          const result = await fn(...lastArgs);
          lastPromiseResolve(result);
        } catch (err) {
          lastPromiseReject(err);
        }
      }, wait);
    });
  };
}

// Example usage:
async function myAsyncTask(msg) {
  console.log('Executing:', msg);
  await new Promise(res => setTimeout(res, 100));
  return `Done: ${msg}`;
}

const debouncedTask = debounceAsync(myAsyncTask, 500);

debouncedTask('A');
debouncedTask('B');
debouncedTask('C'); // Only this call will execute after 500ms

