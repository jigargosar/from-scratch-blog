// greeting.js

function greet(name = "World") {
    return `Hello, ${name}!`;
}

// Check if the script is being run directly
if (require.main === module) {
    const nameArg = process.argv[2]; // The third argument will be the name, if provided
    console.log(greet(nameArg));
} else {
    // Export the greet function if the script is imported as a module
    module.exports = {
        greet: greet,
    };
}
