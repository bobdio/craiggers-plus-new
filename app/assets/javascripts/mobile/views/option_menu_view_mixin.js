var OptionMenuViewMixin = (function () {
	var module = function() {};

	_.extend(module.prototype, {
		menuCancelHandler : function () {
			this.state.cancelHandler();
		},

		menuSaveHandler : function () {
			this.state.saveHandler();
		},

		activateState : function (stateID) {
			if (this.STATES[stateID]) {
				var state = new this.STATES[stateID]();
				state.setContext(this);
				this.setState(state);
				this.state.activate();

				return state;
			}

			return null;
		},

		setState : function (state) {
			this.state = state;
		},

		renderOptionMenus : function () {
			this.$el.append(JST["mobile/templates/option_menus"]());
		}
	});

	return module
}());

var OptionMenuViewState = function () {};
_.extend(OptionMenuViewState.prototype, {

	setContext : function (context) {
		this.context = context;
	},

	activate : function () {
		this.context.state.activateMenu();
	},

	saveHandler : function () {
		this.context.state.deactivate();
	},

	activateMenu : function () {
		var self = this;
		window.scrollTo(0, 0);
		$("#" + this.context.state.id).show();
		$("#" + this.context.state.id).transition({
			x: "0",
			duration: app.PAGE_ANIMAITON_DURATION,
			complete : function () {
				// this hack prevents horizontal scrolling on iOS devices
				$("#content").attr({style: "overflow-x: auto"});
				setTimeout(function () {
					$("#content").attr({style: "overflow-x: hidden"});
					self.activated();
				}, 100);
				
			}
		});
	},

	activated : function () {

	},

	deactivateMenu : function () {
		var self = this;
		var stateID = this.context.state.id;
		$("#" + stateID).transition({
			x: "100%",
			duration: app.PAGE_ANIMAITON_DURATION,
			complete : function () {
				$("#" + stateID).hide();
				//$("#" + self.context.state.id).attr({style: "overflow: auto"});
			}
		});
	},

	cancelHandler : function () {
		this.context.state.deactivate();
	},

	deactivate : function () {
		this.context.state.deactivateMenu();
	}
});

var SourcesOptionMenuState = function() {};
_.extend(SourcesOptionMenuState.prototype, OptionMenuViewState.prototype, {
	id : "sources_menu"
});

var CategoriesOptionMenuState = function() {};
_.extend(CategoriesOptionMenuState.prototype, OptionMenuViewState.prototype, {
	id : "categories_menu"
});

var StatusOptionMenuState = function() {};
_.extend(StatusOptionMenuState.prototype, OptionMenuViewState.prototype, {
	id : "status_menu"
});

var PriceRangeOptionMenuState = function() {};
_.extend(PriceRangeOptionMenuState.prototype, OptionMenuViewState.prototype, {
	id : "price_range_menu"
});



