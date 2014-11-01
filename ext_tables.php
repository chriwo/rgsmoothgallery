<?php
if (!defined ('TYPO3_MODE')) {
	die ('Access denied.');
}

$TCA['tt_content']['types']['list']['subtypes_excludelist'][$_EXTKEY.'_pi1']='layout,select_key,pages';


\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPlugin(
	array('LLL:EXT:rgsmoothgallery/locallang_db.xml:tt_content.list_type_pi1', $_EXTKEY.'_pi1'),'list_type');
\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addStaticFile(
	$_EXTKEY, "pi1/static/", "SmoothGallery");

// Flexforms
$TCA['tt_content']['types']['list']['subtypes_addlist'][$_EXTKEY.'_pi1']='pi_flexform';
if (\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::isLoaded('dam')) {
	\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue('rgsmoothgallery_pi1', 'FILE:EXT:rgsmoothgallery/flexformDAM_ds.xml');
} else {
	\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addPiFlexFormValue('rgsmoothgallery_pi1', 'FILE:EXT:rgsmoothgallery/flexform_ds.xml');
}

if (TYPO3_MODE=="BE") {
	$TBE_MODULES_EXT["xMOD_db_new_content_el"]["addElClasses"]["tx_rgsmoothgallery_pi1_wizicon"] =
		\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath($_EXTKEY) . 'pi1/class.tx_rgsmoothgallery_pi1_wizicon.php';
}

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::allowTableOnStandardPages('tx_rgsmoothgallery_image');

$TCA["tx_rgsmoothgallery_image"] = array (
    "ctrl" => array (
        'title'     => 'LLL:EXT:rgsmoothgallery/locallang_db.xml:tx_rgsmoothgallery_image',        
        'label'     => 'title',    
        'tstamp'    => 'tstamp',
        'crdate'    => 'crdate',
        'cruser_id' => 'cruser_id',
        'languageField'            => 'sys_language_uid',    
        'transOrigPointerField'    => 'l18n_parent',    
        'transOrigDiffSourceField' => 'l18n_diffsource',    
        'sortby' => 'sorting',    
        'delete' => 'deleted',    
        'enablecolumns' => array (        
            'disabled' => 'hidden',
        ),
        'dynamicConfigFile' => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extPath($_EXTKEY).'tca.php',
        'iconfile'          => \TYPO3\CMS\Core\Utility\ExtensionManagementUtility::extRelPath($_EXTKEY).'icon_tx_rgsmoothgallery_image.gif',
    ),
    "feInterface" => array (
        "fe_admin_fieldList" => "sys_language_uid, l18n_parent, l18n_diffsource, hidden, title, description, image",
    )
);


$tempColumns = Array (
    "tx_rgsmoothgallery_rgsg" => Array (        
        "exclude" => 1,        
        "label" => "LLL:EXT:rgsmoothgallery/locallang_db.xml:tt_content.tx_rgsmoothgallery_rgsg",        
        "config" => Array (
            "type" => "check",
        )
    ),
);

\TYPO3\CMS\Core\Utility\ExtensionManagementUtility::addTCAcolumns("tt_content",$tempColumns,1);

$GLOBALS['TCA']['tt_content']['palettes']['7']['showitem'] .= ',tx_rgsmoothgallery_rgsg';