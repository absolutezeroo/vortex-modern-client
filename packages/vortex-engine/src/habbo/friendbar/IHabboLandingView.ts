/**
 * Interface for the Habbo Landing View
 *
 * The landing view is the first screen shown when entering the hotel.
 * It displays widgets, promotions, and community goals.
 *
 * @see sources/win63_version/habbo/friendbar/IHabboLandingView.as
 */
export interface IHabboLandingView
{
    /**
	 * Activate the landing view (show it, set toolbar state to hotel view)
	 */
    // AS3: sources/win63_version/habbo/friendbar/IHabboLandingView.as::activate()
    activate(): void;

    /**
	 * Disable the landing view (hide it)
	 */
    // AS3: sources/win63_version/habbo/friendbar/IHabboLandingView.as::disable()
    disable(): void;
}
