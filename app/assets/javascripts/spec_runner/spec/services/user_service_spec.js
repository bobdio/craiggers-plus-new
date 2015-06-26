describe("UserService", function () {
    window.app  = window.app || {};
    window.app.models = window.app.models || {};
    window.app.models.userModel = new UserModel({email: "email@mail.com", username: "user1"});

	window.app.collections = window.app.collections || {};
	window.app.collections.savedSearches = new SavedSearchesCollection();

	it("created", function () {
		expect(userService).toBeDefined();
	});

	describe("verifyEmail()", function () {	
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();

		userService.verifyEmail(userModel, 1234, cb, function() {}, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("user/verify_email");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("GET");
		});

		it("sends correct data param", function () {
			expect(ajaxParams.data).toBe("utf8=%E2%9C%93&pin=1234");
		});

		it("handles response as expected", function () {
			ajaxParams.success({});
			expect(app.models.userModel.get("email")).toBe("email@mail.com");
			ajaxParams.success({email : "email@mail1.com"});
			expect(app.models.userModel.get("email")).toBe("email@mail1.com");
		});
	});

	describe("updateUsername()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();

		userService.updateUsername(userModel, "name1", cb, function() {}, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("user/update_username");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("GET");
		});

		it("sends correct data param", function () {
			expect(ajaxParams.data, "utf8=%E2%9C%93&username=name1");
		});

		it("handles response as expected", function () {
			ajaxParams.success({username : "name1"});
			expect(app.models.userModel.get("username")).toBe("name1");
		});
	});

	describe("updateEmail()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();

		userService.updateEmail(userModel, "email1@mail.com", cb, function() {}, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("user/update_email");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("GET");
		});

		it("sends correct data param", function () {
			expect(ajaxParams.data, "utf8=%E2%9C%93&email=email1@mail.com");
		});

		it("handles response as expected", function () {
			ajaxParams.success({email : "email1@mail.com"});
			expect(app.models.userModel.get("email")).toBe("email1@mail.com");
		});
	});

	describe("signUp()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();

		userService.signUp(userModel, cb, function() {}, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("user/sign_up");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("POST");
		});

		it("sends correct data param", function () {
			expect(ajaxParams.data, "utf8=%E2%9C%93&authenticity_token=&name=&password=&email=&contact_me=on");
		});

		it("handles response as expected", function () {
			ajaxParams.success({username : "username1", email : "email1@mail.com"});
			expect(app.models.userModel.get("email")).toBe("email1@mail.com");
			expect(app.models.userModel.get("username")).toBe("username1");
		});
	});

	describe("signIn()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();
		userModel.set({username:"user1", email: "email@mail.com"});

		userService.signIn(userModel, cb, function() {}, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("/user/sign_in");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("POST");
		});

		it("sends correct data param", function () {
			expect(ajaxParams.data).toBe("utf8=%E2%9C%93&authenticity_token=&name=user1&password=");
		});

		it("handles response as expected", function () {
			ajaxParams.success({username : "username1", email : "email1@mail.com"});
			expect(app.models.userModel.get("email")).toBe("email1@mail.com");
			expect(app.models.userModel.get("username")).toBe("username1");
			expect(app.collections.savedSearches.getIsSynced()).toBeFalsy();
		});
	});

	describe("signedIn()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function (data) {
			cbData = data;
		}
		var userModel = new UserModel();
		var token = (new Date().getTime());
		userService.signedIn(cb, function() {}, ajax, token);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("/user/signedin?" + token);
		});

		it("handles response as expected", function () {
			ajaxParams.success({username : "username1", email : "email1@mail.com"});
			expect(app.models.userModel.get("email")).toBe("email1@mail.com");
			expect(app.models.userModel.get("username")).toBe("username1");
			expect(app.collections.savedSearches.getIsSynced()).toBeFalsy();
		});
	});

	describe("createPosting()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function () {
			cbData = {success: true};
		}

		var posting = new PostingModel({
			heading: "heading1",
			body: "body1",
			location: {code: "code1"},
			currency: "usd",
			price: "123",
			category: "aaa",
			images : [{full: "image1", thumbnails: "thumb1"}, {full: "image2", thumbnail: "thumb2"}],
			annotations : {
				phone: "123",
				source_account : "account"
			}
		});

		userService.createPosting(posting, cb, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("/postings");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("POST");
		});

		it("sends correct heading param", function () {
			expect(ajaxParams.data.heading).toBe("heading1");
		});

		it("sends correct body param", function () {
			expect(ajaxParams.data.body).toBe("body1");
		});

		it("sends correct location param", function () {
			expect(ajaxParams.data.location).toBe("code1");
		});

		it("sends correct currency param", function () {
			expect(ajaxParams.data.currency).toBe("usd");
		});

		it("sends correct price param", function () {
			expect(ajaxParams.data.price).toBe("123");
		});

		it("sends correct category param", function () {
			expect(ajaxParams.data.category).toBe("aaa");
		});

		it("sends correct images param", function () {
			expect(ajaxParams.data.images).toBe('[{"full":"image1","thumbnails":"thumb1"},{"full":"image2","thumbnail":"thumb2"}]');
		});

		it("sends correct annotations", function () {
			expect(ajaxParams.data.annotations).toEqual({
				phone: "123",
				source_account : "account"
			});
		});

		it("handles response as expected", function () {
			ajaxParams.success({success : false});
			
			expect(cbData).toBeUndefined();

			ajaxParams.success({success : true});

			expect(cbData).toBeDefined();
		});
	});

	describe("updatePosting()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function () {
			cbData = {success: true};
		}

		var posting = new PostingModel({
			id : "12",
			heading: "heading1",
			body: "body1",
			location: {code: "code1"},
			currency: "usd",
			price: "123",
			//annotations[phone]:123
			category: "aaa",
			images : [{full: "image1", thumbnails: "thumb1"}, {full: "image2", thumbnail: "thumb2"}],
			annotations : {
				phone: "123",
				source_account : "account"
			}
		});

		userService.updatePosting(posting, cb, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("/postings/12/update");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("POST");
		});

		it("sends correct heading param", function () {
			expect(ajaxParams.data.heading).toBe("heading1");
		});

		it("sends correct body param", function () {
			expect(ajaxParams.data.body).toBe("body1");
		});

		it("sends correct location param", function () {
			expect(ajaxParams.data.location).toBe("code1");
		});

		it("sends correct currency param", function () {
			expect(ajaxParams.data.currency).toBe("usd");
		});

		it("sends correct price param", function () {
			expect(ajaxParams.data.price).toBe("123");
		});

		it("sends correct category param", function () {
			expect(ajaxParams.data.category).toBe("aaa");
		});

		it("sends correct images param", function () {
			expect(ajaxParams.data.images).toBe('[{"full":"image1","thumbnails":"thumb1"},{"full":"image2","thumbnail":"thumb2"}]');
		});

		it("sends correct annotations", function () {
			expect(ajaxParams.data.annotations).toEqual({
				phone: "123",
				source_account : "account"
			});
		});

		it("handles response as expected", function () {
			ajaxParams.success({success : false});
			
			expect(cbData).toBeUndefined();

			ajaxParams.success({success : true});

			expect(cbData).toBeDefined();
		});
	});

	describe("deletePosting()", function () {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function () {
			cbData = {success: true};
		}

		var posting = new PostingModel({
			id : "12"
		});

		userService.deletePosting(posting, cb, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("/postings/12/delete");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("POST");
		});
	});

	describe("getUserPostings()", function() {
		var ajaxParams = {};
		var ajax = function (params) {
			ajaxParams = params;
		}

		var cbData;
		var cb = function () {
			cbData = {success: true};
		}

		userService.getUserPostings(cb, ajax);

		it("sends request to correct url", function () {
			expect(ajaxParams.url).toBe("postings/by_user");
		});

		it("sends correct type param", function () {
			expect(ajaxParams.type).toBe("GET");
		});

		it("sends correct name param", function () {
			expect(ajaxParams.data.name).toBe("user1");
		});
	});
});