var PageIsntReadyView = BaseView.extend({

	events : {
		"click #back_button a" : "goBack"
	},

	template : JST["mobile/templates/page_isnt_ready"]
});