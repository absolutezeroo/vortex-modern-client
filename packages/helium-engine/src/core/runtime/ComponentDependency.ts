import type {IID} from './IID';

/**
 * Event listener descriptor for component dependencies
 */
export interface DependencyEventListener
{
	/** Event type to listen for */
	type: string;
	/** Callback function */
	callback: (...args: unknown[]) => void;
}

/**
 * Component Dependency
 *
 * Based on AS3: com.sulake.core.runtime.ComponentDependency
 *
 * Describes a dependency that a Component requires. When the dependency
 * becomes available, the setter function is called with the resolved instance.
 *
 * @example
 * ```typescript
 * protected get dependencies(): ComponentDependency[]
 * {
 *     return [
 *         new ComponentDependency(
 *             IID_CommunicationManager,
 *             (manager) => this._communicationManager = manager,
 *             true // required
 *         ),
 *     ];
 * }
 * ```
 */
export class ComponentDependency<T = unknown>
{
	private readonly _identifier: IID<T>;
	private readonly _setter: ((instance: T | null) => void) | null;
	private readonly _required: boolean;
	private readonly _eventListeners: DependencyEventListener[] | null;

	constructor(
		identifier: IID<T>,
		setter: ((instance: T | null) => void) | null = null,
		required: boolean = true,
		eventListeners: DependencyEventListener[] | null = null
	)
	{
		this._identifier = identifier;
		this._setter = setter;
		this._required = required;
		this._eventListeners = eventListeners;
	}

	/**
	 * The interface identifier for this dependency
	 */
	get identifier(): IID<T>
	{
		return this._identifier;
	}

	/**
	 * Function to call when the dependency is resolved
	 */
	get setter(): ((instance: T | null) => void) | null
	{
		return this._setter;
	}

	/**
	 * Whether this dependency is required for the component to initialize
	 */
	get required(): boolean
	{
		return this._required;
	}

	/**
	 * Event listeners to attach when the dependency is resolved
	 */
	get eventListeners(): DependencyEventListener[] | null
	{
		return this._eventListeners;
	}
}
