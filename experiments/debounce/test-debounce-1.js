const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
};

// Example usage
const logInput = (value) => console.log(`Input value: ${value}`);
const debouncedLog = debounce(logInput, 500); // Debounce for 500ms

// Simulate rapid input events
debouncedLog('H');
debouncedLog('He');
debouncedLog('Hel');
debouncedLog('Hell');
debouncedLog('Hello');

// Only "Hello" will be logged after 500ms of inactivity.
