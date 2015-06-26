var InputCategoryView = BaseView.extend({

	DEFAULT_VALUE : "All Categories",

	events : {
		"focus #category_input" : "inputFocusHandler",
		"blur #category_input" : "inputBlurHandler",

		'click .viewlist': 'toggleCategoriesList',
		'click .jumbolist .more_menu_results': 'showAdditionalCategoriesForMenu',
      	'click .jumbolist .less_menu_results': 'hideAdditionalCategoriesForMenu',
      	'click .jumbolist .selectable': 'categorySelected',
	},

	render : function () {

		this.show();

		this.inputField = this.$("#category_input");
		this.openListIcon = this.$('.viewlist');
		this.list = this.$(".jumbolist");

		this.$(".holder").hide();

		this.refreshValue();
		
		this.initAutoComplete();

		this.initCategoriesMenu();

		_.each(this.list.find(".selectable"), function (categoryElement) {
			var element = $(categoryElement);
			data = element.attr("data");
      if (data){ return;}
      var name = element.html();
			var category = app.collections.categories.getCategoryByName(name);
			if (!category) {
				element.hide();
			} else {
				element.attr("data", category.get("code"));
			}
		});
	},

	setupCategory : function (event, data) {
		var category;

		if (data && data.code) {
			category = app.collections.categories.getCategoryByCode(data.code);
		} else {
			var categoryName = this.getInputFieldValue();
			category = app.collections.categories.getCategoryByName(categoryName);
		}

		if (!category) {
			return;
		}

		this.model.setupCategory(category.get("code"));
	},

	refreshValue : function () {

		if (this.model.getCategory() !== "") {
			var category = app.collections.categories.getCategoryByCode(this.model.getCategory());

			if (category) {
				this.inputField.val(category.get("name"));
				return;
			}
		} 

		this.setDefaultValue();
	},

	getInputFieldValue : function () {
		return this.inputField.val();
	},

	acoptions: {
		width: 200,
		max: 100,
		formatItem: function(el, i, max) {
			if ( el.parents ) {
				return el.path + ' <i>(' + el.parents + ')</i>';
			}
			return el.path;
		},
		formatMatch: function(el, i, max) {
			return el.path;
		},
		formatResult: function(el) {
			return el.name;
		}
    },

    categorySelected : function (event) {
    	this.inputField.val($(event.target).html());
    	this.hideList();
    	this.setupCategory(event, {code : $(event.target).attr("data")});
    },

    initCategoriesMenu : function () {
      
      var $menu = this.list.find(".dropdown-menu");

      // jQuery-menu-aim: <meaningful part of the example>
      // Hook up events to be fired on menu row activation.
      $menu.menuAim({
          activate: activateSubmenu,
          deactivate: deactivateSubmenu,
          rowSelector: "> li, #additional_categories_for_menu > li"
      });
      // jQuery-menu-aim: </meaningful part of the example>

      // jQuery-menu-aim: the following JS is used to show and hide the submenu
      // contents. Again, this can be done in any number of ways. jQuery-menu-aim
      // doesn't care how you do this, it just fires the activate and deactivate
      // events at the right times so you know when to show and hide your submenus.
      function activateSubmenu(row) {
          var $row = $(row),
              submenuId = $row.data("submenuId"),
              $submenu = $menu.find("#" + submenuId),
              width = $menu.outerWidth();

          if($.inArray(submenuId, ['all_categories_submenu', 'discussions_submenu', 
          'uncategorized_submenu']) !== -1){    
            $submenu.css({
                display: "none"
            }); 
          } else {
            // Show the submenu
            $submenu.css({
                display: "block",
                top: -2,
                left: width - 4  // main should overlay submenu
            });

            $menu.css({
              '-webkit-border-top-right-radius': 0,
              'border-top-right-radius': 0,
            }); 
          } 

          // Keep the currently activated row's highlighted look
          $row.find("a").addClass("maintainHover");
      }

      function deactivateSubmenu(row) {
          var $row = $(row),
              submenuId = $row.data("submenuId"),
              $submenu = $menu.find("#" + submenuId);

          // Hide the submenu and remove the row's highlighted look
          $submenu.css("display", "none");

          $menu.css({
            '-webkit-border-top-right-radius': 10,
            'border-top-right-radius': 10,
          }); 
          $row.find("a").removeClass("maintainHover");
      }

      // Bootstrap's dropdown menus immediately close on document click.
      // Don't let this event close the menu if a submenu is being clicked.
      // This event propagation control doesn't belong in the menu-aim plugin
      // itself because the plugin is agnostic to bootstrap.
      // $("#searchcolumn .category>.jumbolist .dropdown-menu li").click(function(e) {
      //     e.stopPropagation();
      // });

      $(document).click(function() {
          // Simply hide the submenu on any click. Again, this is just a hacked
          // together menu/submenu structure to show the use of jQuery-menu-aim.
          $(".popover").css("display", "none");
          $menu.css({
            '-webkit-border-top-right-radius': 10,
            'border-top-right-radius': 10,
          }); 
          $("a.maintainHover").removeClass("maintainHover");
      });
    },

	initAutoComplete : function () {
		var categories = app.collections.categories.getCategoriesList();
		var autoCompleteList = _.map(categories, function(data) {
			var categoryData = {
				name : data.category.get("name"),
				code : data.category.get("code"),
				path : data.parent ? data.parent.get("name") + " > " + data.category.get("name"): data.category.get("name")
			}

			return categoryData;
		});
		this.inputField.autocomplete(
	        autoCompleteList,
	        this.acoptions
		);

		this.inputField.on("result", $.proxy(this.setupCategory, this));
	},

	showAdditionalCategoriesForMenu : function (event) {
	 	var target = $(event.target);
		target.parents('.dropdown-menu').find('#additional_categories_for_menu').slideDown('fast');
		target.hide();
		this.list.find('.less_menu_results').show();
    },

    hideAdditionalCategoriesForMenu : function (event) {
		var target = $(event.target);
		target.parents('.dropdown-menu').find('#additional_categories_for_menu').slideUp('fast');
		target.hide();
		this.list.find('.more_menu_results').show();
    },

	toggleCategoriesList : function (event) {
		if (this.openListIcon.hasClass("closed")) {
			this.showList();
		} else {
			this.hideList();
		}
	},

	showList : function () {
		this.openListIcon.removeClass("closed");

		this.list.show();

		var self = this;

		$('body').on("click", function (event) {
			var el = $(event.target);
        	if ( !el.parents('.searchcontainer .wrapper').length ) {
        		self.hideList();
        	}
		});
	},

	hideList : function () {
		this.openListIcon.addClass("closed");

		this.list.hide();

		$('body').off('click');
	},

	setDefaultValue : function () {
		this.inputField.val(this.DEFAULT_VALUE);
	},

	inputBlurHandler : function (event) {
		if (this.inputField.val() == "") {
			this.setDefaultValue();
		}
	},

	inputFocusHandler : function (event) {
		if (this.inputField.val() == this.DEFAULT_VALUE) {
			this.inputField.val("");	
		}
	},

	remove : function () {
		this.undelegateEvents(this.events);
		this.inputField.off("result", $.proxy(this.setupCategory, this));
		this.hide();
	}
});