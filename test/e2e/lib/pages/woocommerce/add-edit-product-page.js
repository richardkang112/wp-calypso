/**
 * External dependencies
 */
import { By, until } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import AsyncBaseContainer from '../../async-base-container';

import * as driverHelper from '../../driver-helper';

export default class AddEditProductPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce .products__product-form-details' ) );
	}

	async enterTitle( productTitle ) {
		return await driverHelper.setWhenSettable( this.driver, By.css( 'input#name' ), productTitle );
	}

	async enterDescription( descriptionText ) {
		await this.driver.wait(
			until.ableToSwitchToFrame( By.css( '.mce-edit-area iframe' ) ),
			this.explicitWaitMS,
			'Could not locate the description editor iFrame.'
		);
		await this.driver.findElement( By.css( '#tinymce' ) ).sendKeys( descriptionText );
		return await this.driver.switchTo().defaultContent();
	}

	async addCategory( categoryName ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__categories-card input.token-field__input' ),
			categoryName
		);
	}

	async setPrice( price ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-form-price input[name="price"]' ),
			price
		);
	}

	async setDimensions( length, width, height ) {
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-dimensions-input input[name="length"]' ),
			length
		);
		await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-dimensions-input input[name="width"]' ),
			width
		);
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-dimensions-input input[name="height"]' ),
			height
		);
	}

	async setWeight( weight ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-weight-input input[name="weight"]' ),
			weight
		);
	}

	async addQuantity( quantity ) {
		return await driverHelper.setWhenSettable(
			this.driver,
			By.css( '.products__product-manage-stock input[name="stock_quantity"]' ),
			quantity
		);
	}

	async allowBackorders() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( 'select[name="backorders"] option[value="yes"]' )
		);
	}

	async saveAndPublish() {
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.action-header__actions button.is-primary' )
		);
	}

	async deleteProduct() {
		const menuLocator = By.css( 'button.split-button__toggle' );
		if ( await driverHelper.isElementLocated( this.driver, menuLocator ) ) {
			// open the menu on mobile screens
			await driverHelper.clickWhenClickable( this.driver, menuLocator );
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.popover__menu-item.is-scary' )
			);
		} else {
			await driverHelper.clickWhenClickable(
				this.driver,
				By.css( '.action-header__actions button.is-scary' )
			);
		}
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.dialog__action-buttons button[data-e2e-button="accept"]' )
		);
	}
}
