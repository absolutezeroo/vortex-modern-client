import {Short} from '@core/communication/util/Short';
import type {
    WiredContractContentsMessageParser
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/contracts/WiredContractContentsMessageParser';
import type {
    TradeRequirementRulesDefinition
} from '@habbo/communication/messages/parser/userdefinedroomevents/wiredtrading/trade/requirements/rules/TradeRequirementRulesDefinition';
import type {PresetManager} from '../../../../wired_setup/uibuilder/PresetManager';
import {AbstractUbuntuWiredUI} from '../../../AbstractUbuntuWiredUI';
import type {WiredContractController} from '../../WiredContractController';
import type {IContract} from '../IContract';

/**
 * Shared base for the three contract editors — payment, trade and reward.
 *
 * It owns the contract id, the save path, and the **first two fields on the wire**: every contract
 * writes its id and its type before its own definition, which is why `addContentsToComposer()` lives
 * here and the subclasses only supply `createNewDefinitionFromUI()`.
 *
 * The type goes out as a {@link Short}, not an int — matching the `readShort()` the reply parser
 * uses for the same field.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/roomevents/wired_trading/contracts/subcontrollers/util/AbstractContract.as
 */
export class AbstractContract extends AbstractUbuntuWiredUI implements IContract
{
    // AS3: AbstractContract.as::_SafeStr_7829 (name derived: the contract id)
    private _contractId: number = -1;

    // AS3: AbstractContract.as::_SafeStr_5744 (name derived: the owning controller)
    private _parentController: WiredContractController | null;

    // AS3: AbstractContract.as::AbstractContract()
    constructor(controller: WiredContractController, presetManager: PresetManager)
    {
        super(controller.roomEvents, presetManager);

        this._parentController = controller;
    }

    // AS3: AbstractContract.as::get isBoundToParentRect()
    protected override get isBoundToParentRect(): boolean
    {
        return true;
    }

    // AS3: AbstractContract.as::get contractId()
    get contractId(): number
    {
        return this._contractId;
    }

    // AS3: AbstractContract.as::set contractId()
    set contractId(value: number)
    {
        this._contractId = value;
    }

    // AS3: AbstractContract.as::get parentController()
    protected get parentController(): WiredContractController | null
    {
        return this._parentController;
    }

    // AS3: AbstractContract.as::onSaveClicked()
    override onSaveClicked(): void
    {
        this._parentController?.saveContract(this);
    }

    /**
	 * Closing a contract editor also remembers where it was and closes the element editor on top of
	 * it — AS3 does both *before* detaching, while `isShowing()` is still true.
	 */
    // AS3: AbstractContract.as::hideFrame()
    protected override hideFrame(): void
    {
        if(this.isShowing())
        {
            const window = this.window;

            if(window) this._parentController?.cacheWindowLocation(window);

            this._parentController?.addEditContractElement?.hide();
        }

        super.hideFrame();
    }

    /**
	 * The save button is disabled rather than hidden for a player without write permission, so the
	 * contract can still be read.
	 */
    // AS3: AbstractContract.as::show()
    show(parser: WiredContractContentsMessageParser): void
    {
        this.contractId = parser.contractId;

        const footer = this.footerPreset;

        if(footer) footer.saveButtonDisabled = this.roomEvents.wiredMenu.hasWritePermission !== true;
    }

    /**
	 * Null in the base — every concrete contract overrides it. AS3 returns null here too rather than
	 * declaring the method abstract, so a subclass that forgets throws at the call site below.
	 */
    // AS3: AbstractContract.as::createNewDefinitionFromUI()
    protected createNewDefinitionFromUI(): TradeRequirementRulesDefinition | null
    {
        return null;
    }

    // AS3: AbstractContract.as::addContentsToComposer()
    addContentsToComposer(contents: unknown[]): void
    {
        contents.push(this.contractId);
        contents.push(new Short(this.contractType()));

        // AS3 dereferences this unguarded; a subclass returning null is a porting error, not a
        // runtime case, so the guard only turns a crash into a dropped field.
        this.createNewDefinitionFromUI()?.addToComposer(contents);
    }

    // AS3: AbstractContract.as::contractType()
    contractType(): number
    {
        return 0;
    }

    // AS3: AbstractContract.as::validate()
    validate(): string | null
    {
        return null;
    }

    // AS3: AbstractContract.as::dispose()
    override dispose(): void
    {
        if(this.disposed)
        {
            return;
        }

        this._parentController = null;

        super.dispose();
    }
}
