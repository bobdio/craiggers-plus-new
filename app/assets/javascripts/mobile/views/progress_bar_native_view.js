var ProgressBarNativeView = ProgressBarView.extend({
	render : function () {
		var progressContainer = $(document.createElement("div"));
		progressContainer.attr({style: "text-align: center"});
		var progressBar = $(document.createElement("progress"));
		progressBar.attr({max : 10});
		progressContainer.append(progressBar);
		this.$el.append(progressContainer);

		this.progressBar = this.$el.find('progress');

		this.hide();
	},

	clear : function () {
		this.counter = 0;
		this.progressBar.attr({value: 0});
	},

	_tickHandler : function () {
		if (this.counter >= this.ITEMS_COUNT) {
			this.clear();
			return;
		}

		this.progressBar.attr({value: this.counter});

		this.counter ++;
	}
});