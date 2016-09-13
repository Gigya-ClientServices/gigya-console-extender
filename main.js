var activeState = true;
var cssPath = chrome.extension.getURL('fixstyles.css');

function injectStyles() {
	$(document).ready(function() 
	{
		$('head').append($('<link>')
		    .attr("rel","stylesheet")
			.attr("type","text/css")
			.attr("href", cssPath)
		);
	});		
}

function removeStyles() {
	$(document).ready(function() {
		$("link[href='" + cssPath + "']").remove();
	});
}

function doStyleInjection() {
	//alert(cssPath);
	if (activeState) {
		// Check that it doesn't already exist and then inject style programatically
		injectStyles();
	} else {
		// Check that it does exist and if it does remove programmaitcally
		removeStyles();
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