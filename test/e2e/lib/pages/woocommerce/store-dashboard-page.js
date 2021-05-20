/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

export default class StoreDashboardPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce .dashboard.main' ) );
	}
}
