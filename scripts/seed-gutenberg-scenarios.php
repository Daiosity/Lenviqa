<?php
/**
 * Seed intentionally messy Gutenberg scenario pages into the Local PressBridge site.
 *
 * The script writes directly to the Local database so it stays reliable even when
 * the CLI runtime does not bootstrap WordPress the same way the Local web stack does.
 */

function pressbridge_scenario_image_uri( $title, $accent = '#3b82f6', $background = '#eef4ff', $background_alt = '#dbeafe' ) {
	$title      = htmlspecialchars( $title, ENT_QUOTES );
	$accent     = htmlspecialchars( $accent, ENT_QUOTES );
	$background = htmlspecialchars( $background, ENT_QUOTES );
	$background_alt = htmlspecialchars( $background_alt, ENT_QUOTES );

	$svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 900" role="img" aria-label="{$title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$background}" />
      <stop offset="100%" stop-color="{$background_alt}" />
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.92)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.66)" />
    </linearGradient>
  </defs>
  <rect width="1200" height="900" fill="url(#bg)" />
  <circle cx="180" cy="180" r="140" fill="{$accent}" opacity="0.18" />
  <circle cx="1030" cy="130" r="90" fill="{$accent}" opacity="0.14" />
  <circle cx="930" cy="710" r="170" fill="{$accent}" opacity="0.12" />
  <rect x="120" y="130" width="960" height="640" rx="36" fill="url(#panel)" stroke="rgba(15,23,42,0.08)" />
  <rect x="180" y="220" width="320" height="220" rx="24" fill="{$accent}" opacity="0.16" />
  <rect x="550" y="220" width="350" height="32" rx="16" fill="#0f172a" opacity="0.8" />
  <rect x="550" y="276" width="250" height="22" rx="11" fill="#334155" opacity="0.72" />
  <rect x="550" y="328" width="410" height="18" rx="9" fill="#475569" opacity="0.48" />
  <rect x="550" y="364" width="390" height="18" rx="9" fill="#475569" opacity="0.38" />
  <rect x="550" y="400" width="340" height="18" rx="9" fill="#475569" opacity="0.28" />
  <rect x="550" y="474" width="180" height="54" rx="18" fill="{$accent}" />
  <rect x="750" y="474" width="160" height="54" rx="18" fill="transparent" stroke="{$accent}" stroke-width="4" />
  <text x="180" y="625" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">{$title}</text>
</svg>
SVG;

	return 'data:image/svg+xml;utf8,' . rawurlencode( $svg );
}

$pages = array(
	array(
		'post_title'   => 'PB Scenario Nested Layout',
		'post_name'    => 'pb-scenario-nested-layout',
		'post_excerpt' => 'Nested groups with columns, media, and button layouts.',
		'post_content' => <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:group {"style":{"spacing":{"padding":{"top":"32px","right":"32px","bottom":"32px","left":"32px"},"blockGap":"24px"},"color":{"background":"#f3f7ff"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group has-background" style="background-color:#f3f7ff;padding-top:32px;padding-right:32px;padding-bottom:32px;padding-left:32px"><!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Nested groups should still read like one section</h2>
<!-- /wp:heading -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"40%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:40%"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80" alt="Keyboard and monitor setup"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"60%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:60%"><!-- wp:paragraph -->
<p>This route combines nested groups, columns, and action buttons. The goal is not pixel-perfect fidelity. The goal is preserving hierarchy and keeping the layout from collapsing.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/sample-page/">Open Sample Page</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/blog/">Open Blog</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
HTML,
	),
	array(
		'post_title'   => 'PB Scenario Media and Buttons',
		'post_name'    => 'pb-scenario-media-and-buttons',
		'post_excerpt' => 'Media-text inside groups with mixed button alignment and fallback-friendly structure.',
		'post_content' => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"28px","bottom":"28px"},"blockGap":"28px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:28px;padding-bottom:28px"><!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Media-text and buttons should preserve intent</h2>
<!-- /wp:heading -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:media-text {"mediaPosition":"right","mediaWidth":42,"isStackedOnMobile":true} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 42%"><figure class="wp-block-media-text__media"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80" alt="Laptop with code editor"/></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>This media-text block keeps its real content in the saved markup. If parsed inner blocks are sparse, PressBridge should still keep the media and copy relationship intact.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-buttons is-vertical is-content-justification-center"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/test-page/">Review Test Page</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/sample-page/">Open Sample Page</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:media-text --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
HTML,
	),
	array(
		'post_title'   => 'PB Scenario Cover CTA',
		'post_name'    => 'pb-scenario-cover-cta',
		'post_excerpt' => 'Cover block with inner content and button groups.',
		'post_content' => <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"24px"}}} -->
<div class="wp-block-group"><!-- wp:cover {"url":"https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80","dimRatio":50,"overlayColor":"contrast","minHeight":320,"isDark":true} -->
<div class="wp-block-cover is-dark" style="min-height:320px"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim"></span><img class="wp-block-cover__image-background" alt="Desk with monitor and coffee" src="https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"textAlign":"left","level":2} -->
<h2 class="wp-block-heading has-text-align-left">Cover blocks should preserve the hero relationship</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>Inner content, buttons, and overlay treatment should stay readable even if fidelity stays intentionally approximate.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-scenario-gallery-fallback/">Open Gallery Scenario</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/pb-scenario-media-and-buttons/">Open Media Scenario</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover --></div>
<!-- /wp:group -->
HTML,
	),
	array(
		'post_title'   => 'PB Scenario Gallery Fallback',
		'post_name'    => 'pb-scenario-gallery-fallback',
		'post_excerpt' => 'Gallery markup that should remain stable even when parsed inner blocks are incomplete.',
		'post_content' => <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"24px"}}} -->
