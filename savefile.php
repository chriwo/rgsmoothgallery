<?php
/***************************************************************
*  Copyright notice
*
*  (c) 1999-2007 Peter Klein (peter@umloud.dk)
*  (c) 1999-2007 Georg Ringer (http://www.just2b.com)
*  All rights reserved
*
*  This script is part of the TYPO3 project. The TYPO3 project is
*  free software; you can redistribute it and/or modify
*  it under the terms of the GNU General Public License as published by
*  the Free Software Foundation; either version 2 of the License, or
*  (at your option) any later version.
*
*  The GNU General Public License can be found at
*  http://www.gnu.org/copyleft/gpl.html.
*  A copy is found in the textfile GPL.txt and important notices to the license
*  from the author is found in LICENSE.txt distributed with these scripts.
*
*
*  This script is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU General Public License for more details.
*
*  This copyright notice MUST APPEAR in all copies of the script!
***************************************************************/

define('TYPO3_MODE','BE');
define('TYPO3_cliMode', TRUE);
define('TYPO3_OS', stristr(PHP_OS,'win')&&!stristr(PHP_OS,'darwin')?'WIN':'');
define('PATH_thisScript',str_replace('//','/', str_replace('\\','/', (php_sapi_name()=='cgi'||php_sapi_name()=='isapi' ||php_sapi_name()=='cgi-fcgi')&&($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED'])? ($_SERVER['ORIG_PATH_TRANSLATED']?$_SERVER['ORIG_PATH_TRANSLATED']:$_SERVER['PATH_TRANSLATED']):($_SERVER['ORIG_SCRIPT_FILENAME']?$_SERVER['ORIG_SCRIPT_FILENAME']:$_SERVER['SCRIPT_FILENAME']))));
define('PATH_site', ereg_replace('[^/]*.[^/]*$','',dirname(dirname(PATH_thisScript))));
define('PATH_typo3', PATH_site.'typo3/');
define('PATH_typo3conf', PATH_site.'typo3conf/');
define('PATH_t3lib', PATH_site.'t3lib/');
require_once(PATH_t3lib.'class.t3lib_div.php');

$image = $_GET['image'];

	// remove domain if it is prepended
$image = str_replace(t3lib_div::getIndpEnv('TYPO3_SITE_URL'), '', $image);
$allowedExtensions = t3lib_div::trimExplode(',', (strlen($TYPO3_CONF_VARS['GFX']['imagefile_ext']) > 0 ? $TYPO3_CONF_VARS['GFX']['imagefile_ext'] : 'gif,jpg,jpeg,tif,bmp,pcx,tga,png,pdf,ai'), 1);
$imageInfo = pathinfo($image);
if(!is_file(t3lib_div::getFileAbsFileName($image)) || !in_array(strtolower($imageInfo['extension']), $allowedExtensions)) { die('You try to download a file, you are not allowed to download'); }


switch ($_GET['mode']) {
	case 'print':
		print_image($image);
	break;
	case 'save':
		force_download($image);
	break;
	default:
	break;
}
exit;

function print_image($filename) {
	echo '<html>
	<head>
		<title>Print</title>
		<script type="text/javascript">
		function printit(){
			try {
				window.print();
			}
			catch(err) {
				return;
			}
			window.close();
		}
		window.onload = printit;
		</script>
	</head>
	<body style="margin:0;padding:0;">
		<img src="/'.$filename.'" style="border:none;cursor:pointer;" onclick="self.close()">
	</body>
</html>';
}

function force_download ($filename, $mimetype='') {
$filenameOrig = $filename;
#	$filename = str_replace(,PATH_site,$filename);
	$filename = t3lib_div::getIndpEnv('TYPO3_SITE_URL').$filename;
	#if (!file_exists($filename)) return false;

		// Mimetype not set?
		if (empty($mimetype)) {
		$file_extension = strtolower(substr(strrchr($filename,"."),1));
		switch( $file_extension ) {
			case "pdf": $mimetype="application/pdf"; break;
			case "exe": $mimetype="application/octet-stream"; break;
			case "zip": $mimetype="application/zip"; break;
			case "doc": $mimetype="application/msword"; break;
			case "xls": $mimetype="application/vnd.ms-excel"; break;
			case "ppt": $mimetype="application/vnd.ms-powerpoint"; break;
			case "gif": $mimetype="image/gif"; break;
			case "png": $mimetype="image/png"; break;
			case "jpeg":
			case "jpg": $mimetype="image/jpg"; break;
			default: $mimetype="application/force-download";
		}
	}



	// Make sure there's nothing else left
	ob_clean_all();

	// Start sending headers
	header('Pragma: public'); // required
	header('Expires: 0');
	header('Cache-Control: must-revalidate, post-check=0, pre-check=0');
	header('Cache-Control: private',false); // required for certain browsers
	header('Content-Transfer-Encoding: binary');
	header('Content-Type: ' . 'image/jpg');

	header('Content-Disposition: attachment; filename="' . (basename($filename) ) . '";' );

	// Send data
	readfile($filename);
	exit;
}

function ob_clean_all () {
	$ob_active = ob_get_length () !== false;
	while($ob_active) {
		ob_end_clean();
		$ob_active = ob_get_length () !== false;
	}
	return true;
}

?>
