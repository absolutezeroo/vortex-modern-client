import {Direction360} from './Direction360';
import type {ICollidable} from './ICollidable';
import {Location3D} from './Location3D';
import {MathUtils} from './MathUtils';

/**
 * Every collision test the arena runs, in integer arithmetic.
 *
 * Class name DERIVED — obfuscated in every tree as `_SafeCls_4413`, named from what it does.
 *
 * Four bounding shapes, and the **triple circle** is the interesting one: three circles laid along
 * the object's facing, one pushed forward by `FIRST_OFFSET`, one at the centre, one pushed by
 * `THIRD_OFFSET`. That is how a player gets a capsule-ish shape that turns with them, without any
 * rotation maths — the offsets are applied through `Direction360`'s 256-scaled base vectors, and
 * `LARGEST_DISTANCE` is the precomputed radius of the whole thing, used only as a cheap reject.
 *
 * **`testForObjectToObjectCollision()` is not symmetric.** Its switch is on the *second* object's
 * shape, and several pairs have no case at all: circle-to-box, box-to-box and box-to-triple-circle
 * all fall through to `false`. That is AS3's, transcribed — the arena only ever asks in the order
 * the table covers, and a box is only ever the second argument.
 *
 * The `- 1` on the inner switches is a decompiler artefact of a jump table, not arithmetic in the
 * original: case 0 is a point, case 1 a circle, case 3 a triple circle. Written here as the plain
 * shape constants instead, which is the same thing and readable.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/game/snowwar/utils/_SafeCls_4413.as
 */
export class CollisionUtils
{
    // AS3: _SafeCls_4413.as::BOUNDING_TYPE_NONE
    public static readonly BOUNDING_TYPE_NONE: number = 0;

    // AS3: _SafeCls_4413.as::BOUNDING_TYPE_POINT
    public static readonly BOUNDING_TYPE_POINT: number = 1;

    // AS3: _SafeCls_4413.as::BOUNDING_TYPE_CIRCLE
    public static readonly BOUNDING_TYPE_CIRCLE: number = 2;

    // AS3: _SafeCls_4413.as::BOUNDING_TYPE_BOX
    public static readonly BOUNDING_TYPE_BOX: number = 3;

    // AS3: _SafeCls_4413.as::BOUNDING_TYPE_TRIPLE_CIRCLE
    public static readonly BOUNDING_TYPE_TRIPLE_CIRCLE: number = 4;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_FIRST_RADIUS
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_FIRST_RADIUS: number = 0;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_SECOND_RADIUS
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_SECOND_RADIUS: number = 1;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_THIRD_RADIUS
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_THIRD_RADIUS: number = 2;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_FIRST_OFFSET
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_FIRST_OFFSET: number = 3;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_THIRD_OFFSET
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_THIRD_OFFSET: number = 4;

    // AS3: _SafeCls_4413.as::BOUNDING_DATA_TRIPLE_CIRCLE_LARGEST_DISTANCE
    public static readonly BOUNDING_DATA_TRIPLE_CIRCLE_LARGEST_DISTANCE: number = 5;

