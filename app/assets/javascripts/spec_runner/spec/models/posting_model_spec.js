describe("PostingModel", function () {
	var postingModelWithLocation = new PostingModel({
		location : {
			level: "state",
			name: "stateA", 
			code: "state_1"
		},
		timestamp : "123"
	});
	var postingModelWithAnnotations = new PostingModel({
		annotations: {
			source_account : "source_account",
			phone : "phone",
			source_map_google : "source_map_google"
		}
	});

	it("location value is correct after initializing", function () {
		expect(postingModelWithLocation.get("location").getLocationName()).toBe("stateA");
		expect(postingModelWithAnnotations.get("location").getLocationName()).toBe("");
	});

	it("getSourceAccount() returns correct value", function () {
		expect(postingModelWithLocation.getSourceAccount()).toBe("");
		expect(postingModelWithAnnotations.getSourceAccount()).toBe("source_account");
	});

	it("setSourceAccount() sets value of source_account", function () {
		var posting = new PostingModel();
		posting.setSourceAccount("account");
		expect(posting.getSourceAccount()).toBe("account");
	});

	it("getSourcePhone() returns correct value", function () {
		expect(postingModelWithLocation.getSourcePhone()).toBe("");
		expect(postingModelWithAnnotations.getSourcePhone()).toBe("phone");
	});

	it("setSourcePhone() sets value of phone", function() {
		var posting = new PostingModel();
		posting.setSourcePhone("123");
		expect(posting.getSourcePhone()).toBe("123");
	})

	it("getSourceMapGoogle() returns correct value", function () {
		expect(postingModelWithLocation.getSourceMapGoogle()).toBe("");
		expect(postingModelWithAnnotations.getSourceMapGoogle()).toBe("source_map_google");
	});

	it("hasDetails() returns correct value", function () {
		expect(postingModelWithLocation.hasDetails()).toBeTruthy();
		expect(postingModelWithAnnotations.hasDetails()).toBeFalsy();
	});

	it("validatePostingCreationData() returns object of incorrect fields", function () {
		var posting = new PostingModel();
		expect(_.size(posting.validatePostingCreationData())).toBe(4);
		posting.set("heading", "heading1");
		expect(_.size(posting.validatePostingCreationData())).toBe(3);
		posting.set("location", new LocationModel({code: "code1"}));
		expect(_.size(posting.validatePostingCreationData())).toBe(2);
		posting.set("category", "category1");
		expect(_.size(posting.validatePostingCreationData())).toBe(1);
		posting.set("body", "body1");
		expect(_.size(posting.validatePostingCreationData())).toBe(0);
	});

	it("addImage() adds image data into images array", function () {
		var posting = new PostingModel();
		expect(posting.get("images").length).toBe(0);
		posting.addImage({full: "image"});
		expect(posting.get("images").length).toBe(1);
	});

	it("removeImage() removes image data from images array", function () {
		var posting1 = new PostingModel({images: []});
		posting1.addImage({full: "image1"});
		posting1.addImage({full: "image2"});
		posting1.removeImage("image2");
		expect(posting1.get("images").length).toBe(1);
		expect(posting1.get("images")[0].full).toBe("image1");
		posting1.removeImage("image1");
		expect(posting1.get("images").length).toBe(0);
	});
});