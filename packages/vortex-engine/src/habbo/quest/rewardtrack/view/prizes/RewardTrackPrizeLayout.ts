/**
 * RewardTrackPrizeLayout — pure geometry: turns a prize's point threshold into an x, and decides how
 * many pages the track spans.
 *
 * @see sources/WIN63-202607011411-782849652/src/com/sulake/habbo/quest/rewardtrack/view/prizes/RewardTrackPrizeLayout.as
 *
 * No windows here at all, which is what makes the whole thing testable.
 *
 * The scale is chosen so that **the two closest prizes are exactly one tile apart**: `findMinimumGap`
 * looks at the free and premium rows separately (a free and a premium prize may legitimately sit at
 * the same threshold, which would otherwise read as a gap of zero) and takes the smaller. That gap
 * maps to one tile plus one margin, and everything else follows from it.
 *
 * `findMaxDistancePerPoint` then stretches that scale as far as a page will allow, by doubling until
 * it no longer fits and binary-searching back — 32 doublings then 24 halvings, AS3's own bounds.
 * The epsilon exists because a page boundary that lands exactly on a threshold must count as the
 * page below it, not the one above.
 */
import type {RewardTrack} from '../../data/RewardTrack';
import type {RewardTrackPrize} from '../../data/RewardTrackPrize';

export class RewardTrackPrizeLayout
{
    // AS3: RewardTrackPrizeLayout.as::PAGE_BOUNDARY_EPSILON
    private static readonly PAGE_BOUNDARY_EPSILON: number = 0.0001;

    /** AS3's literal `32` — how many times the scale may double while searching. */
    // AS3: RewardTrackPrizeLayout.as::findMaxDistancePerPoint()
    private static readonly GROW_STEPS: number = 32;

    /** AS3's literal `24` — the binary-search refinement steps after the doubling. */
    // AS3: RewardTrackPrizeLayout.as::findMaxDistancePerPoint()
    private static readonly REFINE_STEPS: number = 24;

    // AS3: RewardTrackPrizeLayout.as::_visibleWidth
    private _visibleWidth: number = 0;

    // AS3: RewardTrackPrizeLayout.as::_prizeWidth
    private _prizeWidth: number = 0;

    /** Derived name — `_SafeStr_8361`: the gap between two prize tiles. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_8361
    private _prizeMargin: number = 0;

    /** Derived name — `_SafeStr_8746`: half a tile plus a margin — the first tile's centre inset. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_8746
    private _edgeInset: number = 0;

    /** Derived name — `_SafeStr_8828`: the x that point 0 maps to. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_8828
    private _zeroOffset: number = 0;

    /** Derived name — `_SafeStr_7211`: how many points one page covers. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_7211
    private _pagePointSpan: number = 1;

    // AS3: RewardTrackPrizeLayout.as::_distancePerPoint
    private _distancePerPoint: number = 1;

    /** Derived name — `_SafeStr_8500`. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_8500
    private _pageCount: number = 1;

    /** Derived name — `_SafeStr_9112`: the lowest threshold on the track. */
    // AS3: RewardTrackPrizeLayout.as::_SafeStr_9112
    private _minRequiredPoints: number = 0;

    // AS3: RewardTrackPrizeLayout.as::rebuild()
    public rebuild(track: RewardTrack, visibleWidth: number, prizeWidth: number, prizeMargin: number): void
    {
        this._visibleWidth = visibleWidth;
        this._prizeWidth = prizeWidth;
        this._prizeMargin = prizeMargin;
        this._edgeInset = prizeWidth / 2 + prizeMargin;
        this._minRequiredPoints = RewardTrackPrizeLayout.findMinRequiredPoints(track.prizes);

        let minimumGap = RewardTrackPrizeLayout.findMinimumGap(track.prizes);

        const maxRequiredPoints = RewardTrackPrizeLayout.findMaxRequiredPoints(track.prizes);

        // A track whose prizes all sit at one threshold has no gap to scale from; AS3 falls back to
        // the whole span so the single column still lands somewhere sane.
        if(minimumGap <= 0)
        {
            minimumGap = Math.max(1, maxRequiredPoints);
        }

        this._distancePerPoint = (prizeWidth + prizeMargin) / minimumGap;

        if(this._distancePerPoint <= 0)
        {
            this._distancePerPoint = 1;
        }

        this._pagePointSpan = this.calculatePagePointSpan(this._distancePerPoint, minimumGap);
        this._distancePerPoint = this.findMaxDistancePerPoint(this._distancePerPoint, this._pagePointSpan);
        this._zeroOffset = this.zeroOffsetFor(this._distancePerPoint);
        this._pageCount = this.calculatePageCount(track.prizes);
    }

    // AS3: RewardTrackPrizeLayout.as::xForPoints()
    public xForPoints(points: number, page: number): number
    {
        const pageStart = Math.max(0, page * this._pagePointSpan);

        return this._zeroOffset + (points - pageStart) * this._distancePerPoint;
    }

    // AS3: RewardTrackPrizeLayout.as::pageForPoints()
    public pageForPoints(points: number): number
    {
        const page = RewardTrackPrizeLayout.pageForPointSpan(points, this._pagePointSpan);

        return Math.max(0, Math.min(this._pageCount - 1, page));
    }

