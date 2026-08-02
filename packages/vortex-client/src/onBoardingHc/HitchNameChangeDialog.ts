/**
 * HitchNameChangeDialog
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/friendbar/onBoardingHc/HitchNameChangeDialog.as
 *
 * The name dialog the onboarding flow actually builds — the Hitch (style 2) skin: a bare 330px
 * input with an OK and an alert icon inside its right edge, and a downward-pointing balloon of tips
 * that only shows while the name is not accepted.
 *
 * It replaces `NameChangeDialog.init()` entirely; everything else (the idle check, the claim, the
 * error strip) is inherited.
 */
import {Bitmap} from '../onBoardingHcUi/display/Bitmap';
import {Sprite} from '../onBoardingHcUi/display/DisplayObjectContainer';
import {Rectangle} from '../onBoardingHcUi/display/Geom';
import {LoaderUI} from '../onBoardingHcUi/LoaderUI';
import {LoginAssets} from '../onBoardingHcUi/LoginAssets';
import {NineSplitSprite} from '../onBoardingHcUi/NineSplitSprite';
import {WaitIndicator} from '../onBoardingHcUi/WaitIndicator';
import type {IOnBoardingHcContext} from './IOnBoardingHcContext';
import {NameChangeDialog} from './NameChangeDialog';

export class HitchNameChangeDialog extends NameChangeDialog
{
    // AS3: HitchNameChangeDialog(_arg_1:IOnBoardingHcContext, _arg_2:Sprite, _arg_3:int)
    constructor(context: IOnBoardingHcContext, container: Sprite, dialogWidth: number)
    {
        super(context, container, dialogWidth);
    }

    /**
     * AS3: override init()
     *
     * Called from the base constructor, before this subclass's own field initialisers have run —
     * so it must not depend on anything declared here. It does not: `_style` is assigned first and
     * every other field it touches belongs to the base class.
     */
    protected override init(): void
    {
        if(!this._context) return;

        this._style = 2;
        this._dialog = LoaderUI.createFrame('', '', new Rectangle(-this._dialogWidth / 2, 0, this._dialogWidth, 1), this._style);
        this._container.addChild(this._dialog);

        const inputHolder = new Sprite();

        this._inputBackground = new Bitmap(NineSplitSprite.INPUT_FIELD_HITCH.render(330, 31));
        inputHolder.addChild(this._inputBackground);
        this._dialog.addChild(inputHolder);
        inputHolder.x = 0;

        const firstTip = LoaderUI.createTextField(
            this._context.getLocalization('onboarding.characters.tip', 'TIP: There are tons of Habbos created every day'),
            18,
            8309486,
            false,
            true,
            false,
            false
        );

        firstTip.width = 330 - 32;

        const secondTip = LoaderUI.createTextField(
            this._context.getLocalization('onboarding.creative.tip', 'be creative! You can also use these special characters'),
            18,
            8309486,
            false,
            true,
            false,
            false
        );

        secondTip.width = 330 - 32;
        this._hintBox = new Sprite();

        const balloon = LoaderUI.createBalloon(295, 230, 45, false, 995918, 'down');

        balloon.y = 90;
        this._hintBox.addChild(balloon);
        this._hintBox.addChild(firstTip);
        this._hintBox.addChild(secondTip);
        firstTip.x = 16;
        firstTip.y = balloon.y + (balloon.height - (firstTip.height + secondTip.height)) / 2;
        firstTip.width = 250;
        this._hintBox.visible = false;
        secondTip.x = 16;
        secondTip.y = firstTip.y + firstTip.height + 20;
        secondTip.width = 250;
        this._dialog.addChild(this._hintBox);
        this._hintBox.x = 0;

        this._inputDefaultString = this._context.getLocalization('name', 'Enter name here');
        this._inputField = LoaderUI.createTextField(this._inputDefaultString, 18, 6710886, true, false, true, false);
        this._dialog.addChild(this._inputField);
        this._inputField.x = inputHolder.x + 16;
        this._inputField.y = inputHolder.y + Math.trunc((inputHolder.height - this._inputField.height) / 2);
        this._inputField.width = inputHolder.width - 30;
        this._inputField.addEventListener('click', this._onInputClicked);
        this._inputField.addEventListener('change', this._onInputChange);

        this._okIcon = new Bitmap(LoginAssets.get('icon_name_ok'));
        this._dialog.addChild(this._okIcon);
        this._okIcon.y = inputHolder.y + Math.trunc((inputHolder.height - this._okIcon.height) / 2);
        this._okIcon.x = inputHolder.x + inputHolder.width - this._okIcon.width - 7;
        this._alertIcon = new Bitmap(LoginAssets.get('icon_name_alert'));
        this._dialog.addChild(this._alertIcon);
        this._alertIcon.x = this._okIcon.x;
        this._alertIcon.y = this._okIcon.y;
        this.nameIsCorrect = false;

        this._waitIndicator = new WaitIndicator(this._style);
        this._dialog.addChild(this._waitIndicator);
        this._waitIndicator.y = inputHolder.y + Math.trunc(inputHolder.height / 2) + 2;
        this._waitIndicator.x = inputHolder.x + inputHolder.width - Math.trunc(this._okIcon.width / 2) - 7;
        this._waitIndicator.visible = false;
        inputHolder.addEventListener('click', this._onInputBackgroundClicked);
        this._dialog.y = -50;
    }
}
