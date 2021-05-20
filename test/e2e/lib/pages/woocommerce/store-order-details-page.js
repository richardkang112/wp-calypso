/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../../lib/driver-helper';
import AsyncBaseContainer from '../../async-base-container';

export default class StoreOrderDetailsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce .order__container' ) );
	}

	async clickFirstProduct() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.woocommerce .order-details__item-link' )
		);
	}
}
