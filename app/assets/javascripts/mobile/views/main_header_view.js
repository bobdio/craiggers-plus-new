var MainHeaderView = BaseView.extend({

	events : {
		"click .sign_up a" : "signUpHandler",
		"click .sign_in a" : "signInHandler",
		"click #sign_up_button" : "signUpButtonHandler"
	},

	template : JST["mobile/templates/main_header"],

	render : function () {

		this.user = app.models.userModel;

		var self = this;

		this.renderHeader();

		if (!app.models.userModel.get("signedin")) {
			app.models.userModel.once("change:signedin", $.proxy(this.refreshHeader, this));
		}
	},

	removeHeader : function () {
		$("#header").remove();
		app.models.userModel.off("change:signedin", $.proxy(this.refreshHeader, this));
	},

	refreshHeader : function () {
		if (this.user.get("signedin")) {
			$(".sign_buttons").hide();
			$(".signed_buttons").show();
			$(".header_buttons.signed_buttons .user_image img").attr({src: this.user.get("image")});
			$(".header_buttons.signed_buttons .user_image .name").html(this.user.get("displayName"));
		} else {
			$(".sign_buttons").show();
			$(".signed_buttons").hide();
		}
	},

	renderHeader : function() {

		var self = this;

		if (this.template) {
			this.$el.prepend(this.template({
				name: this.user.get("displayName"),
				image : this.user.get("image")
			}));
		}

		this.refreshHeader();
	},

	signedIn : function () {
		this.user = app.models.userModel;
		this.refreshHeader();
	}
});

_.extend(MainHeaderView.prototype, SignInModalsViewMixin.prototype);