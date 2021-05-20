/**
 * External dependencies
 */
import { By } from 'selenium-webdriver';

/**
 * Internal dependencies
 */
import * as driverHelper from '../../driver-helper';
import AsyncBaseContainer from '../../async-base-container';
import SectionNavComponent from '../components/section-nav-component';

export default class StoreSettingsPage extends AsyncBaseContainer {
	constructor( driver ) {
		super( driver, By.css( '.woocommerce .settingsPayments' ) );
	}

	async selectPaymentsTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.woocommerce .section-nav__panel a[href*=payments]' )
		);
	}

	async paymentsSettingsDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.woocommerce .settingsPayments' )
		);
	}

	async selectShippingTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.woocommerce .section-nav__panel a[href*=shipping]' )
		);
	}

	async shippingSettingsDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.woocommerce .shipping' )
		);
	}

	async selectTaxesTab() {
		const sectionNav = await SectionNavComponent.Expect( this.driver );
		sectionNav.ensureMobileMenuOpen();
		return await driverHelper.clickWhenClickable(
			this.driver,
			By.css( '.woocommerce .section-nav__panel a[href*=taxes]' )
		);
	}

	async taxesSettingsDisplayed() {
		return await driverHelper.isElementEventuallyLocatedAndVisible(
			this.driver,
			By.css( '.woocommerce .settings-taxes' )
		);
	}
}
