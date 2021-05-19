/**
 * Internal dependencies
 */
import { EMAIL_WARNING_SLUG_GOOGLE_ACCOUNT_TOS } from './email-provider-constants';

export function hasGoogleAccountTOSWarning( emailAccount ) {
	if ( ! emailAccount.warnings?.length ) {
		return false;
	}

	return emailAccount.warnings.some(
		( warning ) => warning.warning_slug === EMAIL_WARNING_SLUG_GOOGLE_ACCOUNT_TOS
	);
}
