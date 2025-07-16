// build.js
console.log(`[${new Date().toISOString()}] 🚧 Fake build started`);
setTimeout(() => {
    console.log(`[${new Date().toISOString()}] ✅ Fake build finished`);
    process.exit(0);
}, 2000);
