<?php
/**
 * Seed screenshot-ready demo content into the Local PressBridge site.
 *
 * This creates a small set of clean demo pages and a demo post for repo screenshots.
 * It also seeds a preview revision + token for the demo preview route.
 */

function pressbridge_demo_connect_local_db() {
	$sites_file = getenv( 'APPDATA' ) . '/Local/sites.json';

	if ( ! file_exists( $sites_file ) ) {
		fwrite( STDERR, "Could not find Local sites.json at {$sites_file}\n" );
		exit( 1 );
	}

	$sites = json_decode( (string) file_get_contents( $sites_file ), true );

	if ( ! is_array( $sites ) ) {
		fwrite( STDERR, "Could not parse Local sites.json\n" );
		exit( 1 );
	}

	$site_config = null;

	foreach ( $sites as $site ) {
		if ( isset( $site['domain'] ) && 'wp-to-react.local' === $site['domain'] ) {
			$site_config = $site;
			break;
		}
	}

	if ( ! is_array( $site_config ) ) {
		fwrite( STDERR, "Could not find Local site config for wp-to-react.local\n" );
		exit( 1 );
	}

	$mysqli = mysqli_init();
	$port   = (int) ( $site_config['services']['mysql']['ports']['MYSQL'][0] ?? 0 );

	$connected = $mysqli->real_connect(
		'127.0.0.1',
		$site_config['mysql']['user'] ?? 'root',
		$site_config['mysql']['password'] ?? 'root',
		$site_config['mysql']['database'] ?? 'local',
		$port
	);

	if ( ! $connected ) {
		fwrite( STDERR, "Could not connect to Local MySQL on port {$port}: {$mysqli->connect_error}\n" );
		exit( 1 );
	}

	$mysqli->set_charset( 'utf8mb4' );

	return $mysqli;
}

function pressbridge_demo_get_home_url( mysqli $mysqli ) {
	$result   = $mysqli->query( "SELECT option_value FROM wp_options WHERE option_name = 'home' LIMIT 1" );
	$home_url = 'http://wp-to-react.local';

	if ( $result instanceof mysqli_result ) {
		$row = $result->fetch_assoc();
		if ( isset( $row['option_value'] ) ) {
			$home_url = rtrim( (string) $row['option_value'], '/' );
		}
		$result->free();
	}

	return $home_url;
}

function pressbridge_demo_image_uri( $title, $accent = '#2563eb', $background = '#eef4ff', $background_alt = '#dbeafe', $show_title = true ) {
	$title          = htmlspecialchars( $title, ENT_QUOTES );
	$accent         = htmlspecialchars( $accent, ENT_QUOTES );
	$background     = htmlspecialchars( $background, ENT_QUOTES );
	$background_alt = htmlspecialchars( $background_alt, ENT_QUOTES );
	$title_markup   = '';

	if ( $show_title && '' !== $title ) {
		$title_markup = '<text x="230" y="640" fill="#0f172a" font-family="Arial, Helvetica, sans-serif" font-size="54" font-weight="700">' . $title . '</text>';
	}

	$svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 900" role="img" aria-label="{$title}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="{$background}" />
      <stop offset="100%" stop-color="{$background_alt}" />
    </linearGradient>
    <linearGradient id="panel" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="rgba(255,255,255,0.94)" />
      <stop offset="100%" stop-color="rgba(255,255,255,0.72)" />
    </linearGradient>
  </defs>
  <rect width="1400" height="900" fill="url(#bg)" />
  <circle cx="180" cy="160" r="150" fill="{$accent}" opacity="0.16" />
  <circle cx="1180" cy="160" r="120" fill="{$accent}" opacity="0.12" />
  <circle cx="1120" cy="760" r="170" fill="{$accent}" opacity="0.14" />
  <rect x="150" y="150" width="1100" height="620" rx="36" fill="url(#panel)" stroke="rgba(15,23,42,0.08)" />
  <rect x="230" y="240" width="340" height="220" rx="26" fill="{$accent}" opacity="0.18" />
  <rect x="630" y="240" width="320" height="30" rx="15" fill="#0f172a" opacity="0.86" />
  <rect x="630" y="292" width="240" height="20" rx="10" fill="#334155" opacity="0.70" />
  <rect x="630" y="344" width="420" height="18" rx="9" fill="#475569" opacity="0.42" />
  <rect x="630" y="378" width="390" height="18" rx="9" fill="#475569" opacity="0.32" />
  <rect x="630" y="452" width="190" height="56" rx="18" fill="{$accent}" />
  <rect x="840" y="452" width="170" height="56" rx="18" fill="transparent" stroke="{$accent}" stroke-width="4" />
  {$title_markup}
</svg>
SVG;

	return 'data:image/svg+xml;utf8,' . rawurlencode( $svg );
}

