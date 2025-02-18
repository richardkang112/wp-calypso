/**
 * External dependencies
 */
import assert from 'assert';

/**
 * Internal dependencies
 */
import GutenbergEditorComponent from '../gutenberg-editor-component';
import SiteEditorComponent from '../../components/site-editor-component';
import { getEventsStack, getTotalEventsFiredForBlock } from './utils';

export function createGeneralTests( { it, editorType, postType } ) {
	const isSiteEditor = editorType === 'site';
	const gutenbergEditorType = isSiteEditor ? 'iframe' : 'wp-admin';
	const EditorComponent = isSiteEditor ? SiteEditorComponent : GutenbergEditorComponent;

	it( 'Check for presence of e2e specific tracking events stack on global', async function () {
		await EditorComponent.Expect( this.driver, gutenbergEditorType );
		const eventsStack = await getEventsStack( this.driver );
		assert.strictEqual(
			Array.isArray( eventsStack ),
			true,
			'Tracking events stack missing from window._e2eEventsStack'
		);
	} );

	it( 'Make sure required and custom properties are added to the events', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// Populate the event stack by inserting a few blocks
		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		const eventsStack = await getEventsStack( this.driver );

		const requiredProperties = [ 'blog_id', 'site_type', 'user_locale' ];
		const customProperties = [ 'editor_type', 'post_type' ];
		const allProperties = [ ...requiredProperties, ...customProperties ];
		allProperties.forEach( ( property ) => {
			eventsStack.forEach( ( [ eventName, eventData ] ) => {
				// `post_type` is only set when `editor_type` is set to `post`.
				// We skip the assert in other cases.
				if ( eventData.editor_type !== 'post' && property === 'post_type' ) {
					return;
				}

				assert.notStrictEqual(
					typeof eventData[ property ],
					'undefined',
					`'${ property }' is missing from an event: '${ eventName }'`
				);
			} );
		} );
	} );

	it( `'editor_type' property should be '${ editorType }' and 'post_type' property should be '${ postType }' when editing a post`, async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		await editor.addBlock( 'Heading' );

		const eventsStack = await getEventsStack( this.driver );
		const lastEventData = eventsStack[ 0 ][ 1 ];
		assert.strictEqual(
			lastEventData.editor_type,
			editorType,
			`'editor_type' property does not match '${ editorType }', actual '${ lastEventData.editor_type }'`
		);
		assert.strictEqual(
			lastEventData.post_type,
			postType,
			`'post_type' property does not match '${ postType }', actual '${ lastEventData.post_type }'`
		);
	} );

	it( 'Tracks "wpcom_block_inserted" event', async function () {
		const editor = await EditorComponent.Expect( this.driver, gutenbergEditorType );

		// Insert some Blocks
		await editor.addBlock( 'Heading' );
		await editor.addBlock( 'Columns' );
		await editor.addBlock( 'Columns' );

		// Grab the events stack (only present on e2e test envs).
		// see: https://github.com/Automattic/wp-calypso/pull/41329
		const eventsStack = await getEventsStack( this.driver );

		// Assert that all block insertion events were tracked correctly
		assert.strictEqual(
			getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/heading' ),
			1,
			`"wpcom_block_inserted" editor tracking event failed to fire for core/heading`
		);

		assert.strictEqual(
			getTotalEventsFiredForBlock( eventsStack, 'wpcom_block_inserted', 'core/columns' ),
			2,
			`"wpcom_block_inserted" editor tracking event failed to fire twice for core/columns`
		);
	} );
}
