var ProgressBarCircleView = ProgressBarView.extend({
	render : function () {
		var container = $(document.createElement("div"));
			container.attr({style: "text-align:center"});
		var progressBar = $(document.createElement("div"));
			progressBar.attr({class : "circle_progress_bar_black"});
		container.append(progressBar);
		this.$el.append(container);
		this.hide();
	}
})