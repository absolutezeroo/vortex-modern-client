/**
 * Effect data model
 *
 * Based on AS3 com.sulake.habbo.inventory.effects.Effect (ENGINE only)
 */
export class Effect
{
    private _activationTimestamp: number = 0;

    // AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/inventory/effects/Effect.as::icon
    // AS3 holds a Flash BitmapData; the port uses an ImageBitmap (the asset
    // library's decoded content for `fx_icon_<type>`). Consumed by EffectView.
    private _icon: ImageBitmap | null = null;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get icon()
    get icon(): ImageBitmap | null
    {
        return this._icon;
    }

    set icon(value: ImageBitmap | null)
    {
        this._icon = value;
    }

    /**
     * AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get iconImage()
     *
     * A second name for `icon` — AS3 returns the same `_SafeStr_5528` from both, and its setter
     * writes the same field. Declared by `IAvatarEffect`, which the avatar editor's effects page
     * consumes; nothing in the inventory reads it under this name.
     */
    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get iconImage()
    get iconImage(): ImageBitmap | null
    {
        return this._icon;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set iconImage()
    set iconImage(value: ImageBitmap | null)
    {
        this._icon = value;
    }

    private _type: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get type()
    get type(): number
    {
        return this._type;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set type()
    set type(value: number)
    {
        this._type = value;
    }

    private _subType: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get subType()
    get subType(): number
    {
        return this._subType;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set subType()
    set subType(value: number)
    {
        this._subType = value;
    }

    private _duration: number = 0;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get duration()
    get duration(): number
    {
        return this._duration;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set duration()
    set duration(value: number)
    {
        this._duration = value;
    }

    private _secondsLeft: number = 0;

    /**
	 * Get seconds remaining
	 * Calculates based on activation time if active
	 */
    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get secondsLeft()
    get secondsLeft(): number
    {
        if(this._isActive)
        {
            const elapsed = (Date.now() - this._activationTimestamp) / 1000;
            const remaining = this._secondsLeft - elapsed;

            return Math.max(0, Math.floor(remaining));
        }

        return this._secondsLeft;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set secondsLeft()
    set secondsLeft(value: number)
    {
        this._secondsLeft = value;
    }

    private _amountInInventory: number = 1;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get amountInInventory()
    get amountInInventory(): number
    {
        return this._amountInInventory;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set amountInInventory()
    set amountInInventory(value: number)
    {
        this._amountInInventory = value;
    }

    private _isPermanent: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get isPermanent()
    get isPermanent(): boolean
    {
        return this._isPermanent;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set isPermanent()
    set isPermanent(value: boolean)
    {
        this._isPermanent = value;
    }

    private _isActive: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get isActive()
    get isActive(): boolean
    {
        return this._isActive;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set isActive()
    set isActive(value: boolean)
    {
        if(value && !this._isActive)
        {
            this._activationTimestamp = Date.now();
        }

        this._isActive = value;
    }

    private _isInUse: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get isInUse()
    get isInUse(): boolean
    {
        return this._isInUse;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set isInUse()
    set isInUse(value: boolean)
    {
        this._isInUse = value;
    }

    private _isSelected: boolean = false;

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::get isSelected()
    get isSelected(): boolean
    {
        return this._isSelected;
    }

    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::set isSelected()
    set isSelected(value: boolean)
    {
        this._isSelected = value;
    }

    /**
	 * Called when one effect instance expires
	 */
    // AS3: .../src/com/sulake/habbo/inventory/effects/Effect.as::setOneEffectExpired()
    setOneEffectExpired(): void
    {
        this._amountInInventory--;

        if(this._amountInInventory < 0)
        {
            this._amountInInventory = 0;
        }

        // Reset to full duration
        this._secondsLeft = this._duration;
        this._isActive = false;
        this._isInUse = false;
    }

    dispose(): void
    {
        // Nothing to clean up
    }
}
