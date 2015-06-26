var DialogView = BaseView.extend({

	el : "#popup-dialog .wrapper .content",

	render : function (options) {
		BaseView.prototype.render.call(this);
		$("#popup-dialog").show();
		this.$(".popup-close").show();
		this.init(options);
	},

	init : function (options) {

	},

	remove : function () {
		this.$el.empty();
		$("#popup-dialog").hide();
		this.undelegateEvents(this.events);
	}
})