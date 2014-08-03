var xoffset = 40;
var yoffset = 40;
var grid = 30;

var A = null;

/**
 * Integer division.
 */
function div(m, n) {
    return Math.floor(m / n);
}

/**
 * Modulo function yielding positive values even if m is negative. Note: the
 * result is negative, if n is negative.
 */
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

/**
 * Iteration within the extended euclidean algorithm.
 */
function euclid_next(prev, curr) {
    q = div(prev[0], curr[0]);
    return [ prev[0] - q * curr[0], prev[1] - q * curr[1],
            prev[2] - q * curr[2] ];
}

/**
 * Determine the modular multiplicative inverse using the extended euclidean
 * algorithm. The time complexity of this algorithm is O(log(m)**2).
 */
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

/**
 * Class representing discrete elliptic curve
 */
function Curve(p, a, b, c) {
    this.p = p;
    this.a = a;
    this.b = b;
    this.c = c;
}

/**
 * Class representing a point
 */
function Point(x, y) {
    this.x = x;
    this.y = y;
}

/**
 * Copy input point
 */
function copyPoint(point) {
    return new Point(point.x, point.y);
}

/**
 * Check whether two points are equal.
 */
function equals(p1, p2) {
    return ((p1.x == p2.x) && (p1.y == p2.y));
}

/**
 * Euclidean distance between two points.
 */
function dist(p1, p2) {
    return Math.sqrt(Math.pow(p2.y - p1.y, 2) + Math.pow(p2.x - p1.x, 2));
}

/**
 * Arrow starting at p1, ending at p2
 */
function Arrow(p1, p2) {
    this.p1 = p1;
    this.p2 = p2;
}

/**
 * Copy input arrow
 */
function copyArrow(arrow) {
    return new Arrow(copyPoint(arrow.p1), copyPoint(arrow.p2));
}

/**
 * Add two points. Both must lie on the given curve.
 */
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

/**
 * Check whether an input point lies on a given curve.
 */
function isElem(point, curve) {
    return mod(point.y * point.y, curve.p) == mod(curve.a * point.x * point.x
            * point.x + curve.b * point.x + curve.c, curve.p)
}

/**
 * Return the greatest common divisor of a and b. The result is positive.
 */
function gcd(a, b) {
    if (b == 0) {
        return a;
    }
    return Math.abs(gcd(b, mod(a, b)));
}

/**
 * Return the first point which is met by an extended arrow from p1 to p2. All
 * points involved must lie on the given curve.
 */
function castRay(p1, p2, curve) {
    if ((p1.x == p2.x) && (p1.y == p2.y)) {
        var deltaX = mod(2 * p1.y, curve.p);
        var deltaY = mod(3 * curve.a * p1.x * p1.x + curve.b, curve.p);
    } else {
        var deltaX = p2.x - p1.x, deltaY = p2.y - p1.y;
    }

    var dgcd = gcd(deltaX, deltaY);
    deltaX /= dgcd;
    deltaY /= dgcd;

    var end = new Point(p2.x, p2.y);

    do {
        end.x += deltaX;
        end.y += deltaY;
    } while (isElem(end, curve) == false);

    return end;
}

/**
 * Shift the input arrow vertically and horizontally by multiples of p. The
 * result is a new array where the coordinates of both points satisfy the
 * equations (0 <= x <= p) and( 0 <= y <= p).
 */
function shift(inputArrow, p) {
    var arrow = copyArrow(inputArrow);

    while ((arrow.p1.x < 0) || (arrow.p2.x < 0)) {
        arrow.p1.x += p;
        arrow.p2.x += p;
    }

    while ((arrow.p1.y < 0) || (arrow.p2.y < 0)) {
        arrow.p1.y += p;
        arrow.p2.y += p;
    }

    while ((arrow.p1.x > p) || (arrow.p2.x > p)) {
        arrow.p1.x -= p;
        arrow.p2.x -= p;
    }

    while ((arrow.p1.y > p) || (arrow.p2.y > p)) {
        arrow.p1.y -= p;
        arrow.p2.y -= p;
    }

    return arrow;
}

/**
 * Return a comparison function indicating which of two input points p1 and p2
 * possesses the smaller distance to a common reference point p0.
 */
function getDist(p0) {
    return function(p1, p2) {
        return dist(p0, p1) - dist(p0, p2);
    }
}

/**
 * Remove identical points occurring in a row.
 */
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

/**
 * Split the input arrow at each point where either x or y is integer.
 */