function pressbridge_demo_upsert_content( mysqli $mysqli, array $item, $home_url ) {
	$post_type   = $item['post_type'];
	$post_name   = $item['post_name'];
	$post_title  = $item['post_title'];
	$post_status = $item['post_status'];
	$post_parent = isset( $item['post_parent'] ) ? (int) $item['post_parent'] : 0;
	$post_date   = gmdate( 'Y-m-d H:i:s' );
	$guid_path   = isset( $item['path'] ) ? ltrim( $item['path'], '/' ) : $post_name . '/';
	$guid        = $home_url . '/' . $guid_path;

	$select_stmt = $mysqli->prepare( "SELECT ID FROM wp_posts WHERE post_type = ? AND post_name = ? LIMIT 1" );
	$insert_stmt = $mysqli->prepare(
		"INSERT INTO wp_posts (
			post_author, post_date, post_date_gmt, post_content, post_title,
			post_excerpt, post_status, comment_status, ping_status, post_password,
			post_name, to_ping, pinged, post_modified, post_modified_gmt,
			post_content_filtered, post_parent, guid, menu_order, post_type,
			post_mime_type, comment_count
		) VALUES (1, ?, ?, ?, ?, ?, ?, 'closed', 'closed', '', ?, '', '', ?, ?, '', ?, ?, 0, ?, '', 0)"
	);
	$update_stmt = $mysqli->prepare(
		"UPDATE wp_posts SET
			post_date = ?, post_date_gmt = ?, post_content = ?, post_title = ?,
			post_excerpt = ?, post_status = ?, post_parent = ?, post_modified = ?, post_modified_gmt = ?, guid = ?
		WHERE ID = ?"
	);

	$select_stmt->bind_param( 'ss', $post_type, $post_name );
	$select_stmt->execute();
	$result      = $select_stmt->get_result();
	$existing_id = null;

	if ( $result instanceof mysqli_result ) {
		$row = $result->fetch_assoc();
		if ( isset( $row['ID'] ) ) {
			$existing_id = (int) $row['ID'];
		}
		$result->free();
	}

	if ( $existing_id ) {
		$update_stmt->bind_param(
			'ssssssisssi',
			$post_date,
			$post_date,
			$item['post_content'],
			$post_title,
			$item['post_excerpt'],
			$post_status,
			$post_parent,
			$post_date,
			$post_date,
			$guid,
			$existing_id
		);
		$update_stmt->execute();
		$post_id = $existing_id;
	} else {
		$insert_stmt->bind_param(
			'sssssssssiss',
			$post_date,
			$post_date,
			$item['post_content'],
			$post_title,
			$item['post_excerpt'],
			$post_status,
			$post_name,
			$post_date,
			$post_date,
			$post_parent,
			$guid,
			$post_type
		);
		$insert_stmt->execute();
		$post_id = (int) $mysqli->insert_id;
	}

	$select_stmt->close();
	$insert_stmt->close();
	$update_stmt->close();

	if ( ! $post_id ) {
		fwrite( STDERR, "Failed to create or update demo content {$post_name}: {$mysqli->error}\n" );
		exit( 1 );
	}

	return $post_id;
}

