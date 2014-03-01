function mod(m, n) {
	return ((m % n) + n) % n;
}

function inv(x, p) {
	for ( var i = 0; i < p; i++) {
		if (mod(x * i, p) == 1) {
			return i;
		}
	}
}

function Point(x, y, p) {
	this.x = x;
	this.y = y;
	this.p = p;

	this.add = add;
	function add(p2) {
		if ((this.x == p2.x) && (this.y == p2.y)) {
			var s = mod((3 * this.x * this.x + 1) * inv(2 * this.y, p), p);
			var x = mod(s * s - 2 * this.x, p);
			var y = mod(-this.y + s * (this.x - x), p);
			return new Point(x, y, p);
		} else {
			var s = mod((this.y - p2.y) * inv(this.x - p2.x, p), p);
			var x = mod(s * s - this.x - p2.x, p);
			var y = mod(-this.y + s * (this.x - x), p);
			return new Point(x, y, p);

		}
	}
}
