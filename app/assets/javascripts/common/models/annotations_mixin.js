/**
* This module contains methods for working with annotations data
*/

var AnnotationsModelMixin = (function () {
	var module = function () {};

	_.extend(module.prototype, {
		getAnnotation : function (key) {
			var annotations = this.get("annotations");
			return annotations[key];
		},

		removeAnnotation : function (key) {
			var annotations = this.get("annotations");
			delete annotations[key];
			this.set("annotations", annotations);
		},

		addAnnotation : function (key, value) {
			var annotations = this.get("annotations");
			annotations[key] = value;
			this.set("annotations", annotations);
		},

		getAnnotationsData : function () {
			if (!this.get("annotations") || _.isEmpty(this.get("annotations"))) {
				return null;
			}

			return this.buildAnnotations(this.get("annotations"));
		},

		// copied from threetaps/models/search_model
		buildAnnotations : function(data) {
			var annotations = []
			var start_year, end_year
			$.each(data, function(key, value) {
				if (key=='start_year'){start_year = parseInt(value)} else 
				if (key=='end_year'){end_year = parseInt(value)} else {
					annotations.push(key + ':' + value)
				}  
			})

			if ((start_year && !end_year) || 
				(start_year && end_year && start_year >= end_year)){
				annotations.push('year:' + start_year)
			}

			if (!start_year && end_year){
				annotations.push('year:' + end_year)
			}

			if (start_year && end_year && start_year < end_year){
				var years_array = []
				for (var iter_year = start_year; iter_year <= end_year; iter_year++) {
					years_array.push(iter_year)
				}

				years_array = _.map(years_array, function(year){
					return 'year:'+year
				});

				var years_string = '(' + years_array.join(' OR ') + ')'
				annotations.push(years_string);
			}

			return '{' + annotations.join(' AND ') + '}';
		}
	});

	return module;
}());