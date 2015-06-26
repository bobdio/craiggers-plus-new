var ProgressBarView = BaseView.extend({

	template : JST["mobile/templates/progress_bar"],

	ITEMS_COUNT : 10,

	render : function () {
		var progressBarContainer = $(document.createElement('div'));
		progressBarContainer.attr({id: "progress_bar"});
		this.$el.append(progressBarContainer);

		for (var i = 0; i < this.ITEMS_COUNT; i++) {
			var item = $(document.createElement("div"));
			item.addClass('progress_item');
			progressBarContainer.append(item);
		}

		this.hide();
	},

	show : function () {
		this.$el.show();

		this.start();
	},

	hide : function () {
		this.$el.hide();
		this.stop();
		this.clear();
	},

	start : function () {
		this.clear();
		this.interval = setInterval($.proxy(this._tickHandler, this), 200);
	},

	stop : function () {
		if (this.interval) {
			clearInterval(this.interval);
			this.interval = null;
		}
	},

	clear : function () {
		this.counter = 0;
		this.$el.find('.progress_item').removeClass('tick');
	},

	_setProgressBarValue : function (value) {
		var item = $(this.$el.find('.progress_item')[value]);
		if (item) {
			item.addClass('tick');
		}
	},

	_tickHandler : function () {
		if (this.counter >= this.ITEMS_COUNT) {
			this.clear();
			return;
		}

		this._setProgressBarValue(this.counter);

		this.counter ++;
	}
});