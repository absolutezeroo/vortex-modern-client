/**
 * Randomizer
 *
 * Based on AS3: com.sulake.habbo.room.object.visualization.room.utils.Randomizer
 *
 * Static seeded PRNG for deterministic random patterns in plane materials.
 */
export class Randomizer
{
    public static readonly DEFAULT_SEED: number = 1;
    public static readonly DEFAULT_MODULUS: number = 16777216;

    private static _instance: Randomizer | null = null;

    private _seed: number = 1;
    private _multiplier: number = 69069;
    private _increment: number = 5;
    private _modulus: number = 16777216;

    static setSeed(seed: number = 1): void
    {
        if(Randomizer._instance === null)
        {
            Randomizer._instance = new Randomizer();
        }
        Randomizer._instance._seed = seed;
    }

    static setModulus(modulus: number = 16777216): void
    {
        if(Randomizer._instance === null)
        {
            Randomizer._instance = new Randomizer();
        }
        if(modulus < 1)
        {
            modulus = 1;
        }
        Randomizer._instance._modulus = modulus;
    }

    static getValues(count: number, min: number, max: number): number[]
    {
        if(Randomizer._instance === null)
        {
            Randomizer._instance = new Randomizer();
        }
        return Randomizer._instance.getRandomValues(count, min, max);
    }

    static getArray(count: number, max: number): number[]
    {
        if(Randomizer._instance === null)
        {
            Randomizer._instance = new Randomizer();
        }
        return Randomizer._instance.getRandomArray(count, max);
    }

    private getRandomValues(count: number, min: number, max: number): number[]
    {
        const result: number[] = [];
        for(let i = 0; i < count; i++)
        {
            result.push(this.iterateScaled(min, max - min));
        }
        return result;
    }

    private getRandomArray(count: number, max: number): number[]
    {
        if(count > max || max > 1000)
        {
            return [];
        }
        const pool: number[] = [];
        for(let i = 0; i <= max; i++)
        {
            pool.push(i);
        }
        const result: number[] = [];
        for(let i = 0; i < count; i++)
        {
            const idx = this.iterateScaled(0, pool.length - 1);
            result.push(pool[idx]);
            pool.splice(idx, 1);
        }
        return result;
    }

    private iterate(): number
    {
        let value = this._multiplier * this._seed + this._increment;
        if(value < 0)
        {
            value = -value;
        }
        value %= this._modulus;
        this._seed = value;
        return value;
    }

    private iterateScaled(min: number, range: number): number
    {
        const value = this.iterate();
        if(range < 1)
        {
            return min;
        }
        return Math.floor(min + (value / this._modulus) * range);
    }
}
