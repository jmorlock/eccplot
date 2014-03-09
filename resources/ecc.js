/**
 * Integer division.
 */
function div(m, n) {
    return Math.floor(m / n);
}

function mod(m, n) {
    return ((m % n) + n) % n;
}

/**
 * Determine the modular multiplicative inverse using brute force.
 * The time complexity of this algorithm is O(p). 
 */
function inv_brute(x, p) {
    for ( var i = 0; i < p; i++) {
        if (mod(x * i, p) == 1) {
            return i;
        }
    }
}


function euclid_next(prev, curr){
    q = div(prev[0], curr[0]);
    return [
        prev[0] - q * curr[0],
        prev[1] - q * curr[1],
        prev[2] - q * curr[2]
    ];
}

function ext_euclid(a, b) {
     var prev = [a, 1, 0];
     var curr = [b, 0, 1];
     while(curr[0] != 0) {
         var next = euclid_next(prev, curr);
         prev = curr;
         curr = next;
     }

     return prev;
}

/**
 * Determine the modular multiplicative inverse. 
 */
function inv(x, p) {
    var euclid = ext_euclid(x, p);
    return euclid[1];
}

function Curve(p, a, b, c) {
    this.p = p;
    this.a = a;
    this.b = b;
    this.c = c;
}

function Point(x, y) {
    this.x = x;
    this.y = y;
}

function add(p1, p2, curve) {
    if ((p1.x == p2.x) && (p1.y == p2.y)) {
        var s = mod((3 * p1.x * p1.x + curve.a) * inv(2 * p1.y, curve.p),
                curve.p);
        var x = mod(s * s - 2 * p1.x, curve.p);
        var y = mod(-p1.y + s * (p1.x - x), curve.p);
        return new Point(x, y);
    } else {
        var s = mod((p1.y - p2.y) * inv(p1.x - p2.x, curve.p), curve.p);
        var x = mod(s * s - p1.x - p2.x, curve.p);
        var y = mod(-p1.y + s * (p1.x - x), curve.p);
        return new Point(x, y);
    }
}

function isElem(point, curve) {
    return mod(point.y * point.y, curve.p) == mod(curve.a * point.x * point.x
            * point.x + curve.b * point.x + curve.c, curve.p)
}