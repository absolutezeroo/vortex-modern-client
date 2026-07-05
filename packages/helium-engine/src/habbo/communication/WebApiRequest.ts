/**
 * WebApiRequest
 *
 * @see sources/win63_2021_version/com/sulake/habbo/communication/WebApiRequest.as
 *
 * Extends ApiRequest with a requiresSession flag.
 * Used by HabboWebApiSession to track which requests need authentication.
 */
import {ApiRequest} from './ApiRequest';

export class WebApiRequest extends ApiRequest
{
    private _requiresSession: boolean;

    /**
	 * AS3: WebApiRequest(uri, requestMethod, requiresSession)
	 * Note: AS3 constructor swaps args to super(requestMethod, uri).
	 */
    constructor(uri: string, requestMethod: string, requiresSession: boolean = true)
    {
        super(requestMethod, uri);

        this._requiresSession = requiresSession;
    }

    get requiresSession(): boolean
    {
        return this._requiresSession;
    }
}
