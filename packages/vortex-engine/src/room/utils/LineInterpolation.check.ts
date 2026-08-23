/**
 * Runnable check for the Bresenham walk: `npx tsx <this file>`.
 *
 * What matters to the one caller (the wired floor editor) is that the returned cells form an
 * unbroken chain — a gap is a hole in a painted line — and that both endpoints are present, since
 * the caller identifies and skips them by value.
 */
import assert from 'node:assert/strict';
import {LineInterpolation} from './LineInterpolation';

function check(x0: number, y0: number, x1: number, y1: number): void
{
    const points = LineInterpolation.interpolationPoints(x0, y0, x1, y1);
    const label = `(${x0},${y0}) -> (${x1},${y1})`;

    assert.ok(points.length > 0, `${label} returned nothing`);

    const has = (x: number, y: number): boolean => points.some((p) => p.x === x && p.y === y);

    assert.ok(has(x0, y0), `${label} is missing its start`);
    assert.ok(has(x1, y1), `${label} is missing its end`);

    // Consecutive cells never jump more than one step on either axis.
    for(let i = 1; i < points.length; i++)
    {
        const dx = Math.abs(points[i].x - points[i - 1].x);
        const dy = Math.abs(points[i].y - points[i - 1].y);

        assert.ok(dx <= 1 && dy <= 1, `${label} jumps from (${points[i - 1].x},${points[i - 1].y}) to (${points[i].x},${points[i].y})`);
        assert.ok(dx + dy > 0, `${label} repeats a cell`);
    }

    // The chain is long enough to span the longer axis.
    const span = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) + 1;

    assert.equal(points.length, span, `${label} should be ${span} cells, got ${points.length}`);
}

// Shallow, steep, diagonal, and each of them backwards.
for(const [x0, y0, x1, y1] of [
    [0, 0, 10, 3], [10, 3, 0, 0],
    [0, 0, 3, 10], [3, 10, 0, 0],
    [0, 0, 7, 7], [7, 7, 0, 0],
    [-5, -5, 5, 2], [5, 2, -5, -5],
    [4, 4, 4, 9], [4, 9, 4, 4],
    [4, 4, 9, 4], [9, 4, 4, 4],
])
{
    check(x0, y0, x1, y1);
}

// A zero-length line is one cell, not none.
assert.deepEqual(LineInterpolation.interpolationPoints(3, 3, 3, 3), [{x: 3, y: 3}]);

// eslint-disable-next-line no-console -- this file is a standalone check, run by hand
console.log('ok — 13 lines');
