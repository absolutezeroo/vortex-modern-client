import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';
import {ClubBuyOfferData} from './ClubBuyOfferData';

/**
 * A Habbo Club/VIP membership *extension* offer (renew-before-expiry flow), extending the base
 * buy-days offer shape with original/discounted price breakdown fields.
 *
 * TS-only name: unrecoverable in all three source trees (obfuscated _SafeCls_3494 in the primary
 * tree, generic class_2375 in the secondary tree, absent from the tertiary tree).
 *
 * @see sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1716/_SafeCls_3494.as
 */
export class ClubExtendOfferData extends ClubBuyOfferData
{
    constructor(
        offerId: number,
        productCode: string,
        priceCredits: number,
        priceInActivityPoints: number,
        activityPointType: number,
        vip: boolean,
        months: number,
        extraDays: number,
        daysLeftAfterPurchase: number,
        year: number,
        month: number,
        day: number,
        isGiftable: boolean,
        private readonly _originalPriceRaw: number,
        private readonly _originalActivityPointPriceRaw: number,
        private readonly _originalActivityPointType: number,
        private readonly _subscriptionDaysLeft: number
    )
    {
        super(offerId, productCode, priceCredits, priceInActivityPoints, activityPointType, vip, months, extraDays, daysLeftAfterPurchase, year, month, day, isGiftable);
    }

    // AS3: sources/win63_2026_crypted_version/src/unknowns/_SafePkg_1716/_SafeCls_3494.as::parse()
    // Field order matches the wire exactly, right after the 13 base ClubBuyOfferData fields (see
    // ClubBuyOfferData.fromWrapper() for that read order).
    static fromWrapper(wrapper: IMessageDataWrapper): ClubExtendOfferData
    {
        const base = ClubBuyOfferData.fromWrapper(wrapper);

        const originalPriceRaw = wrapper.readInt();
        const originalActivityPointPriceRaw = wrapper.readInt();
        const originalActivityPointType = wrapper.readInt();
        const subscriptionDaysLeft = wrapper.readInt();

        return new ClubExtendOfferData(
            base.offerId, base.productCode, base.priceInCredits, base.priceInActivityPoints, base.activityPointType,
            base.vip, base.months, base.extraDays, base.daysLeftAfterPurchase, base.year, base.month, base.day, base.isGiftable,
            originalPriceRaw, originalActivityPointPriceRaw, originalActivityPointType, subscriptionDaysLeft
        );
    }

    get originalPrice(): number
    {
        return this._originalPriceRaw * this.months;
    }

    get originalActivityPointPrice(): number
    {
        return this._originalActivityPointPriceRaw * this.months;
    }

    get originalActivityPointType(): number
    {
        return this._originalActivityPointType;
    }

    get discountCreditAmount(): number
    {
        return this._originalPriceRaw * this.months - this.priceInCredits;
    }

    // AS3 bug, confirmed identical (not decompiler corruption) in both the primary
    // (_SafeCls_3494.as) and secondary (class_2375.as) source trees: this multiplies by `months`
    // twice (once inside originalActivityPointPrice, once again here), unlike the credit-side
    // discountCreditAmount above which only multiplies once. Ported faithfully, not "fixed".
    get discountActivityPointAmount(): number
    {
        return this.originalActivityPointPrice * this.months - this.priceInActivityPoints;
    }

    get subscriptionDaysLeft(): number
    {
        return this._subscriptionDaysLeft;
    }
}
