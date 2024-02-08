/*global _ */

/**
 * An interpolation class.
 *
 * @constructor
 */
var Interpolator = function () {

    var
    // Private Helpers
        makeBoolArr, // Create boolean array from interger
        inter1n, // Interpolate over a specific dimension
        inter, // general interpolation given a rectilinear bounding shape in nspace

        // Public functions
        findPoint, // Find a close point in a rectilinear data set, only public
        // for testing.
        inter1, // 1d interpolation
        intern; // nd interpolation

    /**
     * Create an array of booleans corrosponding to the bits in an integer.
     *
     * Like below:
     * base 10: 11 => binary: 1011 => output: [true, false, true, true]
     *
     * @param i must be an integer, extract bits as a boolean array.
     * @param len, the length of the array to make.
     * @return {Boolean[]}
     */
    makeBoolArr = function (i, len) {
        /*jslint bitwise: true */
        if (Math.floor(i) !== i) {
            throw "i must be an integer";
        }
        var ret = [],
            l;
        for (l = 0; l < len; l += 1) {
            if (i & 1) {
                ret.unshift(true);
            } else {
                ret.unshift(false);
            }
            i = (i >>> 1);
        }
        return ret;
    };

    /**
     * Given a VERY SPECIFIC bounding n-dimension box-shape-thing will
     * interpolate to find the value at point.
     *
     * This function serves only as an internal helper.
     *
     * The order of the points matters. A heaps lot.
     *
     * Bounds must be ordered in a binary way, with 0 corrosponding to a lower
     * value in that position than point, and 1 corrosponding to a higher position.
     * eg:
     * 000 : [ lower, lower, lower ];
     * 001 : [ lower, lower, higher];
     * 010 : [ lower, higher, lower];
     * 011 : ...
     * 100 : ...
     * ...etc
     *
     * @param bounds {Number[][]} cardinality must be 2^z where z is some integer
     * @param point {Number[]} the point to search for.
     * @param p {Integer} do not provivide this argument, counts depth for recursion.
     */
    inter = function (bounds, point, p) {
        var l = bounds.length, // l points in dataset
            left = bounds.slice(0, l / 2),
            right = bounds.slice(l / 2, l),
            prev,
            next;

        if (p === undefined) {
            p = 0;
        }

        // line segment, interpolate!
        if (l === 2) {
            prev = bounds[0];
            next = bounds[1];
            return inter1n(prev, next, p, point);
        }
        if (l < 2) {
            throw "Problem with recursion in inter";
        }

        // Recurse deeper down the rabbit hole...
        return inter([inter(left, point, p + 1), inter(right, point, p + 1)],
            point,
            p);
    };

    /**
     * Interpolate in a specified dimension between 2 n-dimension points that
     * are colinear.
     *
     * @param prev {Number[]} the previous point
     * @param next {Number[]} the next point
     * @param p {Number} the index of the dimension to interpolate along
     * @param point {Number[]} the location of the point we want to find
     * @returns {Number} The value at p.
     */
    inter1n = function (prev, next, p, point) {
        var delta = next[p] - prev[p],
            n = point.length,
            val,
            newTuple;

        // If points are the same we has our value.
        if (_.isEqual(prev, next)) {
            return prev;
        }
        // If points have the same position but different values we has problems.
        if (delta === 0) {
            throw "Delta is 0";
        }

        // Interpolated value at point.
        val = prev[n] * (next[p] - point[p]) / delta +
            next[n] * (point[p] - prev[p]) / delta;

        // Construct a new tuple to return for interpolation at the next level.
        newTuple = _.clone(prev);
        newTuple[n] = val;
        newTuple[p] = point[p]; // Set our new point is between prev and next in coord p.
        return newTuple;
    };

    /**
     * Find nearest point in rectilinear n-dimension grid in a specific direction.
     *
     * Breaks the grid into quadrants then gets the corner element.
     *
     * O(m*n)
     * Where: m is number of tuples
     *        n is dimension of tuples
     *
     * @param arr {Number[]} m-by-(n+1), points array of points and values at points.
     * @param point {Number[]} 1-by-n, the point to look for
     * @param ndir {Boolean[]} 1-by-n, direction to search for true is positive, false is negative
     * @returns {Number[]} The point that was found.
     */
    this.findPoint = findPoint =function (arr, point, ndir) {
        var n = ndir.length, // Dimension of data.
            quadrant, // Quadrant in arr that contains potential matches.
            coords, // The coordinates of the element we are searching for.
            i, // Loop variables below here.
            j;

        if (point.length !== n) {
            throw "point and ndir do not match dimension";
        }

        // Filter down the relevant quadrant in the array.
        // Does this by iterating through each dimension and filtering out
        // points that are not on the correct side of our index point.
        quadrant = _.clone(arr);
        _.each(ndir, function (Unused, i) {
            quadrant = _.filter(quadrant, function (e) {
                return ndir[i] ? e[i] >= point[i] : e[i] <= point[i];
            });
        });
        if (quadrant.length < 1) {
            throw "point out of bounds";
        }

        // Init the coords array.
        // As we will be minimising or maximising in a linear sweep we want
        // sensible limits.
        coords = [];
        for (i = 0; i < n; i += 1) {
            coords[i] = ndir[i] ? Infinity : -Infinity;
        }

        // Find the extreme points in our quadrant, the rectilinear quality of the
        // inputs ensures that they will be the coordinates of the point we are
        // looking for.
        for (i = 0; i < quadrant.length; i += 1) {
            for (j = 0; j < n; j += 1) {
                coords[j] = ndir[j] ? Math.min(coords[j], quadrant[i][j]) : Math.max(coords[j], quadrant[i][j]);
            }
        }

        // Find the point that we have identified in another linear sweep.
        // The anon function is a custom matcher.
        return _.find(quadrant, function (e) {
            for (i = 0; i < n; i += 1) {
                if (e[i] !== coords[i]) {
                    return false;
                }
            }
            return true;
        });
    };

    /**
     * Linear interpolation in one dimension.
     *
     * O(n) where n is number of elements in arr.
     *
     * See: [lodash docs]{https://lodash.com/docs} for more information on helpers
     * used.
     *
     * @param x {Number[]} m-by-1 array of x(or "input") values.
     * @param y {Number[]} m-by-1 array of output values.
     * @param xval {Number} an x value to generate a y value for.
     * @returns {Number}
     */
    this.inter1 = inter1 = function (x, y, xval) {
        var arr,
            prev, // Immediately higher point
            next, // Immediately lower point
            delta, // difference between prev and next;
            xValMatch; // A matching tuple in x

        // Basic type and validity check.
        // Bad arrays will get through this -- oh well.
        if (typeof xval !== "number" || !Array.isArray(x) || !Array.isArray(y)) {
            throw "Bad inputs";
        }

        // zips x and y to a 2d array.
        arr = _.zip(x, y);

        // Out of bounds check
        if (xval < _.min(x) || xval > _.max(x)) {
            throw "Value out of range";
        }

        // Check if we have a data point that corrosponds to xval
        xValMatch = _.find(arr, function (e) {
            return e[0] === xval;
        });
        if (xValMatch !== undefined) {
            return xValMatch[1];
        }

        next = findPoint(arr, [xval], [true]);
        prev = findPoint(arr, [xval], [false]);

        // prev[0] < xval < next[0] is always true
        delta = next[0] - prev[0];
        if (delta === 0) {
            throw "data points have no distance between them";
        }

        // Possible optimisation point, can simplify to prev + slope * delta(prev,point)
        return prev[1] * (next[0] - xval) / delta +
            next[1] * (xval - prev[0]) / delta;
    };

    /**
     * n-dimension linear interpolation for rectilinear data sets.
     *
     * @param inputs {Number[]} m-by-n array of points
     * @param outputs {Number[]} m-by-1 array of values
     * @param point {Number[]} 1-by-n point
     */
    this.intern = intern = function (inputs, outputs, point) {
        var arr,
            inputMatch,
            n = point.length,
            boundingRect,
            ret,
            i;

        // Create a new tuple that has inputs and outputs
        arr = _.map(_.clone(inputs), function (e, i) {
            return _([])
                .concat(e)
                .push(outputs[i])
                .value();
        });

        // Check if we already have the value
        inputMatch = _.find(arr, function (e) {
            return _.reduce(e, function (result, val, key) {
                if (key === n) {
                    return result;
                }
                return result && (val === point[key]);
            }, true);
        });
        if (inputMatch !== undefined) {
            return inputMatch[n];
        }

        // Find nearest points (lowercase is lower, uppercase higher)
        boundingRect = [];
        for (i = 0; i < Math.pow(2, n); i += 1) {
            boundingRect[i] = findPoint(arr, point, makeBoolArr(i, n));
        }

        ret = inter(boundingRect, point);
        return ret[ret.length - 1];
    };
};

var Terp = new Interpolator();