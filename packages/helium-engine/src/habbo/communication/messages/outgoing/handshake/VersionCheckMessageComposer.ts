import {MessageComposer} from '@core/communication/messages/MessageComposer';

/**
 * Send client version information
 * Message ID: 2602
 *
 * @see source_as_win63/habbo/communication/messages/outgoing/handshake/VersionCheckMessageComposer.as
 */
export class VersionCheckMessageComposer extends MessageComposer<ConstructorParameters<typeof VersionCheckMessageComposer>>
{
	private _data: ConstructorParameters<typeof VersionCheckMessageComposer>;

	constructor(
		versionId: number = 0,
		clientUrl: string = '',
		externalVariablesUrl: string = ''
	)
	{
		super();

		this._data = [versionId, clientUrl, externalVariablesUrl];
	}

	getMessageArray()
	{
		return this._data;
	}

}
