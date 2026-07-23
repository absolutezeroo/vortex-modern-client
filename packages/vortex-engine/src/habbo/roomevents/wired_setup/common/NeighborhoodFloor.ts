/**
 * NeighborhoodFloor — the occupancy grid model behind the InNeighborhood selector's floor editor. Holds
 * a (2*RADIUS+1) square of booleans, supports a temporary cache for rubber-band rectangle drawing, and
 * a "small mode" that visualises only the inner SMALL_RADIUS square (allowed only when nothing is drawn
 * outside it). Fires a change callback when occupancy changes.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_setup/common/NeighborhoodFloor.as
 */
export class NeighborhoodFloor
{
    // AS3: NeighborhoodFloor.as::RADIUS
    public static readonly RADIUS: number = 10;

    // AS3: NeighborhoodFloor.as::SMALL_RADIUS
    public static readonly SMALL_RADIUS: number = 5;

    // AS3: NeighborhoodFloor.as::_SafeStr_10182 (name derived: the full grid dimension)
    public static readonly DIMENSION: number = NeighborhoodFloor.RADIUS * 2 + 1;

    // AS3: NeighborhoodFloor.as::_floorPlanCache
    private _floorPlanCache: boolean[][];

    // AS3: NeighborhoodFloor.as::_floorPlanCacheBuffer
    private _floorPlanCacheBuffer: boolean[][] | null = null;

    // AS3: NeighborhoodFloor.as::_smallMode
    private _smallMode: boolean = false;

    // AS3: NeighborhoodFloor.as::_SafeStr_8497 (name derived: the occupation-changed callback)
    private _onChanged: (() => void) | null = null;

    // AS3: NeighborhoodFloor.as::NeighborhoodFloor()
    constructor(floorPlanCache: boolean[][], smallMode: boolean, onChanged: (() => void) | null)
    {
        this._floorPlanCache = floorPlanCache;
        this._smallMode = smallMode;
        this._onChanged = onChanged;
    }

    // AS3: NeighborhoodFloor.as::get floorPlanCache()
    get floorPlanCache(): boolean[][]
    {
        return this._floorPlanCache;
    }

    // AS3: NeighborhoodFloor.as::setOccupied()
    setOccupied(x: number, y: number, occupied: boolean): void
    {
        this._floorPlanCache[x][y] = occupied;
    }

    // AS3: NeighborhoodFloor.as::isOccupied()
    isOccupied(x: number, y: number): boolean
    {
        return this._floorPlanCache[x][y];
    }

    // AS3: NeighborhoodFloor.as::occupationHasChanged()
    occupationHasChanged(): void
    {
        if(this._onChanged !== null)
        {
            this._onChanged();
        }
    }

    // AS3: NeighborhoodFloor.as::set smallMode()
    set smallMode(value: boolean)
    {
        this._smallMode = value;
    }

    // AS3: NeighborhoodFloor.as::smallModeAllowed()
    smallModeAllowed(): boolean
    {
        for(let x = -NeighborhoodFloor.RADIUS; x <= NeighborhoodFloor.RADIUS; x++)
        {
            for(let y = -NeighborhoodFloor.RADIUS; y <= NeighborhoodFloor.RADIUS; y++)
            {
                if(x < -NeighborhoodFloor.SMALL_RADIUS || x > NeighborhoodFloor.SMALL_RADIUS || y < -NeighborhoodFloor.SMALL_RADIUS || y > NeighborhoodFloor.SMALL_RADIUS)
                {
                    if(this.isOccupied(x + NeighborhoodFloor.RADIUS, y + NeighborhoodFloor.RADIUS))
                    {
                        return false;
                    }
                }
            }
        }

        return true;
    }

    // AS3: NeighborhoodFloor.as::get visualizingRadius()
    get visualizingRadius(): number
    {
        if(this._smallMode)
        {
            return NeighborhoodFloor.SMALL_RADIUS;
        }

        return NeighborhoodFloor.RADIUS;
    }

    // AS3: NeighborhoodFloor.as::get visualizingDimension()
    get visualizingDimension(): number
    {
        return this.visualizingRadius * 2 + 1;
    }

    // AS3: NeighborhoodFloor.as::initTemporaryCache()
    initTemporaryCache(): void
    {
        this._floorPlanCacheBuffer = this._floorPlanCache;
        this.clearTemporaryCache();
    }

    // AS3: NeighborhoodFloor.as::clearTemporaryCache()
    clearTemporaryCache(): void
    {
        if(this._floorPlanCacheBuffer !== null)
        {
            this._floorPlanCache = [];

            for(let i = 0; i < this._floorPlanCacheBuffer.length; i++)
            {
                this._floorPlanCache.push([...this._floorPlanCacheBuffer[i]]);
            }
        }
    }

    // AS3: NeighborhoodFloor.as::submitTemporaryCache()
    submitTemporaryCache(): void
    {
        this._floorPlanCacheBuffer = null;
    }
}
