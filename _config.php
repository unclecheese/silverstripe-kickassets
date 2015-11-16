<?php

define('KICKASSETS_DIR', basename(__DIR__));

// IE9 doesn't get to play with us.
if(!preg_match('/(?i)msie [5-9]/',$_SERVER['HTTP_USER_AGENT'])) {
	CMSMenu::remove_menu_item('AssetAdmin');
}
else {
	CMSMenu::remove_menu_item('KickAssets');
}

if(KickAssets::config()->use_on_uploadfield) {
	Config::inst()->update('LeftAndMain','extra_requirements_javascript', array(
		KICKASSETS_DIR.'/javascript/kickassets-uploadfield.js' => array ()
	));
}