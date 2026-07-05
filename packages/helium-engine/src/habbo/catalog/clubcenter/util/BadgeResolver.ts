/**
 * Resolves which Habbo Club badge to display for a user's badge list.
 *
 * @see sources/win63_version/habbo/catalog/clubcenter/util/BadgeResolver.as
 */
export class BadgeResolver
{
    static readonly DEFAULT_BADGE: string = 'HC1';

    static readonly CLUB_BADGES: string[] = [
        'ACH_VipHC1', 'ACH_VipHC2', 'ACH_VipHC3', 'ACH_VipHC4', 'ACH_VipHC5',
        'HC1', 'HC2', 'HC3', 'HC4', 'HC5',
    ];

    /**
	 * Scans the full CLUB_BADGES list against the owned badge ids, keeping the
	 * last match found (later entries in CLUB_BADGES take priority) — matches
	 * AS3's `for each` loop, which does not break early on the first match.
	 */
    static resolveClubBadgeId(ownedBadgeIds: string[]): string | null
    {
        let result: string | null = null;

        for(const badgeId of BadgeResolver.CLUB_BADGES)
        {
            if(ownedBadgeIds.indexOf(badgeId) > -1)
            {
                result = badgeId;
            }
        }

        return result;
    }

    // AS3: resolveBadgeBitmap() — not ported. That method manually manages
    // SessionDataManager.requestBadgeImage()/BIRE_BADGE_IMAGE_READY retries to
    // get a BitmapData for a raw Bitmap window component. This port instead
    // displays the badge via the existing BadgeImageWidget (widget_type:
    // badge_image), which already resolves its own image from a badgeId
    // string — see ClubCenterView.ts.
}