function unitSplit(arrow) {
    var points = new Array();

    var xMin = Math.min(arrow.p1.x, arrow.p2.x);
    var xMax = Math.max(arrow.p1.x, arrow.p2.x);
    var yMin = Math.min(arrow.p1.y, arrow.p2.y);
    var yMax = Math.max(arrow.p1.y, arrow.p2.y);

    for ( var x = xMin; x < xMax; x += 1) {
        var y = (arrow.p2.y - arrow.p1.y) / (arrow.p2.x - arrow.p1.x)
                * (x - arrow.p1.x) + arrow.p1.y;
        points.push(new Point(x, y));
    }

    for ( var y = yMin; y < yMax; y += 1) {
        var x = (arrow.p2.x - arrow.p1.x) / (arrow.p2.y - arrow.p1.y)
                * (y - arrow.p1.y) + arrow.p1.x;
        points.push(new Point(x, y));
    }

    points.push(new Point(xMax, yMax));
    points.sort(getDist(arrow.p1));

    return uniqPoints(points);
}

/**
 * Split the input arrow into smaller arrows all lying within the area of
 * validity.
 */
function splitArrow(arrow, curve) {
    var points = unitSplit(arrow);
    var first = points.shift();
    var last = points.pop();

    var relevantPoints = new Array(first);
    for ( var i = 0; i < points.length; i++) {
        if ((points[i].x % curve.p == 0) || (points[i].y % curve.p == 0)) {
            relevantPoints.push(points[i]);
        }
    }
    relevantPoints.push(last);

    var arrows = new Array();
    for ( var i = 0; i < relevantPoints.length - 1; i++) {
        arrows.push(new Arrow(relevantPoints[i], relevantPoints[i + 1]));
    }

    for ( var i = 0; i < arrows.length; i++) {
        arrows[i] = shift(arrows[i], curve.p);
    }

    return arrows;
}

/**
 * Draw a marker representing a point.
 * TODO add set color function
 */
function Marker(canvas, point) {
    this.canvas = canvas;
    this.point = point;

    this.draw = function(callback) {
        var radius = 5;

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

/**
 * Get the vertical twin of a point located on a given curve. The input point
 * must be located on that curve.
 * TODO Consider that there isn't always a twin
 */
function getYTwin(point, curve) {
    var x = point.x;
    for (var y = 0; y < curve.p; y += 1) {
        twin = new Point(x, y);
        if(isElem(twin, curve) && (twin.y != point.y)) {
            return twin;
        }
    }

    return null;
}

/**
 * Animate the ray cast from p1 through p2 on a given curve.
 */
function animateRay(p1, p2, curve, canvas) {
    end = castRay(p1, p2, curve);

    arrows = splitArrow(new Arrow(p1, end), curve);
    twin = getYTwin(arrows[arrows.length-1].p2, curve);
    if(twin != null) {
        arrows.push(new Arrow(arrows[arrows.length-1].p2, twin));
    }
    
    if (arrows.length > 100) {
        alert("Arrow limit exceeded");
    } else {
        var lines = new Array();
        function drawArrow() {
            first = arrows.shift();
            if (first == null) {
                for ( var i = 0; i < lines.length; i++) {
                    lines[i].remove();
                }
                return;
            }
            var c = canvas.path(
                    [ "M", first.p1.x * grid + xoffset,
                            first.p1.y * grid + yoffset ]).attr({
                'stroke' : "#999",
                'stroke-dasharray' : "-",
                'stroke-width': 3
            });
            lines.push(c);

            var eukildLength = Math.sqrt(Math.pow(first.p2.x - first.p1.x, 2)
                    + Math.pow(first.p2.y - first.p1.y, 2));

            c.animate({
                path : [ "M", first.p1.x * grid + xoffset,
                              first.p1.y * grid + yoffset,
                         "L", first.p2.x * grid + xoffset,
                              first.p2.y * grid + yoffset ],
                easing : "linear"
            }, eukildLength / 0.008, drawArrow);
        }
        drawArrow();
    }
}

/**
 * Draw the grid.
 */
function drawGrid(p, canvas) {
    var gridcolor = "#AAAAAA";
    for ( var i = 0; i <= p; i++) {
        canvas.path(
                [ "M", xoffset + i * grid, yoffset, "L", xoffset + i * grid,
                        yoffset + p * grid ]).attr({
            stroke : gridcolor
        });
        canvas.path(
                [ "M", xoffset, yoffset + i * grid, "L",
                        xoffset + p * grid, yoffset + i * grid ]).attr({
            stroke : gridcolor
        });
    }

    for ( var i = 0; i < p; i++) {
        canvas.text(xoffset - 10, yoffset + i * grid, i);
        canvas.text(xoffset + i * grid, yoffset - 10, i);
    }
}