    /**
     * The one entry point. Dispatches on `b`'s shape, then on `a`'s — see the class header for why
     * the pairs it does not cover answer false rather than being reordered.
     */
    // AS3: _SafeCls_4413.as::testForObjectToObjectCollision()
    public static testForObjectToObjectCollision(a: ICollidable, b: ICollidable): boolean
    {
        if(b === a) return false;

        switch(b.boundingType)
        {
            case CollisionUtils.BOUNDING_TYPE_CIRCLE:
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_POINT) return CollisionUtils.testPointToCircleCollision(a, b);
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_CIRCLE) return CollisionUtils.testCircleToCircleCollision(a, b);
                // Note the arguments swap: the circle is `b` here but the helper takes it first.
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_TRIPLE_CIRCLE) return CollisionUtils.testCircleToTripleCircleCollision(b, a);
                break;
            case CollisionUtils.BOUNDING_TYPE_BOX:
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_POINT) return CollisionUtils.testPointToBoxCollision(a, b);
                break;
            case CollisionUtils.BOUNDING_TYPE_TRIPLE_CIRCLE:
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_POINT) return CollisionUtils.testPointToTripleCircleCollision(a, b);
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_CIRCLE) return CollisionUtils.testCircleToTripleCircleCollision(a, b);
                if(a.boundingType === CollisionUtils.BOUNDING_TYPE_TRIPLE_CIRCLE) return CollisionUtils.testTripleCircleToTripleCircleCollision(a, b);
                break;
        }

        return false;
    }

    // AS3: _SafeCls_4413.as::testPointToCircleCollision()
    private static testPointToCircleCollision(point: ICollidable, circle: ICollidable): boolean
    {
        return point.location3D.isInDistance(circle.location3D, circle.boundingData[0]);
    }

    /**
     * The box's four numbers are offsets from its own origin, in the order left, top, right,
     * bottom — and the test is **strict on all four sides**, so a point exactly on an edge is out.
     */
    // AS3: _SafeCls_4413.as::testPointToBoxCollision()
    private static testPointToBoxCollision(point: ICollidable, box: ICollidable): boolean
    {
        const data = box.boundingData;

        return point.location3D.x > box.location3D.x + data[0]
            && point.location3D.x < box.location3D.x + data[2]
            && point.location3D.y > box.location3D.y + data[1]
            && point.location3D.y < box.location3D.y + data[3];
    }

    // AS3: _SafeCls_4413.as::testCircleToCircleCollision()
    private static testCircleToCircleCollision(a: ICollidable, b: ICollidable): boolean
    {
        return a.location3D.isInDistance(b.location3D, a.boundingData[0] + b.boundingData[0]);
    }

    /**
     * One of a triple-circle's three centres, offset along its facing.
     *
     * The base vectors are scaled by 256, so the multiply-then-divide is a fixed-point rotation —
     * and `javaDiv()` rather than `Math.floor()` is what keeps a negative offset agreeing with the
     * server.
     */
    // TS-only: AS3 repeats these two lines inline at each of the nine places it needs a centre.
    private static offsetCentreX(shape: ICollidable, offsetIndex: number): number
    {
        return shape.location3D.x + MathUtils.javaDiv(
            Direction360.getBaseVectorXComponent(shape.direction360.intValue()) * shape.boundingData[offsetIndex] / 256
        );
    }

    // TS-only: the y half of offsetCentreX().
    private static offsetCentreY(shape: ICollidable, offsetIndex: number): number
    {
        return shape.location3D.y + MathUtils.javaDiv(
            Direction360.getBaseVectorYComponent(shape.direction360.intValue()) * shape.boundingData[offsetIndex] / 256
        );
    }

    // AS3: _SafeCls_4413.as::testPointToTripleCircleCollision()
    private static testPointToTripleCircleCollision(point: ICollidable, triple: ICollidable): boolean
    {
        const reach = triple.boundingData[5];

        if(CollisionUtils.absoluteValue(triple.location3D.x - point.location3D.x) > reach) return false;
        if(CollisionUtils.absoluteValue(triple.location3D.y - point.location3D.y) > reach) return false;

        const firstX = CollisionUtils.offsetCentreX(triple, 3);
        const firstY = CollisionUtils.offsetCentreY(triple, 3);

        if(Location3D.isInDistanceStatic(firstX, firstY, point.location3D.x, point.location3D.y, triple.boundingData[0])) return true;

        if(Location3D.isInDistanceStatic(
            triple.location3D.x, triple.location3D.y, point.location3D.x, point.location3D.y, triple.boundingData[1]
        )) return true;

        const thirdX = CollisionUtils.offsetCentreX(triple, 4);
        const thirdY = CollisionUtils.offsetCentreY(triple, 4);

        return Location3D.isInDistanceStatic(thirdX, thirdY, point.location3D.x, point.location3D.y, triple.boundingData[2]);
    }

    // AS3: _SafeCls_4413.as::testCircleToTripleCircleCollision()
    private static testCircleToTripleCircleCollision(circle: ICollidable, triple: ICollidable): boolean
    {
        const reach = circle.boundingData[0] + triple.boundingData[5];

        if(CollisionUtils.absoluteValue(triple.location3D.x - circle.location3D.x) > reach) return false;
        if(CollisionUtils.absoluteValue(triple.location3D.y - circle.location3D.y) > reach) return false;

        const firstX = CollisionUtils.offsetCentreX(triple, 3);
        const firstY = CollisionUtils.offsetCentreY(triple, 3);

        if(Location3D.isInDistanceStatic(
            firstX, firstY, circle.location3D.x, circle.location3D.y, triple.boundingData[0] + circle.boundingData[0]
        )) return true;

        if(Location3D.isInDistanceStatic(
            triple.location3D.x, triple.location3D.y, circle.location3D.x, circle.location3D.y,
            triple.boundingData[1] + circle.boundingData[0]
        )) return true;

        const thirdX = CollisionUtils.offsetCentreX(triple, 4);
        const thirdY = CollisionUtils.offsetCentreY(triple, 4);

        return Location3D.isInDistanceStatic(
            thirdX, thirdY, circle.location3D.x, circle.location3D.y, triple.boundingData[2] + circle.boundingData[0]
        );
    }

    /** All nine circle pairs, cheapest reject first. */
    // AS3: _SafeCls_4413.as::testTripleCircleToTripleCircleCollision()
    private static testTripleCircleToTripleCircleCollision(a: ICollidable, b: ICollidable): boolean
    {
        const reach = a.boundingData[5] + b.boundingData[5];

        if(CollisionUtils.absoluteValue(b.location3D.x - a.location3D.x) > reach) return false;
        if(CollisionUtils.absoluteValue(b.location3D.y - a.location3D.y) > reach) return false;

        const aFirstX = CollisionUtils.offsetCentreX(a, 3);
        const aFirstY = CollisionUtils.offsetCentreY(a, 3);
        const bFirstX = CollisionUtils.offsetCentreX(b, 3);
        const bFirstY = CollisionUtils.offsetCentreY(b, 3);

        if(Location3D.isInDistanceStatic(aFirstX, aFirstY, bFirstX, bFirstY, a.boundingData[0] + b.boundingData[0])) return true;
        if(Location3D.isInDistanceStatic(aFirstX, aFirstY, b.location3D.x, b.location3D.y, a.boundingData[0] + b.boundingData[1])) return true;

        const bThirdX = CollisionUtils.offsetCentreX(b, 4);
        const bThirdY = CollisionUtils.offsetCentreY(b, 4);

        if(Location3D.isInDistanceStatic(aFirstX, aFirstY, bThirdX, bThirdY, a.boundingData[0] + b.boundingData[2])) return true;
        if(Location3D.isInDistanceStatic(a.location3D.x, a.location3D.y, bFirstX, bFirstY, a.boundingData[1] + b.boundingData[0])) return true;

        if(Location3D.isInDistanceStatic(
            a.location3D.x, a.location3D.y, b.location3D.x, b.location3D.y, a.boundingData[1] + b.boundingData[1]
        )) return true;

        if(Location3D.isInDistanceStatic(a.location3D.x, a.location3D.y, bThirdX, bThirdY, a.boundingData[1] + b.boundingData[2])) return true;

        const aThirdX = CollisionUtils.offsetCentreX(a, 4);
        const aThirdY = CollisionUtils.offsetCentreY(a, 4);

        if(Location3D.isInDistanceStatic(aThirdX, aThirdY, bFirstX, bFirstY, a.boundingData[2] + b.boundingData[0])) return true;
        if(Location3D.isInDistanceStatic(aThirdX, aThirdY, b.location3D.x, b.location3D.y, a.boundingData[2] + b.boundingData[1])) return true;

        return Location3D.isInDistanceStatic(aThirdX, aThirdY, bThirdX, bThirdY, a.boundingData[2] + b.boundingData[2]);
    }

    // AS3: _SafeCls_4413.as::absoluteValue()
    protected static absoluteValue(value: number): number
    {
        if(value < 0) return -value;

        return value;
    }
}
