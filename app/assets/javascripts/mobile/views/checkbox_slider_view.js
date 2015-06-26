var CheckboxSliderView = BaseView.extend({
	render : function (el, isDisabled) {
		this.$el = $(el);
		var self = this;
		var swipeThreshold = 10;
		this.isSliderActive = true;
		this.isDisabled = isDisabled;

		// bind slider events
		this.bindSwipeLeft(el, function(event) {
			if (self.isDisabled) {
				return;
			}
			self.swipLeftHandler();
		}, swipeThreshold);

		this.bindSwipeRight(el, function(event) {
			if (self.isDisabled) {
				return;
			}
			self.swipRightHandler();
		}, swipeThreshold);

		this.$el.click(function(event) {
			if (self.isDisabled) {
				return;
			}
			if (self.isSliderActive) {
				$(event.target).toggleClass("on");
				self.sliderChanged();
			}
		});
	},

	activate : function () {
		this.isDisabled = false;
	},

	deactivate : function () {
		this.isDisabled = true;
	},

	setIsChecked : function (value) {
		value ? this.$el.addClass("on") : this.$el.removeClass("on");
	},

	getIsChecked : function () {
		return this.$el.hasClass("on");
	},

	sliderChanged : function () {
		this.isSliderActive = false;
		var self = this;
		setTimeout(function() {
			self.isSliderActive = true;
		}, 1000);
	},

	swipLeftHandler : function () {
		if (this.isSliderActive) {
			//this.$el.removeClass("on");	
			this.setIsChecked(false);
			this.sliderChanged();
		}
	},

	swipRightHandler : function () {
		if (this.isSliderActive) {
			this.setIsChecked(true);
			this.sliderChanged();
		}
	}
});