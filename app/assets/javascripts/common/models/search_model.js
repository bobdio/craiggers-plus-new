/**
* spec in spec_runner/spec/models/search_model_spec
*/

var SearchModel = BaseModel.extend({

  START_YEAR : 1900,
  END_YEAR : new Date().getFullYear(),
  MAX_BEDROOMS_NUMBER : 20,
  START_AGE : 7,
  END_AGE : 90,
  DEFAULT_CATEGORY_GROUP : "~MMMM|~PPPP",
  SOURCES : [
    'BKPGE',
    'CRAIG',
    'EBAYC',
    'EBAYM',
    'HMNGS',
    'INDEE',
    'JBOOM',
    'KIJIJ',
    'NBCTY',
    'APTSD',
    'CARSD'
  ],

	defaults : {
		anchor: undefined,
		page: 0,
		rpp: 20,
		tier: 0,
		text : "",
		safe_search : true,
    has_price : false,
		title_only : false,
		has_image: true,
		entire_post: false,
		category_id: "all",
		min_price: "",
		max_price: "",
    sort : "",
    selected_categories : [],
    unselected_categories : [],
    selected_source : [],
    unselected_source : [],
    selected_status : [],
    unselected_status : [],
    save_location : true,
    category_group : null,
    annotations : {}
	},

  setCategoryGroup : function (value) {
    this.set("selected_categories", []);
    this.set("unselected_categories", []);
    this.set("category_group", value);
  },

  setCategory : function (categoryID) {
    this.set("selected_categories", [categoryID]);
    this.set("unselected_categories", 'all');
    this.set("category_group", null);
  },

  getCategory : function () {
    if (this.get("selected_categories").length > 0) {
      return this.get("selected_categories")[0];
    }

    if (this.get("category_group")) {
      return this.get("category_group");
    }

    return "";
  },

  getCategoryModel : function () {
    return app.collections.categories.getCategoryByCode(this.getCategory());
  },

  setupCategory : function (code) {
    var category = app.collections.categories.getCategoryByCode(code);

    if (category) {
      if (category.hasSubCategories()) {
        this.setCategoryGroup(category.get('code'));
      } else {
        this.setCategory(category.get('code'));
      }

      this.trigger("category_changed")
    }
  },

  setupRadius : function (distance, dimension) {
    
    var location = this.get("location");
    if (!location) {
      return;
    }

    var additional = location.getAdditionalRadius(dimension);

    var radius = (Number(distance) + additional).toString() + dimension;
    this.set("radius", radius);
  },

  setupLocation : function (level, code) {
    var location = this.get("location");

    if ((!location) || (location.get("code") !== code)) {
      this.set('location', new LocationModel({level : level, code: code, isDataFull: false}));
    }
  },

  setupSource : function (code) {
    var sources = code.split("|");
    this.set("selected_source", sources);
    this.set("unselected_source", 'all');
  },

  getFilters : function () {
    var filters = {
      'has_image' : {value: this.get('has_image'), name: "has image"},
      'has_price' : {value: this.get('has_price'), name: "has price"},
      'title_only' : {value: this.get('title_only'), name: "title only"}
    }

    filters['selected_categories'] = this.getArrayFilterItems(this.get('selected_categories'), this.get('unselected_categories'));
    filters['selected_source'] = this.getArrayFilterItems(this.get('selected_source'), this.get('unselected_source'));
    filters['selected_status'] = this.getArrayFilterItems(this.get('selected_status'), this.get('unselected_status'));

    return filters;
  },

  isFiltered : function () {
    return _.some(this.getFilters(), function (filterData) {
      if (filterData) {
        if (_.isArray(filterData)) {
          return true;
        } else {
          if (filterData.value) {
            return true;
          }
        }
      }
    });
  },

  getArrayFilterItems : function (selectedItems, unselectedItems) {
    var filters;
    if (unselectedItems.length > 0) {
      filters = [];

      _.each(selectedItems, function (itemName) {
        filters.push({value: true, name: itemName});
      })
    }

    return filters;
  },

  removeFilter : function (filter, key) {
    if (!key) {
      key = filter;
    }
    
    var filterValue = this.get(key);

    // in case of filter is array (selected_categories, selected_source, selected_status) 
    if (_.isArray(filterValue)) {

      if (filterValue.indexOf(filter) > -1) {
          filterValue.splice(filterValue.indexOf(filter), 1);
      }

      this.set(key, filterValue);
      this.trigger("change:" + key);

      return;
    }

    if (_.has(this.defaults, key)) {
      this.set(key, this.defaults[key]);  
    }
  },

  resetFilters : function () {
    this.set({
      selected_categories : [],
      unselected_categories : [],
      selected_source : [],
      unselected_source : [],
      selected_status : [],
      unselected_status : [],
      has_price : false,
      title_only : false,
      has_image: true,
      category_group: null
    });
  },

  setupNextSearchDirection : function (resultsModel) {
    if (resultsModel.isNextPageAvailable()) {
      this.set({
        page: resultsModel.get("next_page")
      });
      return;
    }

    if (resultsModel.isNextTierAvailable()) {
      this.set({
        page: resultsModel.get("next_page"),
        tier: resultsModel.get("next_tier")
      });
    }
    
  },

  

  _getUpdatedUnselectedItems : function (savedUnselectedItems, unselectedItems, selectedItems) {
    if (savedUnselectedItems == "all") {
      savedUnselectedItems = [];
    }
    //TODO: should be refactored
    _.each(unselectedItems, function (item) {
      if (savedUnselectedItems.indexOf(item) == -1) {
        savedUnselectedItems.push(item);
      }
    }, this);

    _.each(selectedItems, function (item) {
      if (savedUnselectedItems.indexOf(item) > -1) {
          savedUnselectedItems.splice(savedUnselectedItems.indexOf(item), 1);
      }
    }, this);

    return savedUnselectedItems;
  },

  refreshUnselectedCategories : function (unselectedCategories, selectedCategories) {
    var savedUnselectedCategories = this.get('unselected_categories');

    this.set({unselected_categories: this._getUpdatedUnselectedItems(savedUnselectedCategories, unselectedCategories, selectedCategories)});
  },

  refreshUnselectedStatus : function (unselectedStatus, selectedStatus) {
    var savedUnselectedStatus = this.get('unselected_status');

    this.set({unselected_status: this._getUpdatedUnselectedItems(savedUnselectedStatus, unselectedStatus, selectedStatus)});
  },

  refreshUnselectedSource : function (unselectedSource, selectedSource) {
    var savedUnselectedSource = this.get('unselected_source');

    this.set({unselected_source: this._getUpdatedUnselectedItems(savedUnselectedSource, unselectedSource, selectedSource)});
  },

  /**
  * Refreshes options of search model by saved search model
  */
  refreshOptionsBySearchModel : function (searchModel) {
    var attrs = searchModel.clone().attributes;
    delete attrs.cid;
    delete attrs.id;
    this.set(attrs);

    if (searchModel.get('location')) {
      this.set('location', searchModel.get('location'));
    }
  },

  initialize : function () {
    this.setupData();
  },

  clearPrice : function () {
    this.set({
      min_price : "",
      max_price : ""
    })
  },

  validatePrice : function (minPrice, maxPrice) {
    minPrice = minPrice || this.get('min_price');
    maxPrice = maxPrice || this.get('max_price');

    if ((minPrice == "") && (maxPrice == "")) {
      return false;
    } else {
      if ((minPrice == "") || (maxPrice == "")) {
        return true;
      }
    }

    if (Number(maxPrice) >= Number(minPrice)) {
      return true;
    }

    return false;
  },

  setupPrice : function (priceData) {
    var prices = priceData.split("..");
    
    if (prices[0]) {
      this.set("min_price", prices[0]);
    }

    if (prices[1]) {
      this.set("max_price", prices[1]);
    }
  },

  generateParams : function () {
    var params = "subnav=workspace-link&nav=search-link";

    if (this.get("title_only")) {
      params += "&title-only=true";
    }

    if (this.get("has_image")) {
      params += "&has-image=true";
    }

    if (this.validatePrice()) {
      params += "&price=" + this.get('min_price') + ".." + this.get('max_price');
    }

    if (this.get("sort") !== "") {
      params += "&sort=" + this.get("sort");
    }

    if ((this.get("radius")) && (this.get("radius") !== "")) {
      var location = this.get("location");
      if ((location) && (location.get("lat") !== 0) && (location.get("long") !== 0)) {
        params += "&radius=" + this.get("radius");
      }
    }

    params += "&" + this.generateAnnotationsParams();

    return params;
  },

  setupParams : function (params) {
    this.set("page", 0);

    if (params["has-image"]) {
      this.set("has_image", Boolean(params["has-image"]));
    }

    if (params["title-only"]) {
      this.set("title_only", Boolean(params["title-only"]));
    }

    if (params["price"]) {
      this.setupPrice(params["price"]);
    }

    if (params["sort"]) {
      this.set("sort", params["sort"]);
    }

    if (params["radius"]) {
      this.set("radius", params["radius"]);
    }

    this.setupAnnotationsParams(params);
  },

  setupAnnotationsParams : function (params) {
    var supportedAnnotations = this.getSupportedAnnotations();

    _.each(supportedAnnotations, function (annotation) {
      if (params[annotation]) {
        this.addAnnotation(annotation, params[annotation]);
      } else {
        this.removeAnnotation(annotation);
      }
    }, this);
  },

  setupData : function () {
    // set data of saved model, which is stored in json property into model attributes
    var savedData = this.get('json');
    if (savedData) {
      var params = savedData.params;
      this.id = this.get('key');

      if (savedData.extra) {
        this.set("search_url", savedData.extra.url);
      }

      if (savedData.email) {
        this.set("notification_email", savedData.email);
      }
 
      this.set("name", savedData.name);
      
      if (!params) {
        return;
      }
      this.set({
        safe_search : params.safe == "yes" ? true : false,
        anchor : params.anchor,
        page : params.page,
        rpp : params.rpp,
        tier : params.tier,
        has_image : params.has_image == 1,
        has_price : params.has_price == 1,
        selected_categories : params.category ? params.category.split("|") : [],
        selected_status : params.status ? params.status.split("|") : [],
        selected_source : params.source ? params.source.split("|") : [],
        unselected_categories : "all",
        unselected_source : "all",
        unselected_status : "all",
        category_group : params.category_group
      });

      if (params.price) {
        this.setupPrice(params.price);
      }

      //set text value
      if (params.heading) {
        this.set({
          title_only: true,
          text : params.heading
        });
      } else {
        this.set("text", params.text);
      }

      // set location value by remote saved search data
      var locationLevels = ["state", "metro", "locality"];
      _.each(locationLevels, function (level) {
        if (params[level]) {

          this.set('location', new LocationModel({level : level, code: params[level], isDataFull: false, name: params[level]}));

          this.refreshLocationModel();
        }
      }, this);
    }

    var location = this.get('location');
    if ((location) && (!location.attributes)) {
      this.set('location', new LocationModel(location));
    }
  },

  clearLocation : function () {
    this.set('location', null);
  },

  refreshLocationModel : function () {
    var location = this.get('location');
    var level = location.get('level');
    var code = location.get('code');

    if (app.collections[level]) {
      location = app.collections[level].getLocationByCode(code);
      location.set({code: code, level: level});
      this.set('location', location);
    }
  },

  getSavedLocationData : function () {
    if (this.get('json')) {
      return this.get('json').params;
    }
  },

  /**
  * Returns correct category code of saved search model
  */
  getCategoryCode : function () {
    var code = this.get('category') ? this.get('category') : this.get('category_group');
    if (!this.isDefaultCategoryGroup(code)) {
      return code;
    }
    return null;
  },

  isDefaultCategoryGroup : function (categoryID) {
    return categoryID == this.DEFAULT_CATEGORY_GROUP;
  },

  getSupportedAnnotations : function () {
    var category = this.getCategoryModel();

    if(!category) {
      return null;
    }

    return category.getAnnotations();
  },

  generateAnnotationsParams : function () {
    var data = "";
    var annotations = this.getSupportedAnnotations();

    if (annotations) {
      _.each(annotations, function (annotation) {
        var value = this.getAnnotation(annotation);
        if (value) {
          data += annotation + "=" + value + "&";  
        }
      }, this);
    }

    return data;
  }

});

_.extend(SearchModel.prototype, AnnotationsModelMixin.prototype);
