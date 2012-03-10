/**
 * PGDefinition plugin for PhoneGap
 * 
 * @constructor
 */
function PGDefinition(){ }

/**
 * Look up the word
 *
 * @param {String} text The word to look up
 */
PGDefinition.prototype.showDefinition = function(text) {
	PhoneGap.exec("PGDefinition.showDefinition", text);
}

/**
 * Register the plugin with PhoneGap
 */
PhoneGap.addConstructor(function() {
	if(!window.plugins) window.plugins = {};
	window.plugins.definition = new PGDefinition();
});