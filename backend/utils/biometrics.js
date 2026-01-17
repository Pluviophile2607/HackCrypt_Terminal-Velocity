const crypto = require('crypto');

// Simulated 128-d face embedding
const generateFaceVector = () => {
    return Array.from({ length: 128 }, () => Math.random());
};

// Simulated comparison
const compareFaceVectors = (v1, v2) => {
    if (!v1 || !v2 || v1.length !== v2.length) return 0;
    let score = 0;
    for (let i = 0; i < v1.length; i++) {
        score += 1 - Math.abs(v1[i] - v2[i]);
    }
    return (score / v1.length) * 100;
};

module.exports = {
    generateFaceVector,
    compareFaceVectors,
};
