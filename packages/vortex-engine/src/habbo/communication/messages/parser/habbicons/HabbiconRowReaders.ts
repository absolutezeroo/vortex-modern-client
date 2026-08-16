import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

import {OwnedHabbiconData} from '@habbo/communication/messages/incoming/habbicons/OwnedHabbiconData';
import {HabbiconShopItemData} from '@habbo/communication/messages/incoming/habbicons/HabbiconShopItemData';
import {HabbiconCollectionData} from '@habbo/communication/messages/incoming/habbicons/HabbiconCollectionData';

/**
 * The three habbicon row readers, which AS3 keeps as single-method classes instantiated once per
 * parser. Field order here is the wire contract.
 */

// AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4475.as::parse()
export function readOwnedHabbicon(wrapper: IMessageDataWrapper): OwnedHabbiconData
{
    const data = new OwnedHabbiconData();

    data.habbiconId = wrapper.readInt();
    data.habbiconState = wrapper.readInt();

    return data;
}

// AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4487.as::parse()
export function readHabbiconShopItem(wrapper: IMessageDataWrapper): HabbiconShopItemData
{
    const data = new HabbiconShopItemData();

    data.habbiconId = wrapper.readInt();
    data.name = wrapper.readString();
    data.collectionId = wrapper.readInt();
    data.state = wrapper.readInt();
    data.priceCredits = wrapper.readInt();
    data.priceActivityPoints = wrapper.readInt();
    data.activityPointType = wrapper.readInt();

    return data;
}

// AS3: sources/WIN63-202607011411-782849652/src/unknowns/_SafePkg_4082/_SafeCls_4498.as::parse()
export function readHabbiconCollection(wrapper: IMessageDataWrapper): HabbiconCollectionData
{
    const data = new HabbiconCollectionData();

    data.collectionId = wrapper.readInt();
    data.name = wrapper.readString();
    data.completed = wrapper.readBoolean();
    data.rewardHabbiconId = wrapper.readInt();
    data.rewardState = wrapper.readInt();
    data.priceCredits = wrapper.readInt();
    data.priceActivityPoints = wrapper.readInt();
    data.activityPointType = wrapper.readInt();
    data.habbicons = [];

    const count = wrapper.readInt();

    for(let i = 0; i < count; i++)
    {
        data.habbicons.push(readHabbiconShopItem(wrapper));
    }

    return data;
}
