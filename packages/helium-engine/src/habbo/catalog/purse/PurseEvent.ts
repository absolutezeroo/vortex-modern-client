/**
 * Catalog purse balance event.
 *
 * @see sources/win63_version/habbo/catalog/purse/PurseEvent.as
 */
export class PurseEvent 
{
    public static readonly CREDIT_BALANCE: string = 'catalog_purse_credit_balance';
    public static readonly ACTIVITY_POINT_BALANCE: string = 'catalog_purse_activity_point_balance';
    public static readonly EMERALD_BALANCE: string = 'catalog_purse_emerald_balance';
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

    get balance(): number 
    {
        return this._balance;
    }

    private _activityPointType: number;
    
    get activityPointType(): number 
    {
        return this._activityPointType;
    }
}
