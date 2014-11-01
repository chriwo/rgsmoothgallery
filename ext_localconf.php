<?php
if (!defined ('TYPO3_MODE')) 	die ('Access denied.');

  ## Extending TypoScript from static template uid=43 to set up userdefined tag:
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTypoScript($_EXTKEY,'editorcfg','
	tt_content.CSS_editor.ch.tx_rgsmoothgallery_pi1 = < plugin.tx_rgsmoothgallery_pi1.CSS_editor
',43);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPItoST43(
	$_EXTKEY,'pi1/class.tx_rgsmoothgallery_pi1.php','_pi1','list_type',1);
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addUserTSConfig('
    options.saveDocNew.tx_rgsmoothgallery_image=1
');

// hook for tt_news
if (TYPO3_MODE == 'FE')    {
    require_once(\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath($_EXTKEY) . 'class.tx_rgsmoothgallery_fe.php');
}

$TYPO3_CONF_VARS['EXTCONF']['tt_news']['extraItemMarkerHook'][]   = 'tx_rgsmoothgallery_fe';
#$TYPO3_CONF_VARS['EXTCONF']['tt_news']['extraGlobalMarkerHook'][]   = 'tx_rgsmoothgallery_fe';