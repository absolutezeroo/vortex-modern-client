/**
 * SpiralUtils — converts between a NeighborhoodFloor occupancy grid and the compact spiral-ordered
 * int-param bitmask sent on the wire. Tiles are ranked outward from the centre in a square spiral; each
 * rank is one bit, packed 8 bits/byte (LSB first) and 4 bytes/int (little-endian), matching the AS3
 * ByteArray layout.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/utils/SpiralUtils.as
 */

// AS3 uses anonymous Objects with rank/x/y from walkSpiral().
interface ISpiralPoint
{
    rank: number;
    x: number;
    y: number;
}

export class SpiralUtils
{
    // AS3: SpiralUtils.as::parseSpiralVector()
    static parseSpiralVector(intParams: number[], radius: number): boolean[][]
    {
        const mask = SpiralUtils.intParamsToBoolMask(intParams);
        const dimension = radius * 2 + 1;
        const grid: boolean[][] = [];

        for(let x = 0; x < dimension; x++)
        {
            grid[x] = [];

            for(let y = 0; y < dimension; y++)
            {
                grid[x][y] = false;
            }
        }

        const spiral = SpiralUtils.walkSpiral(radius);

        for(const point of spiral)
        {
            if(point.rank < mask.length && mask[point.rank])
            {
                grid[point.x + radius][point.y + radius] = true;
            }
        }

        return grid;
    }

    // AS3: SpiralUtils.as::createSpiralVector()
    static createSpiralVector(floorPlan: boolean[][], radius: number): number[]
    {
        const dimension = radius * 2 + 1;
        const count = dimension * dimension;
        const mask: boolean[] = [];

        for(let i = 0; i < count; i++)
        {
            mask.push(false);
        }

        const spiral = SpiralUtils.walkSpiral(radius);

        for(const point of spiral)
        {
            if(floorPlan[point.x + radius][point.y + radius])
            {
                mask[point.rank] = true;
            }
        }

        return SpiralUtils.boolMaskToIntParams(mask);
    }

    // AS3: SpiralUtils.as::walkSpiral()
    private static walkSpiral(radius: number): ISpiralPoint[]
    {
        const dimension = radius * 2 + 1;
        const total = dimension * dimension;
        const points: ISpiralPoint[] = [];
        let x = 0;
        let y = 0;
        let rank = 0;
        let direction = [1, 0];

        for(let ring = 1; ring <= dimension; ring++)
        {
            for(let leg = 0; leg < 2; leg++)
            {
                for(let step = 0; step < ring; step++)
                {
                    points.push({rank, x, y});
                    x += direction[0];
                    y += direction[1];
                    rank += 1;

                    if(rank === total)
                    {
                        return points;
                    }
                }

                direction = SpiralUtils.nextDirection(direction);
            }
        }

        return points;
    }

    // AS3: SpiralUtils.as::nextDirection()
    private static nextDirection(direction: number[]): number[]
    {
        if(direction[0] === 0 && direction[1] === -1)
        {
            return [-1, 0];
        }

        if(direction[0] === 1 && direction[1] === 0)
        {
            return [0, -1];
        }

        if(direction[0] === 0 && direction[1] === 1)
        {
            return [1, 0];
        }

        return [0, 1];
    }

    // AS3: SpiralUtils.as::intParamsToBoolMask() — expand LE ints to 8-bit-per-byte bools (LSB first).
    private static intParamsToBoolMask(intParams: number[]): boolean[]
    {
        const bytes: number[] = [];

        for(const value of intParams)
        {
            bytes.push(value & 0xFF, (value >>> 8) & 0xFF, (value >>> 16) & 0xFF, (value >>> 24) & 0xFF);
        }

        const bools: boolean[] = [];

        for(const byte of bytes)
        {
            for(let bit = 0; bit < 8; bit++)
            {
                bools.push((byte & (1 << bit)) > 0);
            }
        }

        return bools;
    }

    // AS3: SpiralUtils.as::boolMaskToIntParams() — pack bools 8/byte (LSB first), 4 bytes/LE int.
    private static boolMaskToIntParams(mask: boolean[]): number[]
    {
        const bytes: number[] = [];
        let index = 0;

        while(index < mask.length)
        {
            for(let b = 0; b < 4; b++)
            {
                let byte = 0;

                for(let bit = 0; bit < 8; bit++)
                {
                    if(index < mask.length && mask[index])
                    {
                        byte |= 1 << bit;
                    }

                    index += 1;
                }

                bytes.push(byte);
            }
        }

        const ints: number[] = [];

        for(let i = 0; i + 4 <= bytes.length; i += 4)
        {
            ints.push(bytes[i] | (bytes[i + 1] << 8) | (bytes[i + 2] << 16) | (bytes[i + 3] << 24));
        }

        return ints;
    }
}
