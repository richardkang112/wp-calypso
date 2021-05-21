/**
 * Append logmein=1 query parameter to mapped domain urls we want the user to be logged in against.
 */

// Used as placeholder / default domain to detect when we're looking at a relative url
const INVALID_URL = `http://__domain__.invalid`;

export function logmeinUrl( fullUrl: string, allow: string[] ): string {
	let url: URL;

	try {
		url = new URL( String( fullUrl ), INVALID_URL );
	} catch ( e ) {
		// Ignore unparseable urls
		return fullUrl;
	}

	// Ignore and passthrough /relative/urls that have no host specified
	if ( url.origin === INVALID_URL ) {
		return fullUrl;
	}

	// Ignore urls not in the allow list
	if ( allow.indexOf( url.origin ) === -1 ) {
		return fullUrl;
	}

	url.searchParams.set( 'logmein', '1' );

	return url.toString();
}
