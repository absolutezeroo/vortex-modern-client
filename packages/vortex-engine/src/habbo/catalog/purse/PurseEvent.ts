/**
 * Catalog purse balance event.
 *
 * @see sources/win63_version/habbo/catalog/purse/PurseEvent.as
 */
export class PurseEvent 
{
    // AS3: sources/win63_version/habbo/catalog/purse/PurseEvent.as::CREDIT_BALANCE
    public static readonly CREDIT_BALANCE: string = 'catalog_purse_credit_balance';
    // AS3: sources/win63_version/habbo/catalog/purse/PurseEvent.as::ACTIVITY_POINT_BALANCE
    public static readonly ACTIVITY_POINT_BALANCE: string = 'catalog_purse_activity_point_balance';
    public static readonly EMERALD_BALANCE: string = 'catalog_purse_emerald_balance';
    // AS3: sources/win63_version/habbo/catalog/purse/PurseEvent.as::SILVER_BALANCE
    public static readonly SILVER_BALANCE: string = 'catalog_purse_silver_balance';

    constructor(type: string, balance: number, activityPointType: number) 
    {
        this._type = type;
        this._balance = balance;
        this._activityPointType = activityPointType;
    }

    private _type: string;

    get type(): string 
    {
        return this._type;
    }

    private _balance: number;

    // AS3: sources/win63_version/habbo/catalog/purse/PurseEvent.as::get balance()
    get balance(): number 
    {
        return this._balance;
    }

    private _activityPointType: number;
    
    // AS3: sources/win63_version/habbo/catalog/purse/PurseEvent.as::get activityPointType()
    get activityPointType(): number 
    {
        return this._activityPointType;
    }
}
