function copyElementText(element, subElementName) {
  var el = element.querySelector(subElementName);
	var range = document.createRange();
	range.selectNodeContents(el);
	window.getSelection().addRange(range);
	var successful = document.execCommand('copy');
  window.getSelection().removeAllRanges();
}

function showSecretPopup(element) {
  $(element).parent().parent().find('.gig-tooltip').show();
}

function hideSecretPopup(element) {
  $(element).parent().parent().hide();
}
