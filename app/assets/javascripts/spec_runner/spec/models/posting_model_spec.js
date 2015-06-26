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

	it("getSourcePhone() returns correct value", function () {
		expect(postingModelWithLocation.getSourcePhone()).toBe("");
		expect(postingModelWithAnnotations.getSourcePhone()).toBe("phone");
	});

	it("getSourceMapGoogle() returns correct value", function () {
		expect(postingModelWithLocation.getSourceMapGoogle()).toBe("");
		expect(postingModelWithAnnotations.getSourceMapGoogle()).toBe("source_map_google");
	});

	it("hasDetails() returns correct value", function () {
		expect(postingModelWithLocation.hasDetails()).toBeTruthy();
		expect(postingModelWithAnnotations.hasDetails()).toBeFalsy();
	});
});