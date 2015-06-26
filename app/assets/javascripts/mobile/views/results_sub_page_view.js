/**
* This module contains methods for sub pages of results page
*/

var ResultsSubPageView = BaseView.extend({

	show : function (options) {
		this.animationOptions = options;
		var self = this;

		this.animationElement.show();

		this.animationElement.transition({
			x: "0",
			duration: app.PAGE_ANIMAITON_DURATION,
			complete : function () {
				window.scrollTo(0,0);
				$("#results").hide();
				self.showAnimationFinished();
				self.addFixedHeader(self.animationElement)
			}
		});
	},

	addFixedHeader : function (target) {
		//for adding fixed header style all transform styles should be removed from element
		target.attr("style", "display:block; left: 0px; position: absolute");
		target.addClass("fixed_header");
	},

	removeFixedHeader : function (target) {
		target.attr("style", "display: block;-webkit-transform: translate(0px, 0px)");
		target.removeClass("fixed_header");
	},

	hideAnimationFinished : function () {
		this.remove();
		this.animationOptions.close();
	}
});