/**
 * IHabboEpicPopupView
 *
 * The DI component interface behind `IIDHabboEpicPopupView` — one method, the same one the
 * `EpicPopup` message ends at.
 *
 * The primary tree obfuscates this interface to `_SafeCls_2268` and no tree recovers it.
 * **The name `IHabboEpicPopupView` is derived**, from its sole implementor `HabboEpicPopupView`
 * (unobfuscated) and from the IID it is attached under, `IIDHabboEpicPopupView` (also
 * unobfuscated). It extends `IUnknown` in AS3, i.e. it is the view's DI component interface.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/_SafeCls_2268.as
 */
export interface IHabboEpicPopupView
{
    // AS3: .../friendbar/_SafeCls_2268.as::showPopup()
    showPopup(imageUri: string): void;
}
