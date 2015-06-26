describe("FavoritesCollection", function () {
	var favorites = new FavoritesCollection();
	var ajaxData;
	var ajax = function(data) {
		ajaxData = data;
	}
	var posting = new PostingModel({
			id : 1,
			source : "craig",
			path : "path1",
			heading : "heading1",
			price : "price1",
			timestamp : "timestamp1"
		});

	it("model equals to PostingModel", function () {
		expect(favorites.model).toEqual(PostingModel);
	});

	it("url() returns correct value", function () {
		expect(favorites.url()).toBe("user/favorites");
	});

	it("addToFavorites() sends correct data in ajax request", function () {
		var favorites = new FavoritesCollection();

		favorites.addToFavorites(posting, ajax);
		expect(ajaxData.url).toBe('/posting/favorite');
		expect(ajaxData.type).toBe('post');
		expect(ajaxData.data).toEqual({ posting : '{"postKey":1,"source":"craig","id":1,"extra":{"path":"path1","heading":"heading1","price":"price1","utc":"timestamp1"}}' });
	});

	it("addToFavorites() adds posting into collection with correct state and triggers event", function () {
		var favorites = new FavoritesCollection();
		spyOn(favorites, "trigger");
		favorites.addToFavorites(posting, ajax);
		expect(favorites.trigger).toHaveBeenCalled();
		expect(posting.get("unfavorite")).toBeFalsy();
		expect(favorites.get(1)).toEqual(posting);
		favorites.addToFavorites(posting, ajax);
		expect(favorites.trigger.calls.length).toEqual(2);
	});

	it("removeFromFavorites() sends correct data in ajax request", function () {
		var favorites = new FavoritesCollection();

		favorites.removeFromFavorites(posting, ajax);
		expect(ajaxData.url).toBe('/posting/unfavorite');
		expect(ajaxData.type).toBe('post');
		expect(ajaxData.data).toEqual({ posting : '{"postKey":1,"source":"craig","id":1,"extra":{"path":"path1","heading":"heading1","price":"price1","utc":"timestamp1"}}' });
	});

	it("removeFromFavorites() sets correct state of postins and triggers event", function () {
		var favorites = new FavoritesCollection();
		favorites.addToFavorites(posting, ajax);

		spyOn(favorites, "trigger");
		favorites.removeFromFavorites(posting, ajax);
		expect(favorites.trigger).toHaveBeenCalled();
		expect(posting.get("unfavorite")).toBeTruthy();
	});
});