/**
 * External dependencies
 */

import WPCOM from 'wpcom';
import inherits from 'inherits';
import debugFactory from 'debug';

/**
 * Internal dependencies
 */
import MePreferences from './me-preferences.js';

const debug = debugFactory( 'calypso:wpcom-undocumented:me' );

/**
 * Internal dependencies.
 */
import config from '@automattic/calypso-config';

/**
 * Create an UndocumentedMe instance
 *
 * @param {WPCOM} wpcom - WPCOMUndocumented instance
 */
function UndocumentedMe( wpcom ) {
	debug( 'UndocumentedMe' );
	if ( ! ( this instanceof UndocumentedMe ) ) {
		return new UndocumentedMe( wpcom );
	}
	this.wpcom = wpcom;
}

/**
 * Inherits from Me class
 */
inherits( UndocumentedMe, WPCOM.Me );

UndocumentedMe.prototype.billingHistoryEmailReceipt = function ( receiptId, callback ) {
	const args = {
		path: '/me/billing-history/receipt/' + receiptId + '/email',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getReceipt = function ( receiptId, queryOrCallback ) {
	return this.wpcom.req.get(
		{
			path: `/me/billing-history/receipt/${ receiptId }`,
		},
		queryOrCallback
	);
};

UndocumentedMe.prototype.purchases = function ( callback ) {
	return this.wpcom.req.get( '/me/purchases', callback );
};

UndocumentedMe.prototype.sendSMSValidationCode = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/sms/new',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.validateTwoStepCode = function ( body, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/validate',
		body: body,
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.getTwoStep = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getAppAuthCodes = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/app-auth-setup/',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.getPeerReferralLink = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/peer-referral-link',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.setPeerReferralLinkEnable = function ( enable, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/peer-referral-link-enable',
		body: {
			enable,
		},
	};

	return this.wpcom.req.post( args, callback );
};

/**
 * Get a list of the user's stored cards
 *
 * @param {object} [cardToken] Payment key
 * @param {object} [additionalData] Any additional data to send in the request
 *
 * @returns {Promise} A promise for the request
 */
UndocumentedMe.prototype.storedCardAdd = function ( cardToken, additionalData = {} ) {
	debug( '/me/stored-cards', cardToken, additionalData );

	return this.wpcom.req.post(
		{
			path: '/me/stored-cards',
		},
		{
			payment_key: cardToken,
			use_for_existing: true,
			...additionalData,
		}
	);
};

UndocumentedMe.prototype.storedCardDelete = function ( card, callback ) {
	const args = {
		path: '/me/stored-cards/' + card.stored_details_id + '/delete',
	};
	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.backupCodes = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/two-step/backup-codes/new',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.sendVerificationEmail = function ( callback ) {
	debug( '/me/send-verification-email' );

	return this.wpcom.req.post( { path: '/me/send-verification-email' }, callback );
};

UndocumentedMe.prototype.getNotificationSettings = function ( callback ) {
	debug( '/me/notification/settings/' );

	return this.wpcom.req.get( { apiVersion: '1.1', path: '/me/notifications/settings/' }, callback );
};

UndocumentedMe.prototype.updateNotificationSettings = function ( settings, applyToAll, callback ) {
	let query = {};
	debug( '/me/notification/settings/' );

	if ( applyToAll ) {
		query = { applyToAll: true };
	}

	return this.wpcom.req.post(
		{
			apiVersion: '1.1',
			path: '/me/notifications/settings/',
		},
		query,
		settings,
		callback
	);
};

UndocumentedMe.prototype.getAccountRecovery = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery',
	};

	return this.wpcom.req.get( args, callback );
};

UndocumentedMe.prototype.updateAccountRecoveryPhone = function ( country, phoneNumber, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone',
		body: {
			country: country,
			phone_number: phoneNumber,
		},
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deleteAccountRecoveryPhone = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone/delete',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.newValidationAccountRecoveryPhone = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone/validation/new',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.validateAccountRecoveryPhone = function ( code, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/phone/validation',
		body: { code },
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.updateAccountRecoveryEmail = function ( email, callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/email',
		body: {
			email: email,
		},
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deleteAccountRecoveryEmail = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/email/delete',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.newValidationAccountRecoveryEmail = function ( callback ) {
	const args = {
		apiVersion: '1.1',
		path: '/me/account-recovery/email/validation/new',
	};

	return this.wpcom.req.post( args, callback );
};

UndocumentedMe.prototype.deletePurchase = function ( purchaseId, fn ) {
	debug( '/me/purchases/{purchaseId}/delete' );

	return this.wpcom.req.post(
		{
			path: `/me/purchases/${ purchaseId }/delete`,
		},
		fn
	);
};

/**
 * Connect the current account with a social service (e.g. Google/Facebook).
 *
 * @param {object} An object containing the keys:
 *	{string} service - Social service associated with token, e.g. google.
 *  {string} access_token - OAuth2 Token returned from service.
 *  {string} id_token - (Optional) OpenID Connect Token returned from service.
 *  {string} user_name - (Optional) The user name associated with this connection, in case it's not part of id_token.
 *  {string} user_email - (Optional) The user name associated with this connection, in case it's not part of id_token.
 *  {string} redirect_to - The URL to redirect to after connecting.
 * @param {Function} fn - The callback for the request.
 *
 * @returns {Promise} A promise for the request
 */
UndocumentedMe.prototype.socialConnect = function (
	{ service, access_token, id_token, user_name, user_email, redirect_to },
	fn
) {
	const body = {
		service,
		access_token,
		id_token,
		user_name,
		user_email,
		redirect_to,

		// This API call is restricted to these OAuth keys
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	};

	const args = {
		path: '/me/social-login/connect',
		body: body,
	};

	/*
	 * Before attempting the social connect, we reload the proxy.
	 * This ensures that the proxy iframe has set the correct API cookie,
	 * particularly after the user has logged in, but Calypso hasn't
	 * been reloaded yet.
	 */
	require( 'wpcom-proxy-request' ).reloadProxy();

	this.wpcom.req.post( { metaAPI: { accessAllUsersBlogs: true } } );

	return this.wpcom.req.post( args, fn );
};

/**
 * Disconnect the current account with a social service (e.g. Google/Facebook).
 *
 * @param {string} service - Social service associated with token, e.g. google.
 * @param {Function} fn - callback
 *
 * @returns {Promise} A promise for the request
 */
UndocumentedMe.prototype.socialDisconnect = function ( service, fn ) {
	const body = {
		service,
		// This API call is restricted to these OAuth keys
		client_id: config( 'wpcom_signup_id' ),
		client_secret: config( 'wpcom_signup_key' ),
	};

	const args = {
		path: '/me/social-login/disconnect',
		body: body,
	};

	return this.wpcom.req.post( args, fn );
};

UndocumentedMe.prototype.preferences = MePreferences;

export default UndocumentedMe;
