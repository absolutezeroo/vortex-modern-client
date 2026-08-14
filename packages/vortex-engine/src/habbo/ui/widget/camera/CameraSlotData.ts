/**
 * One of the camera's five photo slots: the captured bitmap, when it was taken, and whether the
 * slot has ever been filled.
 *
 * AS3: sources/WIN63-202607011411-782849652/src/com/sulake/habbo/ui/widget/camera/CameraSlotData.as
 */
export class CameraSlotData
{
    // AS3: .../ui/widget/camera/CameraSlotData.as::image
    image: ImageBitmap | HTMLCanvasElement | null = null;

    // AS3: .../ui/widget/camera/CameraSlotData.as::_SafeStr_6343
    private _date: Date | null = null;

    // AS3: .../ui/widget/camera/CameraSlotData.as::isEmpty
    isEmpty: boolean = false;

    // AS3: .../ui/widget/camera/CameraSlotData.as::setDate()
    setDate(date: Date): void
    {
        this._date = date;
    }

    /**
	 * AS3 reads `Date.date` (day of month) and `Date.month` (0-based), hence the `+ 1`. Only the
	 * minutes are zero-padded — the hour is not, and neither is the day. Kept as written.
	 */
    // AS3: .../ui/widget/camera/CameraSlotData.as::get dateString()
    get dateString(): string
    {
        if(this._date === null) return '';

        return this._date.getDate() + '/' + (this._date.getMonth() + 1) + '/' + this._date.getFullYear()
            + ' ' + this._date.getHours() + ':' + this.addLeadingZero(this._date.getMinutes());
    }

    // AS3: .../ui/widget/camera/CameraSlotData.as::addLeadingZero()
    private addLeadingZero(value: number): string
    {
        let result = value.toString();

        if(result.length === 1)
        {
            result = '0' + result;
        }

        return result;
    }

    // AS3: .../ui/widget/camera/CameraSlotData.as::getDateTimestamp()
    getDateTimestamp(): number
    {
        return this._date === null ? 0 : this._date.getTime();
    }
}
