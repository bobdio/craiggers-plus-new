var BaseView = Backbone.View.extend({
	el : "#content",

	remove : function () {
		this.undelegateEvents(this.events);
	},

	render : function () {
		this.$el.append(this.template());
		//this.delegateEvents(this.events);
	},

	getScroller : function (element, options) {
		var scroller = new iScroll(element, options);
		return scroller;
	},

	hide : function () {
		if (this.elements) {
			this.elements.hide();
		}
	},

	show : function () {
		if (this.elements) {
			this.elements.show();
		}
	},

	goBack : function (event) {
		event.stopPropagation();
		router.back();
	},

	/**
	* Factory method for progress bar creation
	*/
	getProgressBar : function (elSelector) {
		/*var supportsProgress = (document.createElement('progress').max !== undefined);
		if (supportsProgress) {
			return new ProgressBarNativeView({el: elSelector});
			
		}

		return new ProgressBarView({el: elSelector});*/

		return new ProgressBarCircleView({el: elSelector});
	},

	getCheckboxSlider : function (elSelector, isDisabled) {
		var checkbox = new CheckboxSliderView();
		checkbox.render(elSelector, isDisabled);

		return checkbox;
	},

	appendSelectOption : function (holder, id, name) {
		var optionElement = $(document.createElement("option"));
			optionElement.attr("value", id);
			optionElement.html(name);
			holder.append(optionElement);
	},

	bindSwipeLeft : function (selector, cb, threshold) {
		threshold = threshold || this._getSwipeHorizontalThreshold();

		Hammer(selector).on("dragleft", function(event) {

			if (Math.abs(event.gesture.deltaX) >= threshold) {
				cb(event);
			}
			
		});
	},

	bindSwipeRight : function (selector, cb, threshold) {
		threshold = threshold || this._getSwipeHorizontalThreshold();

		Hammer(selector).on("dragright", function(event) {

			if (Math.abs(event.gesture.deltaX) >= threshold) {
				cb(event);
			}
		    
		});
	},

	bindSwipeUp : function (selector, cb) {
		var self = this;
		Hammer(selector).on("dragup", function(event) {

			if (Math.abs(event.gesture.deltaX) < self._getSwipeVerticalThreshold()) {
				cb(event);
			}
		});
	},

	bindSwipeDown : function (selector, cb) {
		var self = this;
		Hammer(selector).on("dragdown", function(event) {

			if (Math.abs(event.gesture.deltaX) < self._getSwipeVerticalThreshold()) {
				cb(event);
			}
		});
	},

	_getSwipeVerticalThreshold : function () {
		if (isAndroid()) {
			return 20;
		}

		return 50;
	},

	_getSwipeHorizontalThreshold : function () {
		if (isAndroid()) {
			return 20;
		}

		return 150;
	}
});