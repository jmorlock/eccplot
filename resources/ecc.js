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
 * Determine the modular multiplicative inverse using brute force. The time
 * complexity of this algorithm is O(p).
 */
function inv_brute(x, p) {
    for ( var i = 0; i < p; i++) {
        if (mod(x * i, p) == 1) {
            return i;
        }
    }
}

function euclid_next(prev, curr) {
    q = div(prev[0], curr[0]);
    return [ prev[0] - q * curr[0], prev[1] - q * curr[1],
            prev[2] - q * curr[2] ];
}

function ext_euclid(a, b) {
    var prev = [ a, 1, 0 ];
    var curr = [ b, 0, 1 ];
    while (curr[0] != 0) {
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

function equals(p1, p2) {
    return ((p1.x == p2.x) && (p1.y == p2.y));
}

// Is this a good name?
function Line(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
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

function castRay(p1, p2, curve) {
    var deltaX = p2.x - p1.x, deltaY = p2.y - p1.y;
    // euclidean here
    var end = new Point(p2.x, p2.y);

    do {
        end.x += deltaX;
        end.y += deltaY;
    } while (isElem(end, curve) == false);

    return end;
}

/**
 * Shift line in a way that p1 meets the following conditions. 0 <= x < p 0 <= y <
 * p
 */
function shift(line, curve) {
    while ((line.p1.x < 0) || (line.p2.x < 0)) {
        line.p1.x += curve.p;
        line.p2.x += curve.p;
    }

    while ((line.p1.y < 0) || (line.p2.y < 0)) {
        line.p1.y += curve.p;
        line.p2.y += curve.p;
    }

    while ((line.p1.x > curve.p) || (line.p2.x > curve.p)) {
        line.p1.x -= curve.p;
        line.p2.x -= curve.p;
    }

    while ((line.p1.y > curve.p) || (line.p2.y > curve.p)) {
        line.p1.y -= curve.p;
        line.p2.y -= curve.p;
    }

    return line;
}

function dist(p1, p2) {
    return Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
}

function getDist(p0) {
    return function(p1, p2) {
        return dist(p0, p1) - dist(p0, p2);
    }
}

function uniqPoints(points) {
    var current = points[0];
    var uniqPoints = new Array(current);

    for ( var i = 1; i < points.length; i++) {
        if (!equals(current, points[i])) {
            current = points[i];
            uniqPoints.push(current);
        }
    }

    return uniqPoints;
}

function unitSplit(line) {
    var points = new Array();

    var xMin = Math.min(line.p1.x, line.p2.x);
    var xMax = Math.max(line.p1.x, line.p2.x);
    var yMin = Math.min(line.p1.y, line.p2.y);
    var yMax = Math.max(line.p1.y, line.p2.y);

    for ( var x = xMin; x < xMax; x += 1) {
        var y = (line.p2.y - line.p1.y) / (line.p2.x - line.p1.x)
                * (x - line.p1.x) + line.p1.y;
        points.push(new Point(x, y));
    }

    for ( var y = yMin; y < yMax; y += 1) {
        var x = (line.p2.x - line.p1.x) / (line.p2.y - line.p1.y)
                * (y - line.p1.y) + line.p1.x;
        points.push(new Point(x, y));
    }

    points.push(new Point(xMax, yMax));
    points.sort(getDist(line.p1));

    return uniqPoints(points);
}

function splitLine(line, curve) {
    var points = unitSplit(line);
    var first = points.shift();
    var last = points.pop();

    var relevantPoints = new Array(first);
    for ( var i = 0; i < points.length; i++) {
        if ((points[i].x % curve.p == 0) || (points[i].y % curve.p == 0)) {
            relevantPoints.push(points[i]);
        }
    }
    relevantPoints.push(last);

    var lines = new Array();
    for ( var i = 0; i < relevantPoints.length - 1; i++) {
        lines.push(new Line(
                new Point(relevantPoints[i].x, relevantPoints[i].y), new Point(
                        relevantPoints[i + 1].x, relevantPoints[i + 1].y)));
    }

    for ( var i = 0; i < lines.length; i++) {
        lines[i] = shift(lines[i], curve);
    }

    return lines;
}

function Marker(canvas, point) {

    this.canvas = canvas;
    this.point = point;

    this.draw = function(callback) {
        var xoffset = 40, yoffset = 40, radius = 5, grid = 30;

        var markerCirc = canvas.circle(xoffset + point.x * grid,
                yoffset + point.y * grid, radius).attr("fill", "#0000FF");

        var hoverCirc = canvas.circle(xoffset + point.x * grid,
                yoffset + point.y * grid, 15).attr({
            "fill" : "#000000",
            "opacity" : 0
        });
        hoverCirc.click(function() {
            markerCirc.attr("fill", "#FF0000");
            callback(point);
        });

        var pointLabel = canvas.text(xoffset + point.x * grid + 20,
                yoffset + point.y * grid + 15,
                "(" + point.x + "," + point.y + ")").attr({
            "font-size" : 20
        }).hide().toBack();

        hoverCirc.hover(function() {
            pointLabel.show();
        }, function() {
            pointLabel.hide();
        });
    }
}