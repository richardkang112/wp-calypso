/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../../lib/driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class StoreOrdersPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce .orders__container' ) );
		this.firstOrderLocator = By.css( '.orders__table .table-row.has-action' );
	}

	async atLeastOneOrderDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			this.firstOrderLocator
		);
	}

	async clickFirstOrder() {
		return await driverHelper.clickWhenClickable( this.driver, this.firstOrderLocator );
	}
}
