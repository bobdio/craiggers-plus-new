/**
* This mobule provides additional methods for controlling focusing of input fields
*/
var FocusedInputFieldUtils = (function () {
	var module = function () {};
	//private property
	var focused = false;

	_.extend(module.prototype, {
		/**
		* Set true value of focused property 
		*/
		focus : function () {
			focused = true;

			if (this.blurTimer) {
				clearTimeout(this.blurTimer);
			}
		},

		/**
		* Set false value of focused property after delay
		*/
		blur : function () {
			var self = this;
			this.blurTimer = setTimeout(function() {
				focused = false;
			}, 100);
		},

		/**
		* Returns focused value
		*/
		isFocused : function () {
			return focused;
		},

		registerInputField : function (inputField, clearButton) {
			this.inputField = inputField;
			this.clearButton = clearButton;
			var self = this;

			this.inputField.on("focus", function (event) {
				self.focus();
			});

			this.inputField.on("blur", function (event) {
				self.blur();
			});

			this.clearButton.on("click", function (event) {
				self.inputField.val("");
		
				if (self.isFocused()) {
					self.inputField.focus();
				}
			})
		}
	});

	return module;
}());
