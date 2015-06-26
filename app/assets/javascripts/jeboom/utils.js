$.fn.highlightQuery = function(q, highlightTextPiece) {

	var query = q || app.models.searchModel.get('text') || '';
	if ( !query ) return this;
	// pull out phrases
	var phrases = _.compact(query.match(/".+"/g) || []);
	// get rid of the quotes
	query = query.replace(/".+"/g, '');
	// pull out remaining words
	var words = _.compact(query.split(' ') || []);
	// remove special words
	words = _.reject(words, function(word) {
	  return _.include(['or', 'and'], word.toLowerCase());
	});
	// ?! remove everything after 'not' keyword
	var not = words.indexOf('not');
	if ( not > -1 ) words = words.slice(0, not);
	// words only
	var hoptions = { wordsOnly: highlightTextPiece ? false : true };

	return this.each(function() {

	  var el = $(this);

	  _.each(phrases, function(phrase) {
	    el.highlight(phrase.replace(/^"|"$/g, ''), hoptions);
	  });

	  _.each(words, function(word) {
	    el.highlight(word, hoptions);
	  });

	});

};

var utils = (function() {
	var module = {};

	module.getNumberLabel = function (number) {
		return number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
	}

	module.getPhoneNumberLabel = function (s) {
		var s2 = (""+s).replace(/\D/g, '');
		var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
		return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
	}

	module.generateTimeAgoLabel = function (timestamp) {
		if (timestamp == "") {
			return "";
		}
		var from = timestamp * 1000;
		var to = new Date().getTime();
		// copied from Craiggers.Util.DateHelper.time_ago_in_words
		var max_hours_in_minutes = new Date().getHours() * 60;

		var distance_in_seconds = (to - from) / 1000;
		var distance_in_minutes = Math.floor(distance_in_seconds / 60);

		if ( distance_in_minutes == 0 ) { return 'less than a min'; }
		if ( distance_in_minutes == 1 ) { return '1 min'; }
		if ( distance_in_minutes < 45 ) { return distance_in_minutes + ' mins'; }
		if ( distance_in_minutes < max_hours_in_minutes) {
		if ( distance_in_minutes < 120 ) { return '1 hour'; }
		if ( distance_in_minutes < 1440 ) { return Math.floor(distance_in_minutes / 60) + ' hours'; }
		} else {
		var time_by_days_in_minutes = distance_in_minutes - max_hours_in_minutes;
		if ( time_by_days_in_minutes < 1440 ) { return '1 day'; }
		if ( time_by_days_in_minutes < 43200 ) { return Math.ceil(time_by_days_in_minutes / 1440) + ' days'; }
		}
		if ( distance_in_minutes < 86400 ) { return '1 month'; }
		if ( distance_in_minutes < 525960 ) { return Math.floor(distance_in_minutes / 43200) + ' months'; }
		if ( distance_in_minutes < 1051199 ) { return '1 year'; }

		return 'over ' + Math.floor(distance_in_minutes / 525960) + ' years';
	}

	module.generateDateLabel = function (timestamp) {
		if (timestamp == "") {
			return "";
		}
		var date = new Date(timestamp * 1000);
		// copied from Craiggers.Util.DateHelper.formatTimestamp
		if(!date) return '';

		var hours = date.getHours(),
		  minutes = date.getMinutes(),
		  ampm = hours >= 12 ? 'PM' : 'AM';

		hours = hours % 12;
		hours = hours ? hours : 12;
		minutes = minutes < 10 ? '0'+minutes : minutes;

		var time = hours + ':' + minutes + ampm;
		var timezone = /\((.*)\)$/.exec(date)[1]
		date = $.datepicker.formatDate('yy-mm-dd', date)

		return  date + ' ' + time + ' ' + timezone;
	}

	return module;
}());