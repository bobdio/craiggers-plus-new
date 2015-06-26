describe("SearchService", function () {
	it("created", function () {
		expect(searchService).toBeDefined();
	});

	describe("search()", function () {
		var ajaxParams1 = {};
		var ajax1 = function (params) {
			ajaxParams1 = params;
		}

		var ajaxParams2 = {};
		var ajax2 = function (params) {
			ajaxParams2 = params;
		}

		var cbData1;
		var cb1 = function (data) {
			cbData1 = data;
		};

		var cbData2;
		var cb2 = function (data) {
			cbData2 = data;
		}

		var searchModel1 = new SearchModel({
			location : {level: "state", code : "state_1"},
			page : 0,
			rpp : 10,
			safe_search : true,
			tier : 0,
			text : "search1",
			has_image : true,
			has_price : true,
			selected_categories : ["a", "b", "c"],
		    unselected_categories : ["d"],
		    selected_source : ["craig", "ebay"],
		    unselected_source : ["hmngs"],
		    selected_status : [1, 2],
		    unselected_status : [3],
		    min_price : "10",
		    max_price : "20",
		    annotations : {a: 1, b: "c"},
		    sort : "sort"
		});
		var searchModel2 = new SearchModel({
			has_image : false,
			page : 1,
			rpp : 20,
			safe_search : false,
			tier : 1,
			text : "search2",
			title_only : true,
			has_image : false,
			has_price : false,
			selected_categories : ["a", "b", "c"],
		    unselected_categories : [],
		    selected_source : ["craig", "ebay"],
		    unselected_source : [],
		    category_group : "aa",
		    selected_status : [1, 2],
		    unselected_status : [],
		    max_price : "10",
		    min_price : "20"
		});

		searchService.search(searchModel1, cb1, ajax1);
		searchService.search(searchModel2, cb2, ajax2);

		it("sends request to correct url", function () {
			expect(ajaxParams1.url).toBe("http://search.3taps.com" + '/?' + AUTH_TOKEN + "&location.state=state_1");
			expect(ajaxParams2.url).toBe("http://search.3taps.com" + '/?' + AUTH_TOKEN );
		});

		it("sends correct type param", function () {
			expect(ajaxParams1.type).toBe("get");
		});

		it("sends correct dataType param", function () {
			expect(ajaxParams1.dataType).toBe("json");
		});

		it("sends correct has_image param", function () {
			expect(ajaxParams1.data.has_image).toBeTruthy();
			expect(ajaxParams2.data.has_image).toBeFalsy();
		});

		it("sends correct page param", function () {
			expect(ajaxParams1.data.page).toBe(0);
			expect(ajaxParams2.data.page).toBe(1);
		});

		it("sends correct retvals param", function () {
			expect(ajaxParams1.data.retvals).toBe("heading,timestamp,category,location,images,source,price,currency,status,id,external_url,body,annotations");
			expect(ajaxParams2.data.retvals).toBe("heading,timestamp,category,location,images,source,price,currency,status,id,external_url,body,annotations");
		});

		it("sends correct rpp param", function () {
			expect(ajaxParams1.data.rpp).toBe(10);
			expect(ajaxParams2.data.rpp).toBe(20);
		});

		it("sends correct safe param", function () {
			expect(ajaxParams1.data.safe).toBe("yes");
			expect(ajaxParams2.data.safe).toBe("no");
		});

		it("sends correct tier param", function () {
			expect(ajaxParams1.data.tier).toBe(0);
			expect(ajaxParams2.data.tier).toBe(1);
		});

		it("sends correct has_image param", function () {
			expect(ajaxParams1.data.has_image).toBe(1);
			expect(ajaxParams2.data.has_image).toBeUndefined();
		});

		it("sends correct has_price param", function () {
			expect(ajaxParams1.data.has_price).toBe(1);
			expect(ajaxParams2.data.has_price).toBeUndefined();
		});

		it("sends correct text param", function () {
			expect(ajaxParams1.data.text).toBe("search1");
			expect(ajaxParams2.data.text).toBeUndefined();
		});

		it("sends correct heading param", function () {
			expect(ajaxParams1.data.heading).toBeUndefined();
			expect(ajaxParams2.data.heading).toBe("search2");
		});

		it("sends correct category param", function () {
			expect(ajaxParams1.data.category).toEqual("a|b|c");
			expect(ajaxParams2.data.category).toBeUndefined();
			expect(ajaxParams2.data.category_group).toBe("aa");
		});

		it("sends correct source param", function () {
			expect(ajaxParams1.data.source).toEqual("craig|ebay");
			expect(ajaxParams2.data.source).toBeUndefined();
		});

		it("sends correct status param", function () {
			expect(ajaxParams1.data.status).toEqual("1|2");
			expect(ajaxParams2.data.status).toBeUndefined();
		});

		it("sends correct price param", function () {
			expect(ajaxParams1.data.price).toEqual("10..20");
			expect(ajaxParams2.data.price).toBeUndefined();
		});

		it("sends correct sort param", function () {
			expect(ajaxParams1.data.sort).toEqual("sort");
			expect(ajaxParams2.data.sort).toBeUndefined();
		});

		it("sends correct annotations param", function () {
			expect(ajaxParams1.data.annotations).toEqual("{a:1 AND b:c}");
			expect(ajaxParams2.data.annotations).toBeUndefined();
		});

		it("handles response as expected", function () {
			expect(searchModel1.get("is_searching")).toBeTruthy();
			ajaxParams1.success({postings: [{id : 1}]});
			expect(searchModel1.get("is_searching")).toBeFalsy();
			expect(cbData1.get("postings").length).toBe(1);
			ajaxParams2.error();
			expect(searchModel2.get("is_searching")).toBeFalsy();
		});
	});

	describe("refreshPostingDetails()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}

		var posting = new PostingModel({postKey: "1", heading : ""});

		it("sends request to correct url", function () {
			searchService.refreshPostingDetails(posting, cb, 0, false, ajax);
			expect(ajaxParams.url).toBe("http://search.3taps.com" + '/?' + AUTH_TOKEN );
		});

		it("sends correct tier param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, false, ajax);
			expect(ajaxParams.data.tier).toBe(1);
		});

		it("sends correct rpp param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, false, ajax);
			expect(ajaxParams.data.rpp).toBe(1);
		});

		it("sends correct retvals param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, false, ajax);
			expect(ajaxParams.data.retvals).toBe("heading,timestamp,category,location,images,source,price,currency,status,id,external_url,body,annotations");
		});

		it("sends correct id param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, false, ajax);
			expect(ajaxParams.data.id).toBe("1");
			expect(ajaxParams.data.external_id).toBeUndefined();
		});

		it("sends correct external_id param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, true, ajax);
			expect(ajaxParams.data.id).toBeUndefined();
			expect(ajaxParams.data.external_id).toBe("1");
		});

		it("sends correct dataType param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, true, ajax);
			expect(ajaxParams.dataType).toBe("json");
		});

		it("sends correct type param", function () {
			searchService.refreshPostingDetails(posting, cb, 1, true, ajax);
			expect(ajaxParams.type).toBe("get");
		});

		it("handles response as expected", function () {
			expect(posting.get("heading")).toBe("");
			searchService.refreshPostingDetails(posting, cb, 1, true, ajax);
			ajaxParams.success({postings: [{heading: "posting1"}]});
			expect(posting.get("heading")).toBe("posting1");
			expect(cbData).toEqual(posting);
		});
	});

	describe("getPostingOlderVersions()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}

		var posting = new PostingModel({id: "1"});

		it("sends request to correct url", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.url).toBe("http://search.3taps.com" + '/?' + AUTH_TOKEN );
		});

		it("sends correct tier param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.data.tier).toBe(1);
		});

		it("sends correct rpp param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.data.rpp).toBe(1);
		});

		it("sends correct retvals param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.data.retvals).toBe("heading,timestamp,category,location,images,source,price,currency,status,id,external_url,body,annotations");
		});

		it("sends correct id param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.data.id).toBe("1");
		});

		it("sends correct dataType param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.dataType).toBe("json");
		});

		it("sends correct type param", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			expect(ajaxParams.type).toBe("get");
		});

		it("handles response as expected", function () {
			searchService.getPostingOlderVersions(posting, cb, ajax);
			ajaxParams.success({postings: [{id : 1}]});
			expect(cbData.get("postings").length).toBe(1);
		});
	});

	describe("getSearchCount()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}

		var searchModel = new SearchModel({
			location : {level: "state", code : "state_1"},
			has_image : true,
			has_price : true,
			text : "search1",
			selected_categories : ["a", "b", "c"],
		    unselected_categories : ["d"],
		    selected_source : ["craig", "ebay"],
		    unselected_source : ["hmngs"],
		    selected_status : [1, 2],
		    unselected_status : [3],
		    min_price : "10",
		    max_price : "20",
		    annotations : {a: 1, b: "c"},
		    sort : "sort"
		});

		searchService.getSearchCount(searchModel, "category", cb, 1, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("http://search.3taps.com/?pretty&" + AUTH_TOKEN + "&count=category&location.state=state_1");
		});

		it("sends correct dataType param", function () {
			expect(ajaxParams.dataType).toBe("json");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("get");
		});

		it("sends correct has_image param", function () {
			expect(ajaxParams.data.has_image).toBe(1);
		});

		it("sends correct tier param", function () {
			expect(ajaxParams.data.tier).toBe(1);
		});

		it("sends correct has_price param", function () {
			expect(ajaxParams.data.has_price).toBe(1);
		});

		it("sends correct text param", function () {
			expect(ajaxParams.data.text).toBe("search1");
		});

		it("doesn't send filter params", function () {
			expect(ajaxParams.data.source).toBeUndefined();
			expect(ajaxParams.data.category).toBeUndefined();
			expect(ajaxParams.data.status).toBeUndefined();
			expect(ajaxParams.data.price).toBeUndefined();
			expect(ajaxParams.data.annotations).toBeUndefined();
		});	

		it("handles response as expected", function () {
			ajaxParams.success({counts : [{term : "a"}, {term : "b"}]});
			expect(cbData.get("count_target")).toBe("category");
			expect(cbData.getMatchedTerms().length).toBe(2);
		});
	});
});