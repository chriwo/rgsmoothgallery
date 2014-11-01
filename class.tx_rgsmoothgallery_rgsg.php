<?php

class tx_rgsmoothgallery_rgsg {

	function user_rgsg($content, $conf) {

		require_once(PATH_t3lib . 'class.t3lib_page.php');
		require_once(PATH_t3lib . 'class.t3lib_tstemplate.php');
		require_once(PATH_t3lib . 'class.t3lib_tsparser_ext.php');

		$sysPageObj = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
			'TYPO3\\CMS\\Frontend\\Page\\PageRepository');
		$rootLine = $sysPageObj->getRootLine($GLOBALS['TSFE']->id);
		$TSObj = \TYPO3\CMS\Core\Utility\GeneralUtility::makeInstance(
			'TYPO3\\CMS\\Core\\TypoScript\\ExtendedTemplateService');
		$TSObj->tt_track = 0;
		$TSObj->init();
		$TSObj->runThroughTemplates($rootLine);
		$TSObj->generateConfig();
		$this->conf = $TSObj->setup['plugin.']['tx_rgsmoothgallery_pi1.'];

		$split = strpos($GLOBALS['TSFE']->currentRecord, ':');
		$id = substr($GLOBALS['TSFE']->currentRecord, $split + 1);
		$where = 'uid =' . $id;
		$table = 'tt_content';
		$res = $GLOBALS['TYPO3_DB']->exec_SELECTquery('imagewidth,imageheight', $table, $where, $groupBy = '', $orderBy, $limit = '');
		$row = $GLOBALS['TYPO3_DB']->sql_fetch_assoc($res);

		$css = ($row['imagewidth']) ? 'width:' . $row['imagewidth'] . 'px;' : '';
		$css .= ($row['imageheight']) ? 'height:' . $row['imageheight'] . 'px;' : '';
		$GLOBALS['TSFE']->additionalCSS['rgsmoothgallery' . $id] = '#myGallery' . $id . ' {' . $css . '}';

		if (\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::isLoaded('t3mootools')) {
			require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath('t3mootools') . 'class.tx_t3mootools.php');
		}

		if (defined('T3MOOTOOLS')) {
			tx_t3mootools::addMooJS();
		} else {
			$header .= $this->getPath($this->conf['pathToMootools']) ? '<script src="' . $this->getPath($this->conf['pathToMootools']) . '" type="text/javascript"></script>' : '';

		}

		// path to js + css

		$GLOBALS['TSFE']->additionalHeaderData['rgsmoothgallery'] = $header . '
        <script src="' . $this->getPath($this->conf['pathToJdgalleryJS']) . '" type="text/javascript"></script>
        <script src="' . $this->getPath($this->conf['pathToSlightboxJS']) . '" type="text/javascript"></script>
        <link rel="stylesheet" href="' . $this->getPath($this->conf['pathToJdgalleryCSS']) . '" type="text/css" media="screen" />
        <link rel="stylesheet" href="' . $this->getPath($this->conf['pathToSlightboxCSS']) . '" type="text/css" media="screen" />';

		return $content;
	}


	function getPath($path) {
		if (substr($path, 0, 4) == 'EXT:') {
			$keyEndPos = strpos($path, '/', 6);
			$key = substr($path, 4, $keyEndPos - 4);
			$keyPath = \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::siteRelpath($key);
			$newPath = $keyPath . substr($path, $keyEndPos + 1);

			return $newPath;
		} else {
			return $path;
		}
	} # end getPath

}

?>