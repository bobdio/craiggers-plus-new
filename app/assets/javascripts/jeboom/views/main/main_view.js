var MainView = BaseView.extend({
	el : "#root.page",

	render : function () {
		$('.metrics_container').show();
		$('#content #container').show();
		
		this.show();

		this.header = new MainHeaderView({model:this.model});
		this.header.render();

		this.searchBar = new MainSearchBarView({model: this.model});
		this.searchBar.render();
	},

	remove : function () {
		this.hide();

		this.header.remove();
		this.searchBar.remove();
	}
});