function pressbridge_demo_upsert_revision( mysqli $mysqli, $post_id, $title, $content, $guid ) {
	$select_stmt = $mysqli->prepare( "SELECT ID FROM wp_posts WHERE post_type = 'revision' AND post_parent = ? AND post_name = ? LIMIT 1" );
	$insert_stmt = $mysqli->prepare(
		"INSERT INTO wp_posts (
			post_author, post_date, post_date_gmt, post_content, post_title,
			post_excerpt, post_status, comment_status, ping_status, post_password,
			post_name, to_ping, pinged, post_modified, post_modified_gmt,
			post_content_filtered, post_parent, guid, menu_order, post_type,
			post_mime_type, comment_count
		) VALUES (1, ?, ?, ?, ?, '', 'inherit', 'closed', 'closed', '', ?, '', '', ?, ?, '', ?, ?, 0, 'revision', '', 0)"
	);
	$update_stmt = $mysqli->prepare(
		"UPDATE wp_posts SET
			post_date = ?, post_date_gmt = ?, post_content = ?, post_title = ?, post_modified = ?, post_modified_gmt = ?, guid = ?
		WHERE ID = ?"
	);

	$revision_slug = $post_id . '-demo-preview-v1';
	$now           = gmdate( 'Y-m-d H:i:s' );

	$select_stmt->bind_param( 'is', $post_id, $revision_slug );
	$select_stmt->execute();
	$result      = $select_stmt->get_result();
	$existing_id = null;

	if ( $result instanceof mysqli_result ) {
		$row = $result->fetch_assoc();
		if ( isset( $row['ID'] ) ) {
			$existing_id = (int) $row['ID'];
		}
		$result->free();
	}

	if ( $existing_id ) {
		$update_stmt->bind_param( 'sssssssi', $now, $now, $content, $title, $now, $now, $guid, $existing_id );
		$update_stmt->execute();
		$revision_id = $existing_id;
	} else {
		$insert_stmt->bind_param( 'sssssssis', $now, $now, $content, $title, $revision_slug, $now, $now, $post_id, $guid );
		$insert_stmt->execute();
		$revision_id = (int) $mysqli->insert_id;
	}

	$select_stmt->close();
	$insert_stmt->close();
	$update_stmt->close();

	if ( ! $revision_id ) {
		fwrite( STDERR, "Failed to create or update demo revision: {$mysqli->error}\n" );
		exit( 1 );
	}

	return $revision_id;
}

function pressbridge_demo_upsert_transient( mysqli $mysqli, $token, array $payload, $expires_at ) {
	$key_hash      = md5( $token );
	$value_name    = '_transient_wtr_preview_' . $key_hash;
	$timeout_name  = '_transient_timeout_wtr_preview_' . $key_hash;
	$payload_value = serialize( $payload );

	$stmt = $mysqli->prepare(
		"INSERT INTO wp_options (option_name, option_value, autoload)
		 VALUES (?, ?, 'off')
		 ON DUPLICATE KEY UPDATE option_value = VALUES(option_value), autoload = 'off'"
	);

	$stmt->bind_param( 'ss', $value_name, $payload_value );
	$stmt->execute();

	$timeout_value = (string) $expires_at;
	$stmt->bind_param( 'ss', $timeout_name, $timeout_value );
	$stmt->execute();
	$stmt->close();
}

$mysqli   = pressbridge_demo_connect_local_db();
$home_url = pressbridge_demo_get_home_url( $mysqli );

$layout_image = pressbridge_demo_image_uri( 'Content + Layout', '#2563eb', '#eff6ff', '#dbeafe', false );
$cover_image  = pressbridge_demo_image_uri( 'Preview + Routing', '#0f766e', '#d9f3f1', '#b7e7e3', false );
$media_image  = pressbridge_demo_image_uri( 'Editorial Flow', '#7c3aed', '#f5f3ff', '#ede9fe', false );

$demo_layout_content = strtr(
	<<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"32px"}}} -->
<div class="wp-block-group"><!-- wp:cover {"url":"__COVER__","dimRatio":78,"overlayColor":"contrast","minHeight":320,"isDark":true} -->
<div class="wp-block-cover is-dark" style="min-height:320px"><span aria-hidden="true" class="wp-block-cover__background has-contrast-background-color has-background-dim"></span><img class="wp-block-cover__image-background" alt="PressBridge cover example" src="__COVER__" data-object-fit="cover"/><div class="wp-block-cover__inner-container"><!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">A readable Gutenberg layout carried into React</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This demo combines a cover, nested groups, columns, media-text, and buttons in a way that stays readable without depending on theme-specific frontend CSS.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-demo-guides/getting-started/">Open the nested route example</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/pressbridge-demo-post/">Read the demo post</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- /wp:cover -->

