/**
 * External dependencies
 */
import { isEqual } from 'lodash';
import store from 'store';
import debugFactory from 'debug';
import config from '@automattic/calypso-config';

/**
 * Internal dependencies
 */
import {
	isSupportUserSession,
	isSupportNextSession,
	supportUserBoot,
	supportNextBoot,
} from 'calypso/lib/user/support-user-interop';
import wpcom from 'calypso/lib/wp';
import Emitter from 'calypso/lib/mixins/emitter';
import { clearStore } from './store';
import { getComputedAttributes, filterUserObject } from './shared-utils';

const debug = debugFactory( 'calypso:user' );

/**
 * User component
 *
 * @class
 */
function User() {
	if ( ! ( this instanceof User ) ) {
		return new User();
	}
}

/**
 * Constants
 */
const VERIFICATION_POLL_INTERVAL = 15000;

/**
 * Mixins
 */
Emitter( User.prototype );

/**
 * Initialize the user data depending on the configuration
 **/
User.prototype.initialize = async function () {
	debug( 'Initializing User' );
	this.fetching = false;
	this.data = false;

	this.on( 'change', this.checkVerification.bind( this ) );

	let skipBootstrap = false;

	if ( isSupportUserSession() ) {
		// boot the support session and skip the user bootstrap: the server sent the unwanted
		// user info there (me) instead of the target SU user.
		supportUserBoot();
		skipBootstrap = true;
	}

	if ( isSupportNextSession() ) {
		// boot the support session and proceed with user bootstrap (unlike the SupportUserSession,
		// the initial GET request includes the right cookies and header and returns a server-generated
		// page with the right window.currentUser value)
		supportNextBoot();
	}

	if ( ! skipBootstrap && config.isEnabled( 'wpcom-user-bootstrap' ) ) {
		debug( 'Bootstrapping user data:', this.data );
		if ( window.currentUser ) {
			this.handleFetchSuccess( window.currentUser );
		}
		return;
	}

	// fetch the user from the /me endpoint if it wasn't bootstrapped
	await this.fetch();
};

/**
 * Clear localStorage when we detect that there is a mismatch between the ID
 * of the user stored in localStorage and the current user ID
 *
 * @param {number} userId The new user ID.
 **/
User.prototype.clearStoreIfChanged = function ( userId ) {
	const storedUserId = store.get( 'wpcom_user_id' );

	if ( storedUserId != null && storedUserId !== userId ) {
		debug( 'Clearing localStorage because user changed' );
		store.clearAll();
	}
};

/**
 * Get user data
 *
 * @returns {object} The user data.
 */
User.prototype.get = function () {
	return this.data;
};

/**
 * Fetch the current user from WordPress.com via the REST API
 * and stores it in local cache.
 *
 * @returns {Promise<void>} Promise that resolves (with no value) when fetching is finished
 */
User.prototype.fetch = function () {
	if ( this.fetching ) {
		// if already fetching, return the in-flight promise
		return this.fetching;
	}

	// Request current user info
	debug( 'Getting user from api' );
	this.fetching = wpcom
		.me()
		.get( {
			meta: 'flags',
		} )
		.then( ( data ) => {
			debug( 'User successfully retrieved from api:', data );
			const userData = filterUserObject( data );
			this.handleFetchSuccess( userData );
		} )
		.catch( ( error ) => {
			debug( 'Failed to retrieve user from api:', error );
			this.handleFetchFailure( error );
		} )
		.finally( () => {
			this.fetching = false;
		} );

	return this.fetching;
};

/**
 * Handles user fetch failure from WordPress.com REST API by updating User's state
 * and emitting a change event.
 *
 * @param {Error} error network response error
 */
User.prototype.handleFetchFailure = function ( error ) {
	if ( error.error === 'authorization_required' ) {
		debug( 'The user is not logged in.' );
		this.data = false;
		this.emit( 'change' );
	} else {
		// eslint-disable-next-line no-console
		console.error( 'Failed to fetch the user from /me endpoint:', error );
	}
};

/**
 * Handles user fetch success from WordPress.com REST API by persisting the user data
 * in the browser's localStorage. It also changes the User's fetching and initialized states
 * and emits a change event.
 *
 * @param {object} userData an object containing the user's information.
 */
User.prototype.handleFetchSuccess = function ( userData ) {
	this.clearStoreIfChanged( userData.ID );

	// Store user ID in local storage so that we can detect a change and clear the storage
	store.set( 'wpcom_user_id', userData.ID );

	this.data = userData;

	this.emit( 'change' );
};

/**
 * Clear any user data.
 */
User.prototype.clear = async function () {
	/**
	 * Clear internal user data and empty localStorage cache
	 * to discard any user reference that the application may hold
	 */
	this.data = false;
	await clearStore();
};

User.prototype.set = function ( attributes ) {
	let changed = false;

	for ( const [ attrName, attrValue ] of Object.entries( attributes ) ) {
		if ( ! isEqual( attrValue, this.data[ attrName ] ) ) {
			this.data[ attrName ] = attrValue;
			changed = true;
		}
	}

	if ( changed ) {
		Object.assign( this.data, getComputedAttributes( this.data ) );
		this.emit( 'change' );
	}

	return changed;
};

/**
 * Called every VERIFICATION_POLL_INTERVAL milliseconds
 * if the email is not verified.
 *
 * May also be called by a localStorage event, on which case
 * the `signal` parameter is set to true.
 *
 * @private
 */

User.prototype.verificationPollerCallback = function ( signal ) {
	// skip server poll if page is hidden or there are no listeners
	// and this was not triggered by a localStorage signal
	if ( ( document.hidden || this.listeners( 'verify' ).length === 0 ) && ! signal ) {
		return;
	}

	debug( 'Verification: POLL' );

	this.once( 'change', () => {
		if ( this.get().email_verified ) {
			// email is verified, stop polling
			clearInterval( this.verificationPoller );
			this.verificationPoller = null;
			debug( 'Verification: VERIFIED' );
			this.emit( 'verify' );
		}
	} );

	this.fetch();
};

/**
 * Checks if the user email is verified, and starts polling
 * for verification if that's not the case.
 *
 * Also registers a listener to localStorage events.
 *
 * @private
 */

User.prototype.checkVerification = function () {
	if ( ! this.get() ) {
		// not loaded, do nothing
		return;
	}

	if ( this.get().email_verified ) {
		// email already verified, do nothing
		return;
	}

	if ( this.verificationPoller ) {
		// already polling, do nothing
		return;
	}

	this.verificationPoller = setInterval(
		this.verificationPollerCallback.bind( this ),
		VERIFICATION_POLL_INTERVAL
	);

	// wait for localStorage event (from other windows)
	window.addEventListener( 'storage', ( e ) => {
		if ( e.key === '__email_verified_signal__' && e.newValue ) {
			debug( 'Verification: RECEIVED SIGNAL' );
			window.localStorage.removeItem( '__email_verified_signal__' );
			this.verificationPollerCallback( true );
		}
	} );
};

/**
 * Writes to local storage, signalling all other windows
 * that the user has been verified.
 *
 * This should be called from the verification successful
 * message, so that all the windows update instantaneously
 */

User.prototype.signalVerification = function () {
	if ( window.localStorage ) {
		// use localStorage to signal to other browser windows that the user's email was verified
		window.localStorage.setItem( '__email_verified_signal__', 1 );
		debug( 'Verification: SENT SIGNAL' );
	}
};

/**
 * Expose `User`
 */
export default User;
