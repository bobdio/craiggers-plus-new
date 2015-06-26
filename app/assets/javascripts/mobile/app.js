
var app = {

	PAGE_ANIMAITON_DURATION: 500,

	views : {},

	models : {},

	collections : {},

	initialize : function () {
		
		if (isPrivateMode()) {
			$("#unsupported_browser").modal("show");
			$("#unsupported_browser #continue_btn").click(function () {
				$("#unsupported_browser").modal("hide");
			});
		}

		if (isAndroid()) {
			$("#content").addClass('android');
		}
		this.history = [];

		this.models.searchModel = new SearchModel();
		this.models.userModel = new UserModel();

		app.models.allLocations = new LocationModel({
			code: "all",
			id: "all",
			isDataFull: true,
			lat: 0,
			locationName: "All Locations",
			long: 0,
			name: "All Locations"
		});

		app.collections.favorites = new FavoritesCollection();
		app.collections.categories = new CategoriesCollection();
		app.collections.postings = new PostingsCollection();

		app.models.syncModel = new SyncModel();

		app.collections.savedSearches = new SavedSearchesCollection(searchService.getSavedSearchesData());

		app.views.topMenu = new TopMenuView();
		app.views.topMenu.render();

		Backbone.history.start();

		syncService.sync(function () {
			syncService.syncLocationsData(function() {

			})
		});

		//sometimes top menu becomes misaligned after misfocusing of input field. 
		//it happens when after focusing of input field page scrolls to the top for centering of input field
		//after misfocusing of input field DOM elements with fixed position becomes misaligned.
		//for fixing this issue scroll position should be refreshed by calling window.scrollTo method after firing blur event of inout field.
		$("input[type=text], input:not([type])").live("blur", function () {
			setTimeout(function () {
				window.scrollTo(0,0);
			}, 100);
			
		})
	}
}

$(function() {
	app.initialize();
});