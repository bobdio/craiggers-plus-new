var MainHeaderView = BaseView.extend({

	template : JST['main_header'],

	render : function () {
		this.$el.prepend(this.template());
		this.container = $("#navbar");
		this.container.show();

		this.signinout = new SigninOutView();
		this.signinout.render(this.container);

		this.sourcesMetrics = new SourcesMetricsView({model:this.model});
		this.sourcesMetrics.render();
	},

	remove : function () {
		this.container.remove();
		this.signinout.remove();
		this.sourcesMetrics.remove();
	}
});