<div class="wp-block-group"><!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Gallery fallback should stay coherent</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This gallery intentionally uses saved HTML without nested image block comments. PressBridge should still recover a stable grid instead of collapsing into raw markup.</p>
<!-- /wp:paragraph -->

<!-- wp:gallery {"columns":3,"linkTo":"none"} -->
<figure class="wp-block-gallery has-nested-images columns-3 is-cropped">
<figure class="wp-block-image size-large"><img src="https://images.unsplash.com/photo-1515879218367-8466d9108023?auto=format&fit=crop&w=900&q=80" alt="Warm desk setup"/><figcaption class="blocks-gallery-caption">Warm desk setup</figcaption></figure>
<figure class="wp-block-image size-large"><img src="https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80" alt="Laptop and notebook"/><figcaption class="blocks-gallery-caption">Laptop and notebook</figcaption></figure>
<figure class="wp-block-image size-large"><img src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80" alt="Editor and terminal"/><figcaption class="blocks-gallery-caption">Editor and terminal</figcaption></figure>
</figure>
<!-- /wp:gallery --></div>
<!-- /wp:group -->
HTML,
	),
	array(
		'post_title'   => 'PB Scenario Mixed Layout Stack',
		'post_name'    => 'pb-scenario-mixed-layout-stack',
		'post_excerpt' => 'Nested groups with columns, media-text, cover, and varied buttons in one page.',
		'post_content' => <<<'HTML'
<!-- wp:group {"style":{"spacing":{"padding":{"top":"36px","bottom":"36px"},"blockGap":"32px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:36px;padding-bottom:36px"><!-- wp:columns -->
<div class="wp-block-columns"><!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"style":{"spacing":{"blockGap":"20px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Mixed layout stacks should not break structurally</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This page intentionally stacks several common Gutenberg patterns together so PressBridge can prove it preserves layout intent.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"space-between"}} -->
<div class="wp-block-buttons is-content-justification-space-between"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-scenario-cover-cta/">Open Cover Scenario</a></div>
<!-- /wp:button -->

<!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-scenario-nested-layout/">Open Nested Scenario</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group --></div>
<!-- /wp:column -->

<!-- wp:column -->
<div class="wp-block-column"><!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:media-text {"mediaWidth":40} -->
<div class="wp-block-media-text" style="grid-template-columns:40% auto"><figure class="wp-block-media-text__media"><img src="https://images.unsplash.com/photo-1516321310764-8d3d0e1c7b2f?auto=format&fit=crop&w=1000&q=80" alt="Notebook and keyboard"/></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>Media-text inside a column group should still respect the side-by-side relationship when it fits and stack safely when it does not.</p>
<!-- /wp:paragraph --></div></div>
<!-- /wp:media-text --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group -->
HTML,
	),
);

$image_map = array(
	'https://images.unsplash.com/photo-1515879218367-8466d910aaa4?auto=format&fit=crop&w=1200&q=80' => pressbridge_scenario_image_uri( 'Nested Columns', '#2563eb', '#eff6ff', '#dbeafe' ),
	'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80' => pressbridge_scenario_image_uri( 'Media Text', '#7c3aed', '#f5f3ff', '#ede9fe' ),
	'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1400&q=80' => pressbridge_scenario_image_uri( 'Cover CTA', '#0f766e', '#ecfeff', '#cffafe' ),
	'https://images.unsplash.com/photo-1515879218367-8466d9108023?auto=format&fit=crop&w=900&q=80'  => pressbridge_scenario_image_uri( 'Gallery One', '#ea580c', '#fff7ed', '#fed7aa' ),
	'https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80'  => pressbridge_scenario_image_uri( 'Gallery Two', '#0891b2', '#ecfeff', '#bae6fd' ),
	'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=900&q=80'   => pressbridge_scenario_image_uri( 'Gallery Three', '#9333ea', '#faf5ff', '#e9d5ff' ),
	'https://images.unsplash.com/photo-1516321310764-8d3d0e1c7b2f?auto=format&fit=crop&w=1000&q=80'  => pressbridge_scenario_image_uri( 'Mixed Layout', '#1d4ed8', '#eff6ff', '#bfdbfe' ),
);

foreach ( $pages as &$page ) {
	$page['post_content'] = strtr( $page['post_content'], $image_map );
}
unset( $page );

function pressbridge_scenario_seed_via_db( array $pages ) {
	$sitesFile = getenv( 'APPDATA' ) . '/Local/sites.json';

	if ( ! file_exists( $sitesFile ) ) {
		fwrite( STDERR, "Could not find Local sites.json at {$sitesFile}\n" );
		exit( 1 );
	}

	$sites = json_decode( (string) file_get_contents( $sitesFile ), true );

	if ( ! is_array( $sites ) ) {
		fwrite( STDERR, "Could not parse Local sites.json\n" );
		exit( 1 );
	}

	$siteConfig = null;

	foreach ( $sites as $site ) {
		if ( isset( $site['domain'] ) && 'wp-to-react.local' === $site['domain'] ) {
			$siteConfig = $site;
			break;
		}
	}

	if ( ! is_array( $siteConfig ) ) {
		fwrite( STDERR, "Could not find Local site config for wp-to-react.local\n" );
		exit( 1 );
	}

	$mysqli = mysqli_init();
	$port   = (int) ( $siteConfig['services']['mysql']['ports']['MYSQL'][0] ?? 0 );

	$connected = $mysqli->real_connect(
		'127.0.0.1',
		$siteConfig['mysql']['user'] ?? 'root',
		$siteConfig['mysql']['password'] ?? 'root',
		$siteConfig['mysql']['database'] ?? 'local',
		$port
	);

	if ( ! $connected ) {
		fwrite( STDERR, "Could not connect to Local MySQL on port {$port}: {$mysqli->connect_error}\n" );
		exit( 1 );
	}

	$mysqli->set_charset( 'utf8mb4' );

	$siteUrlResult = $mysqli->query( "SELECT option_value FROM wp_options WHERE option_name = 'home' LIMIT 1" );
	$homeUrl       = 'http://wp-to-react.local';

	if ( $siteUrlResult instanceof mysqli_result ) {
		$row = $siteUrlResult->fetch_assoc();
		if ( isset( $row['option_value'] ) ) {
			$homeUrl = rtrim( (string) $row['option_value'], '/' );
		}
		$siteUrlResult->free();
	}

	$selectStmt = $mysqli->prepare( "SELECT ID FROM wp_posts WHERE post_type = 'page' AND post_name = ? LIMIT 1" );
	$insertStmt = $mysqli->prepare(
		"INSERT INTO wp_posts (
			post_author, post_date, post_date_gmt, post_content, post_title,
			post_excerpt, post_status, comment_status, ping_status, post_password,
			post_name, to_ping, pinged, post_modified, post_modified_gmt,
			post_content_filtered, post_parent, guid, menu_order, post_type,
			post_mime_type, comment_count
		) VALUES (1, ?, ?, ?, ?, ?, 'publish', 'closed', 'closed', '', ?, '', '', ?, ?, '', 0, ?, 0, 'page', '', 0)"
	);
	$updateStmt = $mysqli->prepare(
		"UPDATE wp_posts SET
			post_date = ?, post_date_gmt = ?, post_content = ?, post_title = ?,
			post_excerpt = ?, post_status = 'publish', comment_status = 'closed',
			ping_status = 'closed', post_modified = ?, post_modified_gmt = ?, guid = ?
		WHERE ID = ?"
	);

	if ( ! $selectStmt || ! $insertStmt || ! $updateStmt ) {
		fwrite( STDERR, "Failed to prepare MySQL statements.\n" );
		exit( 1 );
	}

	$results = array();
	$now     = gmdate( 'Y-m-d H:i:s' );

	foreach ( $pages as $page ) {
		$slug    = $page['post_name'];
		$title   = $page['post_title'];
		$excerpt = $page['post_excerpt'];
		$content = $page['post_content'];
		$guid    = $homeUrl . '/' . $slug . '/';

		$selectStmt->bind_param( 's', $slug );
		$selectStmt->execute();
		$selectResult = $selectStmt->get_result();
		$existingId   = null;

		if ( $selectResult instanceof mysqli_result ) {
			$row = $selectResult->fetch_assoc();
			if ( isset( $row['ID'] ) ) {
				$existingId = (int) $row['ID'];
			}
			$selectResult->free();
		}

		if ( $existingId ) {
			$updateStmt->bind_param( 'ssssssssi', $now, $now, $content, $title, $excerpt, $now, $now, $guid, $existingId );
			$updateStmt->execute();
			$postId = $existingId;
		} else {
			$insertStmt->bind_param( 'sssssssss', $now, $now, $content, $title, $excerpt, $slug, $now, $now, $guid );
			$insertStmt->execute();
			$postId = (int) $mysqli->insert_id;
		}

		if ( ! $postId ) {
			fwrite( STDERR, "Failed to create or update {$slug}: {$mysqli->error}\n" );
			exit( 1 );
		}

		$results[] = array(
			'id'    => $postId,
			'title' => $title,
			'slug'  => $slug,
			'url'   => $guid,
		);
	}

	$selectStmt->close();
	$insertStmt->close();
	$updateStmt->close();
	$mysqli->close();

	return array(
		'mode'    => 'direct-db',
		'created' => $results,
	);
}

$results = pressbridge_scenario_seed_via_db( $pages );

echo json_encode( $results, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) . "\n";
