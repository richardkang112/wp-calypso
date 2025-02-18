/**
 * External dependencies
 */
import React, { useEffect, useState } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { ProgressBar } from '@automattic/components';
import styled from '@emotion/styled';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';
import { useTranslate } from 'i18n-calypso';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getSelectedSiteId, getSelectedSiteSlug } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getPurchaseFlowState } from 'calypso/state/plugins/marketplace/selectors';
import { fetchAutomatedTransferStatus } from 'calypso/state/automated-transfer/actions';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status/style.scss';

const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0px;
`;

/**
 * This component simulates progress for the purchase flow. It also does any async tasks required in the purchase flow. This includes installing any plugins required.
 * TODO: Refactor component so that it can easily handle multiple speeds of simulated progress
 */

function WrappedMarketplacePluginSetup(): JSX.Element {
	const translate = useTranslate();

	const STEP_1 = translate( 'Installing plugin' );
	const STEP_2 = translate( 'Activating plugin' );
	const steps = [ STEP_1, STEP_2 ];

	const [ currentStep, setCurrentStep ] = useState( STEP_1 );
	const [ simulatedProgressPercentage, setSimulatedProgressPercentage ] = useState( 1 );

	const dispatch = useDispatch();
	const selectedSiteId = useSelector( getSelectedSiteId );
	const selectedSiteSlug = useSelector( getSelectedSiteSlug );
	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSiteId )
	);
	const { pluginSlugToBeInstalled, isPluginInstalledDuringPurchase } = useSelector(
		getPurchaseFlowState
	);

	useEffect( () => {
		dispatch( fetchAutomatedTransferStatus( selectedSiteId ?? 0 ) );
	}, [ fetchAutomatedTransferStatus ] );

	useEffect( () => {
		if ( pluginSlugToBeInstalled && selectedSiteId ) {
			dispatch( initiateThemeTransfer( selectedSiteId, null, pluginSlugToBeInstalled ) );
		} else if ( ! isPluginInstalledDuringPurchase ) {
			// Invalid State redirect to Yoast marketplace page for now, and maybe a marketplace home view in the future
			page(
				`/marketplace/product/details/wordpress-seo/${ selectedSiteSlug }?flags=marketplace-yoast`
			);
		}
	}, [ dispatch, pluginSlugToBeInstalled, isPluginInstalledDuringPurchase, selectedSiteId ] );

	const TIMEOUT_BEFORE_REDIRECTING_ON_TRANSFER_COMPLETE = 4000;
	const SIMULATION_REFRESH_INTERVAL = 2000;
	const INCREMENTED_PERCENTAGE_SIZE_ON_STEP = 6;
	const MAX_PERCENTAGE_SIMULATED = 100 - INCREMENTED_PERCENTAGE_SIZE_ON_STEP * 2;
	useEffect( () => {
		setTimeout(
			() => {
				if ( simulatedProgressPercentage < MAX_PERCENTAGE_SIMULATED ) {
					setSimulatedProgressPercentage(
						( previousPercentage ) => previousPercentage + INCREMENTED_PERCENTAGE_SIZE_ON_STEP
					);
				}
			},

			SIMULATION_REFRESH_INTERVAL
		);
	}, [ simulatedProgressPercentage ] );

	useEffect( () => {
		if ( transferStatus === 'complete' ) {
			// TODO: Make sure the primary domain is set to the relevant domain before redirecting to thank-you page
			setSimulatedProgressPercentage( 100 );
			setTimeout( () => {
				page( `/marketplace/thank-you/${ selectedSiteId }?flags=marketplace-yoast` );
			}, TIMEOUT_BEFORE_REDIRECTING_ON_TRANSFER_COMPLETE );
		}
	}, [ selectedSiteSlug, transferStatus ] );

	if ( simulatedProgressPercentage > 50 && currentStep === STEP_1 ) {
		setCurrentStep( STEP_2 );
	}

	const currentNumericStep = steps.indexOf( currentStep ) + 1;

	/* translators: %(currentStep)s  Is the current step number, given that steps are set of counting numbers representing each step starting from 1, %(stepCount)s  Is the total number of steps, Eg: Step 1 of 3  */
	const stepIndication = translate( 'Step %(currentStep)s of %(stepCount)s', {
		args: { currentStep: currentNumericStep, stepCount: steps.length },
	} );

	return (
		<>
			{ selectedSiteId ? <QueryJetpackPlugins siteIds={ [ selectedSiteId ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<h1 className="marketplace-plugin-setup-status__title wp-brand-font">{ currentStep }</h1>
					<StyledProgressBar value={ simulatedProgressPercentage } color="#C9356E" compact />
					<div>{ stepIndication }</div>
				</div>
			</div>
		</>
	);
}

export default function MarketplacePluginSetup(): JSX.Element {
	return (
		<ThemeProvider theme={ theme }>
			<WrappedMarketplacePluginSetup />
		</ThemeProvider>
	);
}
