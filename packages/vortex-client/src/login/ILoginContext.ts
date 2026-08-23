/**
 * ILoginContext
 *
 * AS3: sources/WIN63-202607011411-782849652/src/login/ILoginContext.as
 *
 * What a login view is allowed to ask of the flow. It extends `IUIContext`, so a view also gets
 * the stage (which `InputField` needs for focus) and the debug text field.
 *
 * `EnvironmentView` and `SsoTokenView` do NOT take this interface in AS3 — they take `LoginFlow`
 * itself, because they call `getProperty()` and `updateEnvironment()`, which are not part of it.
 * The port keeps that split rather than widening the interface.
 */
import type {AvatarData} from '@habbo/communication/login/AvatarData';
import type {IUIContext} from '../onBoardingHcUi/IUIContext';

export interface ILoginContext extends IUIContext
{
    /**
     * AS3: function initLogin(_arg_1:String, _arg_2:String):void
     *
     * `code` is a TS-only third argument — the second factor `vortex-emulator` asks for. It is empty
     * on a first attempt; `LoginView` only has a box for it once the server has answered
     * `pocket.auth.mfa_required`.
     */
    // AS3: .../src/login/ILoginContext.as::initLogin()
    initLogin(email: string, password: string, code?: string): void;

    // TS-only: no AS3 counterpart — the 701 dump has no screen that registers an account, so nothing
    // there ever needed to ask the flow for it. See `RegisterView`'s header.
    initRegister(email: string, password: string): void;

    // TS-only: adds an avatar to the signed-in account. `createAvatar()` IS an AS3 web-api route
    // (`POST /api/user/avatars`); what AS3 has no screen for is asking for one, because habbo.com's
    // website does it. Called from `AvatarView`.
    createAvatar(): void;

    // AS3: function initLoginWithSsoToken(_arg_1:String, _arg_2:String):void
    initLoginWithSsoToken(environmentId: string, token: string): void;

    // AS3: function loginWithAvatar(_arg_1:AvatarData):void
    loginWithAvatar(avatar: AvatarData): void;

    // AS3: function showScreen(_arg_1:int):void
    showScreen(screen: number): void;
}