<!-- wp:group {"style":{"spacing":{"padding":{"top":"28px","right":"28px","bottom":"28px","left":"28px"},"blockGap":"24px"}},"layout":{"type":"constrained"}} -->
<div class="wp-block-group" style="padding-top:28px;padding-right:28px;padding-bottom:28px;padding-left:28px"><!-- wp:columns {"verticalAlignment":"center"} -->
<div class="wp-block-columns are-vertically-aligned-center"><!-- wp:column {"verticalAlignment":"center","width":"38%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:38%"><!-- wp:image {"sizeSlug":"large","linkDestination":"none"} -->
<figure class="wp-block-image size-large"><img src="__LAYOUT__" alt="Abstract layout illustration"/></figure>
<!-- /wp:image --></div>
<!-- /wp:column -->

<!-- wp:column {"verticalAlignment":"center","width":"62%"} -->
<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:62%"><!-- wp:heading {"level":2} -->
<h2 class="wp-block-heading">Layout intent matters more than theme cloning</h2>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>PressBridge keeps the structure, hierarchy, and editorial meaning of the WordPress content while letting React own the public presentation layer.</p>
<!-- /wp:paragraph -->

<!-- wp:group {"layout":{"type":"constrained"}} -->
<div class="wp-block-group"><!-- wp:media-text {"mediaPosition":"right","mediaWidth":38,"isStackedOnMobile":true} -->
<div class="wp-block-media-text has-media-on-the-right is-stacked-on-mobile" style="grid-template-columns:auto 38%"><figure class="wp-block-media-text__media"><img src="__MEDIA__" alt="Editorial workflow illustration"/></figure><div class="wp-block-media-text__content"><!-- wp:paragraph -->
<p>Grouped content, media-text, and clear calls to action should remain readable even when the frontend uses safe fallback behavior to avoid structural breakage.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","orientation":"vertical","justifyContent":"center"}} -->
<div class="wp-block-buttons is-vertical is-content-justification-center"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-demo-preview/">Open the preview source page</a></div>
<!-- /wp:button -->

<!-- wp:button {"className":"is-style-outline"} -->
<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="/pb-demo-simple-page/">Open the simple page</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div></div>
<!-- wp:paragraph -->
<p>This is the beta-core promise in one route: common layouts should hold together clearly, even when the final React styling does not try to mimic the active WordPress theme.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:media-text --></div>
<!-- /wp:group --></div>
<!-- /wp:column --></div>
<!-- /wp:columns --></div>
<!-- /wp:group --></div>
<!-- /wp:group -->
HTML,
	array(
		'__COVER__'  => $cover_image,
		'__LAYOUT__' => $layout_image,
		'__MEDIA__'  => $media_image,
	)
);

$preview_published_content = <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"20px"}}} -->
<div class="wp-block-group"><!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Preview a content change in the frontend</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This published page is the stable public version. The preview example should show a more recent draft revision without changing the normal public route.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML;

$preview_revision_content = <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"20px"}}} -->
<div class="wp-block-group"><!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading">Preview changes before they go live</h1>
<!-- /wp:heading -->

<!-- wp:paragraph -->
<p>This updated intro only appears when a valid preview token is present. It exists to demonstrate that the frontend can render preview content while the published route remains stable.</p>
<!-- /wp:paragraph -->

<!-- wp:buttons {"layout":{"type":"flex","justifyContent":"left"}} -->
<div class="wp-block-buttons"><!-- wp:button -->
<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="/pb-demo-layout/">Return to the layout demo</a></div>
<!-- /wp:button --></div>
<!-- /wp:buttons --></div>
<!-- /wp:group -->
HTML;

$simple_page_content = <<<'HTML'
<!-- wp:group {"layout":{"type":"constrained"},"style":{"spacing":{"blockGap":"18px"}}} -->
<div class="wp-block-group"><!-- wp:paragraph -->
<p>This route is intentionally minimal. It is useful for baseline screenshots and for explaining the difference between normal WordPress page rendering and the React frontend result.</p>
<!-- /wp:paragraph --></div>
<!-- /wp:group -->
HTML;

$parent_page_id = pressbridge_demo_upsert_content(
	$mysqli,
	array(
		'post_type'    => 'page',
		'post_title'   => 'PressBridge Guides',
		'post_name'    => 'pb-demo-guides',
		'post_excerpt' => 'Parent page for the nested route demo.',
		'post_status'  => 'publish',
		'post_content' => '<p>This parent page anchors the nested route demo.</p>',
		'path'         => 'pb-demo-guides/',
	),
	$home_url
);

