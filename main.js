var activeState = true;
var cssPath = chrome.extension.getURL('fixstyles.css');
var utilsPath = chrome.extension.getURL('utils.js');
var bootstrapPath = chrome.extension.getURL('bootstrap.min.css');
var copyIcon = chrome.extension.getURL('images/copy-icon.png');
var parentIcon = chrome.extension.getURL('images/node-select-parent-icon.png');
var childIcon = chrome.extension.getURL('images/node-select-child-icon.png');
var ssoIcon = chrome.extension.getURL('images/sso-icon.png');

var originalFooter = '';
var originalSitesHolder = '';
var originalSettings = '';

var apiKeys = [];

function injectStyles() {
	$(document).ready(function()
	{
		apiKeys = [];
		// Copy Existing Site Layout to restore if deactivated
		originalFooter = $('.grey_footer.rounded_bottom').html();
		originalSitesHolder = $('.sites_holder').html();
		originalSettings = $('.settings').html();

		// Inject Style and Utility Javascrip
		$('head')
		  .append($('<link>')
		  	.attr("rel","stylesheet")
				.attr("type","text/css")
				.attr("href", cssPath)
			)
			.append($('<link>')
			  .attr("rel","stylesheet")
				.attr("type","text/css")
				.attr("href", bootstrapPath)
			)
			.append($('<script>')
				.attr("src", utilsPath)
		  );

		// Add User Key Copy
		$('.user_keys .column_value').each(function(index) {
			var t = $(this).text();
			$(this).html(createCopyText(t));
		});

		// Fix Broken Footer
		$('.commonPage').removeClass('float_left');

		// Fix Broken settings (misbehaving floats)
		$('.settings').html('<div class="row">' + originalSettings + '</div>');

		// Parter ID and Secret
		$('.content_dashboard > h1').text($('.content_dashboard > h1').text().trim());
		var pID = $('.grey_footer.rounded_bottom > span:nth-child(1)').text().slice(-7);
		var pSecret = $('.secret_key').attr('tipvalue');
		$('.holder_button_site').prepend('<div id="top-secret" style="display: table-cell; margin-top: auto; margin-bottom: auto; float: left; height: 100%;">PartnerID: ' + pID + ' <span class="seperator">|</span> <a href="javascript:void(0);" onClick="showSecretPopup(this);">Show Secret Key</a></div>' + createSecretPopupDiv(pSecret));
		$('.grey_footer.rounded_bottom').html('');

		// Sites
		$('.site_row').each(function(index) {
			var el = $(this);
			var isParent = (el.find('.group_master').length?true:false);
			var isChild = (el.find('.group_member').length?true:false);
			var isSSO = (el.find('.group_sso').length?true:false);
			var rawUrl =  el.find('.url').text().trim();
			var rgx = /(.*?)\W*\((\d*)\)/g;
			var matches = rgx.exec(rawUrl);
			var siteUrl = null;
			var sID = null;
			if (matches !== null) {
				sID = matches[2];
				siteUrl = matches[1];
			}
			var row = {
				apiKey: el.find('.api_key_holder').text().trim(),
				siteId: sID,
				url: siteUrl,
				desc: el.find('.custom_short_name').text().trim(),
				dc: el.find('.data_center').text().trim().slice(-2),
				parent: isParent,
				child: isChild,
				sso: isSSO
			};
			//console.log(row);
			apiKeys[index] = row;
		});
		$('.sites_holder').html(createSitesGrid());

		$('.walkme-custom-balloon-outer-div').hide();
	});
}

function removeStyles() {
	$(document).ready(function() {
		$("link[href='" + cssPath + "']").remove();
		$("link[href='" + bootstrapPath + "']").remove();
		$("script[src='" + utilsPath + "']").remove();

		$('.user_keys .column_value').each(function(index) {
			var t = $(this).find('.value').text();
			$(this).html(t);
		});
		$('.grey_footer.rounded_bottom').html(originalFooter);
		$('.sites_holder').html(originalSitesHolder);
		$('.settings').html(originalSettings);
		$('#top-secret').remove();
		$('#top-tooltip').remove();
	});
}

function createCopyText(text) {
	return '<a href="javascript:void(0);" onClick="copyElementText(this, \'.value\')" title="Click to Copy"><img src="' + copyIcon + '" height="16" width="16" tooltip="Copy"/><span class="value">' + text + '</span></a>';
}

