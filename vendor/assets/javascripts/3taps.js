if (typeof jQuery == 'undefined') alert('jQuery required');

var threeTapsClient = function(authId) {
	this.authId = authId || '';
	
	for (var type in threeTapsClient.clients) {
		var client = threeTapsClient.clients[type];
		this[type] = new client(this);
	}
};

threeTapsClient.clients = {};

threeTapsClient.register = function(type, client) {
	threeTapsClient.clients[type] = client;
};

threeTapsClient.prototype = {
	authId: null,
	response: null,

	request: function(path, method, params, callback) {
		params = params || {};

		var url = 'http://api.3taps.com' + path + method + (method.indexOf('?') == -1 ? '?' : '') + 'authID=' + this.authId + '&callback=?';

		$.getJSON(url, params, callback);
			
		return true;
	}
};

var threeTapsReferenceClient = function(authId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId);
	}
};

threeTapsReferenceClient.prototype = {
	client: null,

	path: '/reference/',
	
	category: function(callback, code, annotations) {
		code = code || '';
		return this.client.request(this.path, 'category/' + code + '?annotations=' + annotations + '&', null, callback);
	},

	location: function(callback, code) {
		code = code || '';
		return this.client.request(this.path, 'location/' + code, null, callback);
	},

	source: function(callback, code) {
		code = code || '';
		return this.client.request(this.path, 'source/' + code, null, callback);
	}
};

threeTapsClient.register('reference', threeTapsReferenceClient);
	
	
var threeTapsPostingClient = function(authId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId);
	}
};

threeTapsPostingClient.prototype = {
	client: null,

	path: '/posting/',
	
	'delete': function(data, callback) {
		var params = {
			data: JSON.stringify(data)
		};
		return this.client.request(this.path, 'delete', params, callback);
	},
	
	get: function(postKey, callback) {
		return this.client.request(this.path, 'get/' + postKey, null, callback);
	},
	
	create: function(data, callback) {
		var params = {
			data: JSON.stringify(data)
		};
		return this.client.request(this.path, 'create', params, callback);
	},
	
	update: function(data, callback) {
		var params = {
			data: JSON.stringify(data)
		};
		return this.client.request(this.path, 'update', params, callback);
	}
};

threeTapsClient.register('posting', threeTapsPostingClient);

var threeTapsNotificationsClient = function(authId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId);
	}
};

var threeTapsSearchClient = function(authId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId);
	}
};

threeTapsSearchClient.prototype = {
	client: null,

	path: '/search/',
	
	search: function(params, callback) {
		return this.client.request(this.path, '', params, callback);
	},
	
	range: function(params, callback) {
		return this.client.request(this.path, 'range', params, callback);
	},

	summary: function(params, callback) {
		return this.client.request(this.path, 'summary', params, callback);
	},

	count: function(params, callback) {
		return this.client.request(this.path, 'count', params, callback);
	},
};

threeTapsClient.register('search', threeTapsSearchClient);

var threeTapsStatusClient = function(authId) {
	if (authId instanceof threeTapsClient) {
		this.client = authId;
	} else {
		this.client = new threeTapsClient(authId);
	}
};

threeTapsStatusClient.prototype = {
	client: null,

	path: '/status/',
	
	update: function(postings, callback) {
		params = {postings: JSON.stringify(postings)};
		return this.client.request(this.path, 'update', params, callback);
	},
	
	get: function(postings, callback) {
		params = {postings: JSON.stringify(postings)};
		return this.client.request(this.path, 'get', params, callback);
	},

	system: function(callback) {
		return this.client.request(this.path, 'system', null, callback);
	}
};

threeTapsClient.register('status', threeTapsStatusClient);

// Override date to have threetaps format
Date.formatThreeTaps = function (date) {

	var zeroFill = function(number, width) {
		width -= number.toString().length;
		if (width > 0) {
			return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
		}
		return number;
	}

	var formatted = date.getFullYear() + '/' 
		+ zeroFill((date.getMonth() + 1), 2) + '/'
		+ zeroFill(date.getDate(), 2) + ' '
		+ zeroFill(date.getHours(), 2) + ':'
		+ zeroFill(date.getMinutes(), 2) + ':'
		+ zeroFill(date.getSeconds(), 2);

	return formatted;
};
