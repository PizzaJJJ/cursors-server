const compareRandom = function(a, b) {
	return Math.random() - 0.5;
};

module.exports = function(arr) {
    return arr.sort(compareRandom);
};