function createSecretPopupDiv(secret) {
  var secretDiv = '<div id="top-tooltip" class="gig-tooltip" style="position: absolute; z-index: 10;top: 190px; left: 225px; display: none;">' +
	             '<div class="gig-tooltip-tip"></div>' +
							 '<div class="gig-tooltip-holder" style="border-radius: 5px;">' +
							 '<input type="text" readonly="readonly" value="' + secret + '" style="" onclick="this.focus(); this.select();">' +
							 '<div class="gig-tooltip-btn" onClick="hideSecretPopup(this);"></div></div></div>';
	return secretDiv
}

function createSitesGrid() {
	var grid =
		'<div class="blue_headline rounded_top row" style="border-top-left-radius: 5px; border-top-right-radius: 5px;">' +
		'<div class="col-md-3">Site</div><div class="col-md-1" style="text-align: center;">Datacenter</div><div class="col-md-6">APIKey</div><div class="col-md-2" style="text-align: right;">Site ID</div>' +
		'</div>' +
		'<div class="sites_list row">';
	for (var i = 0, len = apiKeys.length; i < len; i++) {
		var row = apiKeys[i];
		var rowText =
			'<div class="site-row row" style="'+ ((i%2)==0?'background:#f0f6fb;':'') + '">' +
			'<div class="outer col-md-12">' +
			'<div class="site-inner-row row">' +
			'<div class="site-row-url col-md-3">' + buildSiteIcons(row) + '<a href="' + buildConsoleSiteActionLink(row.apiKey,'settings') + '">' + row.url + '</a></div>' +
			'<div class="site-row-dc col-md-1">' + row.dc + '</div>' +
			'<div class="site-row-apiKey col-md-6">' + createCopyText(row.apiKey) + '</div>' +
			'<div class="site-row-site-id col-md-2">' + row.siteId + '</div>' +
			'</div>' +
			'<div class="site-inner-row row">' +
			'<div class="site-row-desc col-md-4">' + row.desc + '</div>' +
			'<div class="site-row-actions col-md-8">' + buildSiteActions(row.apiKey) + '</div>' +
			'</div>' +
			'</div>' +
			'</div>';
		grid = grid + rowText;
  }
	// Add a hidden dummy row so the console doesn't pop up the "Add Site" toast
	grid = grid + '<div class="site_row" style="display:none;"></div></div>' +
								'<div class="grey_footer rounded_bottom row" style="border-bottom-left-radius: 5px; border-bottom-right-radius: 5px;"></div>';
	return grid;
}

function buildSiteIcons(row) {
	var icons = '';
	if (row) {
		if (row.parent) {
			icons = icons + '<img src="' + parentIcon + '" width="16" height="16" title="The site group master" style="margin-left: 3px; margin-right: 3px;"/>';
		}
		if (row.child) {
			icons = icons + '<img src="' + childIcon + '" width="16" height="16" title="A member of the site group" style="margin-left: 3px; margin-right: 3px;"/>';
		}
		if (row.sso) {
			icons = icons + '<img src="' + ssoIcon + '" width="16" height="16" title="Single Sign-on enabled" style="margin-left: 3px; margin-right: 3px;"/>';
		}
	}
	return icons;
}

function buildSiteActions(apiKey) {
	var actions = '' +
		'<a class="icon_reports" style="padding:0 4px 0 18px;" href="' + buildConsoleSiteActionLink(apiKey, 'reports') + '">Reports</a>' +
		'<a class="icon_export" style="padding:0 4px 0 18px;" href="' + buildConsoleSiteActionLink(apiKey, 'exportUsers') + '">Export Users</a>';
	return actions;
}

function buildConsoleSiteActionLink(apiKey,action) {
	return ('/Site/partners/Dashboard.aspx/SiteActions?siteAction=' + action + '&apiKey=' + apiKey);
}

function doStyleInjection() {
	var loc = window.location;
	if (loc.href === 'https://console.gigya.com/Site/partners/dashboard.aspx' || loc.href === 'https://console.gigya.com/Site/account.aspx/Settings') {
		if (activeState) {
			// Check that it doesn't already exist and then inject style programatically
			injectStyles();
		} else {
			// Check that it does exist and if it does remove programmaitcally
			removeStyles();
		}
	}
}

function startExt() {
	// Listen for state updates
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
		    if (request.command == "updateState") {
		    	activeState = request.state;
	    		doStyleInjection();
		    	sendResponse({ status: "ok" });
		    }
		}
	);
	getActiveState();
	doStyleInjection();
}

function getActiveState() {
	chrome.runtime.sendMessage({command: "getActiveState"}, function(response) {
		activeState = response.state;
	});
}

startExt();