    // AS3: RewardTrackPrizeLayout.as::calculatePageCount()
    private calculatePageCount(prizes: RewardTrackPrize[]): number
    {
        let highest = 0;

        for(const prize of prizes)
        {
            highest = Math.max(
                highest, RewardTrackPrizeLayout.pageForPointSpan(prize.requiredPoints, this._pagePointSpan)
            );
        }

        return Math.max(1, highest + 1);
    }

    // AS3: RewardTrackPrizeLayout.as::pageForPointSpan()
    private static pageForPointSpan(points: number, pagePointSpan: number): number
    {
        if(points <= 0)
        {
            return 0;
        }

        return Math.max(
            0,
            Math.trunc(Math.ceil((points - RewardTrackPrizeLayout.PAGE_BOUNDARY_EPSILON) / pagePointSpan)) - 1
        );
    }

    // AS3: RewardTrackPrizeLayout.as::zeroOffsetFor()
    private zeroOffsetFor(distancePerPoint: number): number
    {
        return Math.max(0, this._edgeInset - this._minRequiredPoints * distancePerPoint);
    }

    // AS3: RewardTrackPrizeLayout.as::usableWidthFor()
    private usableWidthFor(distancePerPoint: number): number
    {
        return Math.max(1, this._visibleWidth - this._edgeInset - this.zeroOffsetFor(distancePerPoint));
    }

    /** The span is rounded down to a whole number of minimum gaps, so a page never splits one. */
    // AS3: RewardTrackPrizeLayout.as::calculatePagePointSpan()
    private calculatePagePointSpan(distancePerPoint: number, minimumGap: number): number
    {
        const gapsPerPage = Math.max(
            1, Math.trunc(Math.floor(this.usableWidthFor(distancePerPoint) / distancePerPoint / minimumGap))
        );

        return Math.max(1, gapsPerPage * minimumGap);
    }

    // AS3: RewardTrackPrizeLayout.as::findMaxDistancePerPoint()
    private findMaxDistancePerPoint(distancePerPoint: number, pagePointSpan: number): number
    {
        let fits = distancePerPoint;
        let probe = distancePerPoint;

        for(let step = 0; step < RewardTrackPrizeLayout.GROW_STEPS; step++)
        {
            probe *= 2;

            if(!this.pagePointSpanFits(probe, pagePointSpan))
            {
                break;
            }

            fits = probe;
        }

        for(let step = 0; step < RewardTrackPrizeLayout.REFINE_STEPS; step++)
        {
            const middle = (fits + probe) / 2;

            if(this.pagePointSpanFits(middle, pagePointSpan))
            {
                fits = middle;
            }
            else
            {
                probe = middle;
            }
        }

        return fits;
    }

    // AS3: RewardTrackPrizeLayout.as::pagePointSpanFits()
    private pagePointSpanFits(distancePerPoint: number, pagePointSpan: number): boolean
    {
        return pagePointSpan * distancePerPoint
            <= this.usableWidthFor(distancePerPoint) + RewardTrackPrizeLayout.PAGE_BOUNDARY_EPSILON;
    }

    /**
     * Free and premium prizes are measured separately: the two rows are laid out independently, so a
     * free prize and a premium one at the same threshold are not a zero gap.
     */
    // AS3: RewardTrackPrizeLayout.as::findMinimumGap()
    private static findMinimumGap(prizes: RewardTrackPrize[]): number
    {
        const free = RewardTrackPrizeLayout.findMinimumGapForPremium(prizes, false);
        const premium = RewardTrackPrizeLayout.findMinimumGapForPremium(prizes, true);

        if(free <= 0)
        {
            return premium;
        }

        if(premium <= 0)
        {
            return free;
        }

        return Math.min(free, premium);
    }

    /** Assumes the prizes arrive in threshold order, as the wire sends them. */
    // AS3: RewardTrackPrizeLayout.as::findMinimumGapForPremium()
    private static findMinimumGapForPremium(prizes: RewardTrackPrize[], premium: boolean): number
    {
        let previousPoints = -1;
        let smallest = 0;

        for(const prize of prizes)
        {
            if(prize.premium !== premium) continue;

            if(previousPoints !== -1)
            {
                const gap = prize.requiredPoints - previousPoints;

                if(gap > 0 && (smallest === 0 || gap < smallest))
                {
                    smallest = gap;
                }
            }

            previousPoints = prize.requiredPoints;
        }

        return smallest;
    }

    // AS3: RewardTrackPrizeLayout.as::findMinRequiredPoints()
    private static findMinRequiredPoints(prizes: RewardTrackPrize[]): number
    {
        let lowest = -1;

        for(const prize of prizes)
        {
            if(lowest === -1 || prize.requiredPoints < lowest)
            {
                lowest = prize.requiredPoints;
            }
        }

        return Math.max(0, lowest);
    }

    // AS3: RewardTrackPrizeLayout.as::findMaxRequiredPoints()
    private static findMaxRequiredPoints(prizes: RewardTrackPrize[]): number
    {
        let highest = 0;

        for(const prize of prizes)
        {
            highest = Math.max(highest, prize.requiredPoints);
        }

        return highest;
    }

    // AS3: RewardTrackPrizeLayout.as::get pageCount()
    get pageCount(): number
    {
        return this._pageCount;
    }

    // AS3: RewardTrackPrizeLayout.as::get distancePerPoint()
    get distancePerPoint(): number
    {
        return this._distancePerPoint;
    }
}
