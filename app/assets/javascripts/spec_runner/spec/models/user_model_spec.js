describe("UserModel", function () {
	it("signedin value is false by default", function () {
		var userModel = new UserModel();
		expect(userModel.get("signedin")).toBeFalsy();
	});

	it("terms value is false by default", function () {
		var userModel = new UserModel();
		expect(userModel.get("terms")).toBeFalsy();
	});

	it("validateEmail() returns true only in case of valid email", function () {
		var userModel = new UserModel();
		expect(userModel.validateEmail()).toBeFalsy();
		expect(userModel.validateEmail("email")).toBeFalsy();
		expect(userModel.validateEmail("email@")).toBeFalsy();
		expect(userModel.validateEmail("email@mail.com")).toBeTruthy();
	});

	it("validateUserName() returns array with error messages in case of invalid username", function () {
		var userModel = new UserModel();
		expect(userModel.validateUserName("").length).toBe(1);
		expect(userModel.validateUserName("asd").length).toBe(0);
		expect(userModel.validateUserName("a a a").length).toBe(1);
		expect(userModel.validateUserName("a_a_a").length).toBe(0);
		expect(userModel.validateUserName("a a a bbbbbbbbbbbbbbbbb").length).toBe(2);
	});

	it("validateSignUp() returns array with error messages in case of incorrect user data", function () {
		var userModel = new UserModel();
		expect(userModel.validateSignUp().length).toBe(4);
		userModel.set("terms", true);
		expect(userModel.validateSignUp().length).toBe(3);
		userModel.set("username", "asd");
		expect(userModel.validateSignUp().length).toBe(2);
		userModel.set("password", "123");
		expect(userModel.validateSignUp().length).toBe(2);
		userModel.set("password", "123456");
		expect(userModel.validateSignUp().length).toBe(1);
		userModel.set("email", "email@mail.com");
		expect(userModel.validateSignUp().length).toBe(0);
	});

	it("serializeUpdateEmail() returns expected string", function () {
		var userModel = new UserModel();
		expect(userModel.serializeUpdateEmail("email@mail.com")).toBe("utf8=%E2%9C%93&email=email@mail.com");
	});

	it("serializeUpdateUsername() returns expected string", function () {
		var userModel = new UserModel();
		expect(userModel.serializeUpdateUsername("aaa")).toBe("utf8=%E2%9C%93&username=aaa");
	});

	it("serializeVerifyEmail() returns expected string", function () {
		var userModel = new UserModel();
		expect(userModel.serializeVerifyEmail("123")).toBe("utf8=%E2%9C%93&pin=123");
	});

	it("serializeSignUp() returns expected string", function () {
		var userModel = new UserModel({
			contact_me : true,
			authenticity_token : "123",
			username : "aaa",
			password : "123456",
			email : "email@mail.com"
		});

		expect(userModel.serializeSignUp()).toBe("utf8=%E2%9C%93&authenticity_token=123&name=aaa&password=123456&email=email@mail.com&contact_me=on");
	});

	it("serializeSignIn() returns expected string", function () {
		var userModel = new UserModel({
			authenticity_token : "123",
			username : "aaa",
			password : "123456"
		});

		expect(userModel.serializeSignIn()).toBe("utf8=%E2%9C%93&authenticity_token=123&name=aaa&password=123456");
	});
});