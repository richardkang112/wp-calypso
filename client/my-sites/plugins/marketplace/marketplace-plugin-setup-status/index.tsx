/**
 * External dependencies
 */
import React, { useEffect } from 'react';
import { ThemeProvider } from 'emotion-theming';
import { ProgressBar, Button } from '@automattic/components';
import styled from '@emotion/styled';
import { useSelector, useDispatch } from 'react-redux';
import page from 'page';

/**
 * Internal dependencies
 */
import theme from 'calypso/my-sites/plugins/marketplace/theme';
import Masterbar from 'calypso/layout/masterbar/masterbar';
import { getStatusForPlugin } from 'calypso/state/plugins/installed/selectors';
import { getSelectedSite } from 'calypso/state/ui/selectors';
import QueryJetpackPlugins from 'calypso/components/data/query-jetpack-plugins';
import { fetchPluginData as wporgFetchPluginData } from 'calypso/state/plugins/wporg/actions';
import { initiateThemeTransfer } from 'calypso/state/themes/actions';
import { getAutomatedTransferStatus } from 'calypso/state/automated-transfer/selectors';
/**
 * Style dependencies
 */
import 'calypso/my-sites/plugins/marketplace/marketplace-plugin-setup-status/style.scss';

const StyledProgressBar = styled( ProgressBar )`
	margin: 20px 0px;
`;

function WrappedMarketplacePluginSetup( {
	pluginSlug = 'wordpress-seo',
}: {
	pluginSlug?: string;
} ): JSX.Element {
	const selectedSite = useSelector( getSelectedSite );
	const dispatch = useDispatch();

	// Check if business plan before transferring

	// const wporgPlugin = useSelector( ( state ) => getWporgPlugin( state, pluginSlug ) );
	// const sitePlugin = useSelector( ( state ) => getPluginOnSite( state, pluginSlug ) );
	const transferStatus = useSelector( ( state ) =>
		getAutomatedTransferStatus( state, selectedSite?.ID )
	);

	//Plugin status can be extracted with this selector once installation is triggered
	const pluginStatus = useSelector( ( state ) => {
		return selectedSite ? getStatusForPlugin( state, selectedSite?.ID, pluginSlug ) : 'UNKNOWN';
	} );

	const onInstallPlugin = () => {
		dispatch( initiateThemeTransfer( selectedSite.ID, null, pluginSlug ) );
	};

	useEffect( () => {
		dispatch( wporgFetchPluginData( pluginSlug ) );
	}, [ dispatch, pluginSlug ] );

	useEffect( () => {
		if ( transferStatus === 'complete' ) {
			setTimeout( () => {
				page( `/plugins/wordpress-seo${ selectedSite?.slug ? `/${ selectedSite.slug }` : '' }` );
			}, 2000 );
		}
	}, [ selectedSite.slug, transferStatus ] );
	return (
		<>
			{ selectedSite?.ID ? <QueryJetpackPlugins siteIds={ [ selectedSite.ID ] } /> : '' }
			<Masterbar></Masterbar>
			<div className="marketplace-plugin-setup-status__root">
				<div>
					<Button onClick={ onInstallPlugin }>Install { pluginSlug } </Button>
					<h1 className="marketplace-plugin-setup-status__title wp-brand-font">
						Installing Plugin
						<div>Plugin Status : { pluginStatus }</div>
						<div>Transfer Status : { transferStatus }</div>
					</h1>
					<StyledProgressBar value={ 25 } color={ '#C9356E' } compact />
					<div>Step 1 of 3</div>
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
