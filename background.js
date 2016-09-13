var gceState = true;
var urlPattern = "*://console.gigya.com/*";

function updateIcon() {
	if (gceState) {
		chrome.browserAction.setIcon({path:"gigya-logo.png"});
	}
	else {
		chrome.browserAction.setIcon({path:"gigya-logo-disabled.png"});
	}
}

// Update state and let all tabs with active state know
function toggleState() {
	gceState = !gceState;
	chrome.tabs.query({active: true, url: urlPattern}, function(tabs) {
		for (key in tabs) {
			chrome.tabs.sendMessage(tabs[key].id, {command: "updateState", state: gceState}, function(response) {
				//alert(response.status);
			});	
		}
	});
	updateIcon();
}

function onBGLoad() {
	// Add listener for icon click
	chrome.browserAction.onClicked.addListener(toggleState);
	// Add listener for retrieving state
	chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {
		    if (request.command == "getActiveState")
				sendResponse({state: gceState});
		}
	);
	updateIcon();
}

onBGLoad();
