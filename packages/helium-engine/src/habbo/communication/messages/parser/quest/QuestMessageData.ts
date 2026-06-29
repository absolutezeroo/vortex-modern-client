import type {IMessageDataWrapper} from '@core/communication/messages/IMessageDataWrapper';

/**
 * Quest message data - holds all fields for a single quest
 *
 * @see source_as_win63/habbo/communication/messages/incoming/quest/class_1715.as
 */
export class QuestMessageData
{
	constructor(wrapper: IMessageDataWrapper)
	{
		this._receiveTime = new Date();

		this._campaignCode = wrapper.readString();
		this._completedQuestsInCampaign = wrapper.readInt();
		this._questCountInCampaign = wrapper.readInt();
		this._activityPointType = wrapper.readInt();
		this._id = wrapper.readInt();
		this._accepted = wrapper.readBoolean();
		this._type = wrapper.readString();
		this._imageVersion = wrapper.readString();
		this._rewardCurrencyAmount = wrapper.readInt();
		this._localizationCode = wrapper.readString();
		this._completedSteps = wrapper.readInt();
		this._totalSteps = wrapper.readInt();
		this._sortOrder = wrapper.readInt();
		this._catalogPageName = wrapper.readString();
		this._chainCode = wrapper.readString();
		this._easy = wrapper.readBoolean();
		this._isSeasonal = wrapper.readBoolean();

		if (this._isSeasonal)
		{
			this._secondsLeft = wrapper.readInt();
		}
	}

	private _campaignCode: string = '';

	get campaignCode(): string
	{
		return this._campaignCode;
	}

	private _completedQuestsInCampaign: number = 0;

	get completedQuestsInCampaign(): number
	{
		return this._completedQuestsInCampaign;
	}

	private _questCountInCampaign: number = 0;

	get questCountInCampaign(): number
	{
		return this._questCountInCampaign;
	}

	private _activityPointType: number = 0;

	get activityPointType(): number
	{
		return this._activityPointType;
	}

	private _id: number = 0;

	get id(): number
	{
		return this._id;
	}

	set id(value: number)
	{
		this._id = value;
	}

	private _accepted: boolean = false;

	get accepted(): boolean
	{
		return this._accepted;
	}

	set accepted(value: boolean)
	{
		this._accepted = value;
	}

	private _type: string = '';

	get type(): string
	{
		return this._type;
	}

	private _imageVersion: string = '';

	get imageVersion(): string
	{
		return this._imageVersion;
	}

	private _rewardCurrencyAmount: number = 0;

	get rewardCurrencyAmount(): number
	{
		return this._rewardCurrencyAmount;
	}

	private _localizationCode: string = '';

	get localizationCode(): string
	{
		return this._localizationCode;
	}

	private _completedSteps: number = 0;

	get completedSteps(): number
	{
		return this._completedSteps;
	}

	private _totalSteps: number = 0;

	get totalSteps(): number
	{
		return this._totalSteps;
	}

	private _sortOrder: number = 0;

	get sortOrder(): number
	{
		return this._sortOrder;
	}

	private _catalogPageName: string = '';

	get catalogPageName(): string
	{
		return this._catalogPageName;
	}

	private _chainCode: string = '';

	get chainCode(): string
	{
		return this._chainCode;
	}

	private _easy: boolean = false;

	get easy(): boolean
	{
		return this._easy;
	}

	private _isSeasonal: boolean = false;

	get isSeasonal(): boolean
	{
		return this._isSeasonal;
	}

	private _secondsLeft: number = 0;

	get secondsLeft(): number
	{
		if (this._secondsLeft <= 0) return 0;

		const now = new Date();
		const elapsed = (now.getTime() - this._receiveTime.getTime()) / 1000;

		return this._secondsLeft - elapsed;
	}

	private _receiveTime: Date;

	get receiveTime(): Date
	{
		return this._receiveTime;
	}

	get isCompleted(): boolean
	{
		return this._completedSteps === this._totalSteps;
	}

	get completedCampaign(): boolean
	{
		return this._id < 1;
	}

	get lastQuestInCampaign(): boolean
	{
		return this._completedQuestsInCampaign >= this._questCountInCampaign;
	}

	get campaignChainCode(): string
	{
		if (this._isSeasonal)
		{
			return this._campaignCode + '.' + this._chainCode;
		}

		return this._campaignCode;
	}

	static getCampaignLocalizationKeyForCode(code: string): string
	{
		return 'quests.' + code;
	}

	getCampaignLocalizationKey(): string
	{
		return QuestMessageData.getCampaignLocalizationKeyForCode(this._campaignCode);
	}

	getQuestLocalizationKey(): string
	{
		return this.getCampaignLocalizationKey() + '.' + this._localizationCode;
	}
}
