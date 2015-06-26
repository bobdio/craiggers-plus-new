/**
* spec in spec_runner/spec/models/user_model_spec
*/

var UserModel = BaseModel.extend({
	defaults : {
		username : "",
		terms : false,
		password : "",
		email : "",
		authenticity_token : "",
		contact_me : true,
		conversations: null,
		displayName: "",
		id: "",
		image: "",
		is_admin: false,
		photo: "",
		profile: null,
		email: "",
		server_salt: "",
		session_token: "",
		settings: null,
		signedin: false,
		user: "",
		userID: "",
		location : ""
	},

	validateEmail : function (str) {
		var reg = /^([a-zA-Z0-9_.-])+@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
		return reg.test(str);
	},

	isEmailVerified : function () {
		var email = this.get('email');
		return ((!_.isUndefined(email)) && (email !== "") && (!_.isNull(email)));
	},

	validateSignUp : function () {
		var errorsText = [];

		if ( !this.get('terms') ) errorsText.push("Please confirm that you agree with our terms of service");
		errorsText = this.validateUserName(this.get('username'), errorsText);
		if ( this.get('password').length < 6 ) errorsText.push("Your password must be at least 6 characters");
		if ( !this.validateEmail(this.get('email')) ) errorsText.push("Invalid email address");

		return errorsText;
	},

	validateUserName : function (userName, errorsText) {
		errorsText = errorsText || [];
		if ( userName == "" ) errorsText.push("Username field is blank");
		if ( userName.length > 15 ) errorsText.push("Username can't be longer than 15 charaters");
		if ( /\W/.test(userName) ) errorsText.push("Your username can only contain letters, numbers, and \"_\"");

		return errorsText;
	},

	serializeUpdateEmail : function (email) {
		return "utf8=%E2%9C%93" + "&email=" + email;
	},

	serializeUpdateUsername : function (name) {
		return "utf8=%E2%9C%93" + "&username=" + name;
	},

	serializeVerifyEmail : function (pin) {
		return "utf8=%E2%9C%93" + "&pin=" + pin;
	},

	/**
	* Returns model data in format: "utf8=%E2%9C%93&authenticity_token=gA6whis4kfyQctEnJmWkHhCB4plYmYy7ACFI%2Ftx4A%2Bw%3D&name=asd&password=123456&email=atest%40gmail.com&contact_me=on"
	*/
	serializeSignUp : function () {
		var contactMe = this.get("contact_me") ? "on" : "off";
		return "utf8=%E2%9C%93&authenticity_token=" + escape(this.get("authenticity_token")) + 
		"&name=" + escape(this.get("username")) + 
		"&password=" + escape(this.get("password")) + 
		"&email=" + escape(this.get("email")) + 
		"&contact_me=" + contactMe
		
	},

	/**
	* Returns model data in format: utf8=%E2%9C%93&authenticity_token=gYvHVVcJhUti99BSTRBAa2lbBO2qs0kfVbZ4lvJrKto%3D&name=atest2&password=123456
	*/
	serializeSignIn : function () {
		return "utf8=%E2%9C%93&authenticity_token=" + escape(this.get("authenticity_token")) + 
		"&name=" + escape(this.get("username")) + 
		"&password=" + escape(this.get("password"))
	},

	validateSingIn : function () {
		
	}
});