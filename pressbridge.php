<?php
/**
 * Plugin Name: Lenviqa
 * Plugin URI:  https://github.com/Daiosity/Lenviqa
 * Description: Connect WordPress to modern frontends.
 * Version:     0.3.0
 * Author:      Christo Theron
 * Author URI:  https://christotheron.com
 * Update URI:  https://github.com/Daiosity/Lenviqa
 * Text Domain: pressbridge
 * Requires at least: 6.4
 * Requires PHP: 7.4
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

if ( ! defined( 'WTR_VERSION' ) ) {
	define( 'WTR_VERSION', '0.3.0' );
}

if ( ! defined( 'WTR_PLUGIN_FILE' ) ) {
	define( 'WTR_PLUGIN_FILE', __FILE__ );
}

if ( ! defined( 'WTR_PLUGIN_DIR' ) ) {
	define( 'WTR_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );
}

if ( ! defined( 'WTR_PLUGIN_URL' ) ) {
	define( 'WTR_PLUGIN_URL', plugin_dir_url( __FILE__ ) );
}

require_once WTR_PLUGIN_DIR . 'includes/Core/Autoloader.php';

\WP_To_React\Core\Autoloader::register();

register_activation_hook( __FILE__, array( '\WP_To_React\Core\Activator', 'activate' ) );
register_deactivation_hook( __FILE__, array( '\WP_To_React\Core\Deactivator', 'deactivate' ) );

if ( ! function_exists( 'wtr_plugin' ) ) {
	/**
	 * Boot the plugin singleton.
	 *
	 * @return \WP_To_React\Core\Plugin
	 */
	function wtr_plugin() {
		return \WP_To_React\Core\Plugin::instance();
	}
}

wtr_plugin();