$demo_pages = array(
	'layout' => array(
		'post_type'    => 'page',
		'post_title'   => 'PressBridge Layout Demo',
		'post_name'    => 'pb-demo-layout',
		'post_excerpt' => 'Clean Gutenberg layout example for screenshots.',
		'post_status'  => 'publish',
		'post_content' => $demo_layout_content,
		'path'         => 'pb-demo-layout/',
	),
	'preview' => array(
		'post_type'    => 'page',
		'post_title'   => 'PressBridge Preview Demo',
		'post_name'    => 'pb-demo-preview',
		'post_excerpt' => 'Published source page for the preview screenshot.',
		'post_status'  => 'publish',
		'post_content' => $preview_published_content,
		'path'         => 'pb-demo-preview/',
	),
	'nested-child' => array(
		'post_type'    => 'page',
		'post_title'   => 'Getting Started with PressBridge',
		'post_name'    => 'getting-started',
		'post_excerpt' => 'Nested route demo page.',
		'post_status'  => 'publish',
		'post_content' => '<p>This nested route exists to show that the frontend does not have to guess WordPress permalink truth.</p><p>The page title comes from WordPress route resolution, while the body content stays clean and non-duplicated for screenshots.</p>',
		'post_parent'  => $parent_page_id,
		'path'         => 'pb-demo-guides/getting-started/',
	),
	'simple-page' => array(
		'post_type'    => 'page',
		'post_title'   => 'PressBridge Simple Page',
		'post_name'    => 'pb-demo-simple-page',
		'post_excerpt' => 'Simple baseline page for screenshots.',
		'post_status'  => 'publish',
		'post_content' => $simple_page_content,
		'path'         => 'pb-demo-simple-page/',
	),
);

$created = array(
	'pages' => array(),
	'posts' => array(),
);

foreach ( $demo_pages as $key => $page ) {
	$post_id = pressbridge_demo_upsert_content( $mysqli, $page, $home_url );
	$created['pages'][ $key ] = array(
		'id'         => $post_id,
		'title'      => $page['post_title'],
		'path'       => '/' . ltrim( $page['path'], '/' ),
		'public_url' => $home_url . '/' . ltrim( $page['path'], '/' ),
		'edit_url'   => $home_url . '/wp-admin/post.php?post=' . $post_id . '&action=edit',
	);
}

$post_id = pressbridge_demo_upsert_content(
	$mysqli,
	array(
		'post_type'    => 'post',
		'post_title'   => 'Shipping a React Frontend from WordPress',
		'post_name'    => 'pressbridge-demo-post',
		'post_excerpt' => 'Simple post example for baseline route screenshots.',
		'post_status'  => 'publish',
		'post_content' => '<p>This demo post exists so the repo can show a simple post route rendered through the PressBridge starter.</p><p>It is intentionally light on structure so the screenshot reads as a normal content route instead of another special demo page.</p>',
		'path'         => 'pressbridge-demo-post/',
	),
	$home_url
);

$created['posts']['simple-post'] = array(
	'id'         => $post_id,
		'title'      => 'Shipping a React Frontend from WordPress',
		'path'       => '/pressbridge-demo-post/',
		'public_url' => $home_url . '/pressbridge-demo-post/',
		'edit_url'   => $home_url . '/wp-admin/post.php?post=' . $post_id . '&action=edit',
);

$preview_token = 'pbdemopreviewtoken001';
$revision_id   = pressbridge_demo_upsert_revision(
	$mysqli,
	$created['pages']['preview']['id'],
	'PressBridge Preview Demo Draft',
	$preview_revision_content,
	$home_url . '/?p=' . $created['pages']['preview']['id'] . '&preview=true'
);

pressbridge_demo_upsert_transient(
	$mysqli,
	$preview_token,
	array(
		'post_id'     => $created['pages']['preview']['id'],
		'revision_id' => $revision_id,
		'user_id'     => 1,
		'created_at'  => time(),
	),
	time() + 900
);

$created['preview'] = array(
	'token'                 => $preview_token,
		'published_public_url'  => $created['pages']['preview']['public_url'],
		'frontend_preview_url'  => 'http://localhost:5173/pb-demo-preview/?wtr_preview=1&wtr_preview_token=' . $preview_token,
		'wordpress_edit_url'    => $created['pages']['preview']['edit_url'],
		'revision_title'        => 'PressBridge Preview Demo Draft',
);

$mysqli->close();

echo json_encode( $created, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES ) . "\n";
