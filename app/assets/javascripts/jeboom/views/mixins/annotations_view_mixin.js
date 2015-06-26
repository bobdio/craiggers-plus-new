var AnnotationViewMixin = (function () {
	var module = function () {};

	_.extend(module.prototype, {
		refreshAnnotations : function () {
			var annotations = this.model.getSupportedAnnotations();

			this.$("#annotations_block .field-block").hide();
			this.$("#annotations_block select").val("");
			this.$("#annotations_block input:text").val("");
			this.$("#annotations_block :checkbox").attr("checked", false);

			if (!annotations) {
				return;
			}

			_.each(annotations, function (annotation) {
				this.showAnnotation(annotation);
			}, this);	
		},

		showAnnotation : function (annotation) {
			var element = this.$("#annotations_block ." + annotation);
			var input = element.find("select, input, :checkbox");
			element.show();
			var value = this.model.getAnnotation(annotation);
			// fix misalignment of start_year and end_year filter elements
			if ((element.is(".start_year")) || ((element.is(".end_year")))) {
				element.attr("style", "display:inline-block; float: none;");
			}

			if (value) {
				if (input.is(":checkbox")) {
					input.attr("checked", true);
				} else {
					input.val(value);	
				}
			}
		},

		updateAnnotationCheckbox : function (event) {
			var el = $(event.currentTarget);
			if(el.is(':checked')) this.updateAnnotation(event);
	      	else this.model.removeAnnotation(el.attr('name'));
		},

		updateAnnotation: function (event) {
			var el = $(event.currentTarget);
			this.model.addAnnotation(el.attr('name'), el.val());
		}
	});

	return module;
}());