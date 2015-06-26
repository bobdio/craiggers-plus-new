// This is a manifest file that'll be compiled into application.js, which will include all the files
// listed below.
//
// Any JavaScript/Coffee file within this directory, lib/assets/javascripts, vendor/assets/javascripts,
// or vendor/assets/javascripts of plugins, if any, can be referenced here using a relative path.
//
// It's not advisable to add code directly here, but if you do, it'll appear at the bottom of the
// the compiled file.
//
// WARNING: THE FIRST BLANK LINE MARKS THE END OF WHAT'S TO BE PROCESSED, ANY BLANK LINE SHOULD
// GO AFTER THE REQUIRES BELOW.
//
//---------------------------- libs

//= require libs/jQuery
//= require jquery-ui-1.8.7.custom.min.js
//= require jquery.ui.datepicker
//= require libs/jquery.ajaxmanager
//= require jquery.autocomplete.js
//= require jquery.onImagesLoad.min
//= require libs/underscore
//= require libs/backbone
//= require libs/bootstrap.min
//= require jquery.highlight
//= require libs/klass.min
//= require libs/geo-min.js
//= require libs/geo-min.js
//= require jquery-menu-aim
//= require fancybox/jquery.fancybox-1.3.4
//= require jquery.crop.js
//= require libs/jquery.ui.widget.js
//= require libs/jquery.iframe-transport.js
//= require libs/jquery.fileupload.js

//---------------------------- src

//= require urls

//= require jeboom/router
//= require jeboom

//= require common/models/annotations_mixin
//= require common/models/base_model
//= require common/models/sync_model
//= require common/models/posting_model
//= require common/models/category_model
//= require common/models/search_model
//= require common/models/results_model
//= require common/models/location_model
//= require common/models/user_model
//= require common/models/matched_locations_model
//= require common/models/search_count_model

//= require common/collections/base_collection
//= require common/collections/favorites
//= require common/collections/categories
//= require common/collections/postings
//= require common/collections/saved_searches
//= require common/collections/locations
//= require common/collections/results

//= require common/services/sync_service 
//= require common/services/search_service
//= require common/services/user_service
//= require common/services/location_service

//=require jeboom/views/mixins/posting_view_mixin
//=require jeboom/views/mixins/annotations_view_mixin

//=require jeboom/views/components/base_view
//=require jeboom/views/components/signinout_view
//=require jeboom/views/components/dialog_view
//=require jeboom/views/components/sign_in_dialog_view
//=require jeboom/views/components/sign_up_dialog_view
//=require jeboom/views/components/saved_search_update_dialog_view
//=require jeboom/views/components/input_category_view
//=require jeboom/views/components/input_location_view
//=require jeboom/views/components/change_password_dialog_view
//=require jeboom/views/components/confirm_dialog_view
//=require jeboom/views/components/new_posting_view

//=require jeboom/views/main/main_view
//=require jeboom/views/main/main_header_view
//=require jeboom/views/main/main_search_bar_view

//=require jeboom/views/search/sources_metrics_view
//=require jeboom/views/search/search_view
//=require jeboom/views/search/search_header_view
//=require jeboom/views/search/search_results_view
//=require jeboom/views/search/posting_view
//=require jeboom/views/search/posting_details_view
//=require jeboom/views/search/posting_image_viewer
//=require jeboom/views/search/search_filters_base_view
//=require jeboom/views/search/search_options_view
//=require jeboom/views/search/search_container_view
//=require jeboom/views/search/search_settings_view
//=require jeboom/views/search/source_filters_view
//=require jeboom/views/search/price_range_filter_view
//=require jeboom/views/search/save_search_view
//=require jeboom/views/search/saved_searches_view
//=require jeboom/views/search/saved_search_view

//=require jeboom/views/search/radius_filter_view
//=require jeboom/views/search/explore_view


//=require jeboom/utils
