_.extend(Craiggers.Views, {
  PostingForm: Backbone.View.extend({

    el: $('#new_posting'),

    events: {
      "keyup .category_field .input": "updateCategory",
      "blur .category_field .input": "updateCategory",
      "result .category_field .input": "updateCategory",

      'change .annotations select': 'updateAnnotationsSelector',
      'keyup .annotations input': 'updateAnnotationsText',
      'change .annotations :checkbox': 'updateAnnotationsCheckbox',

      'keyup .location .input': 'locationAuto',
      'keydown .location .input': 'eventsForLocationFieldReset',
      'click .location .autocomplete .selectable': 'clickLocationAuto',

      'click .reset_all': 'clearForm',
      'click #uploaded_images_container .delete_link': 'removeImage'
    },

    removeImage: function(caller, event){
      caller.preventDefault()
      var deleted_image_link = $(caller.currentTarget).siblings('.uploaded_image').attr('src')
      var deleted_container = $(caller.currentTarget).parents('.uploaded_image_container')
      if (this.model){
        var images =this.model.get("images_data");
      } else {
        var images = this.images
      }
      $.each(images, function(index, image_data){
        if (JSON.parse(image_data).full == deleted_image_link){
          images.splice(index, 1)
          return false
        }
      })
      if (this.model){
        this.model.set({"images_data": images})
      }
      $(deleted_container).slideUp("normal", function(){$(this).remove()});
    },

    initialize: function() {
      this.fieldsLookUpTable = {
        'body': '.body',
        'heading': '.heading',
        'category': '.category_field',
        'location_id': '.location.wrapper'
      }
      this.render()
    },

    clickLocationAuto: function(event) {
      var auto = $(event.currentTarget).closest('#new_posting.location.autocomplete'),
      selectable = $(event.currentTarget);

      var location = (selectable.next().text()).trim();
      if (this.model){
        this.model.set({location: location})
      } else {
        this.location = location;
      }
      var level = (selectable.next().next().text()).trim();

      this.$('#new_posting .location .input').val(selectable.text().replace(level + ":",'').trim());
      auto.hide();
    },

    eventsForLocationFieldReset: function(event){
      if(event.keyCode == Craiggers.Util.KEY.ESC)
        this.locationFieldReset()
      else if ( event.keyCode === Craiggers.Util.KEY.ENTER ) {
        var selectable = $(event.currentTarget);
        var list = selectable.next('.autocomplete')
        var selected = list.find('.selectable.selected')
        var location = selected.next('.code').text().trim()
        if( location == 'all' || location == 'all locations'){
          this.locationFieldReset();
        } else {
          if (this.model){
            this.model.set({location: location})
          } else {
            this.location = location;
          }
        }
      }
    },

    locationAuto: function(event) {
      clearTimeout(this.timeout);
      this.timeout = setTimeout(function(){
        if ( $(event.currentTarget).val() == '' ) {
          $("#new_posting .location .input").val('');
          $('#new_posting .location .location-path').html('');
          Craiggers.Search.set({location: { 'code': 'all'}});
          return;
        }
        var auto = $(event.currentTarget).next();
        var location = event.currentTarget.value;
        var code = event.keyCode;
        var current = String.fromCharCode(code);
        if ( code === Craiggers.Util.KEY.ENTER || code === Craiggers.Util.KEY.TAB ) {
          if ( Craiggers.Util.KEY.TAB && !auto.is(':visible')) return;
          var selected = auto.find('.selected');
          var code = selected.next().text().trim();
          var level = selected.next().next().text().trim();
          $('#new_posting .location .input').val(
            selected.text().replace(level + ":",'').trim()
          );
          Craiggers.Search.set({'location' :
            {
              code: code,
              level: level
            }
          });
          auto.hide();
          if ( code === Craiggers.Util.KEY.ENTER) return false;
          return;
        }
        this.$('.location .location-path').html('');
        var arrowkeys = (code === Craiggers.Util.KEY.UP || code === Craiggers.Util.KEY.DOWN);
        //if ( event.type === 'keyup' && arrowkeys) return false;
        if ( event.type === 'keyup' && arrowkeys ) {
          var tobe;
          var selected = auto.find('.selected').removeClass('selected');
          if ( code === Craiggers.Util.KEY.DOWN ) {
            tobe = selected.nextAll('.selectable:first');
            if ( !tobe.length ) tobe = auto.find('.selectable').last();
            tobe.addClass('selected');
          } else {
            tobe = selected.prevAll('.selectable:first');
            if ( !tobe.length) tobe = auto.find('.selectable').first();
            tobe.addClass('selected');
          }
          var elTop = tobe.offset().top;
          var someNumber = 180;
          if ( elTop - someNumber > 150 || elTop - someNumber < 0 )
            auto.find('ul').scrollTop(elTop - someNumber);

          return false;
        }
        if ( event.type === 'keydown' && current.match(/\w/i) ) location += current;
        if ( !location.length ) {
          auto.hide();
          return;
        }
        if ( location.length >= 3 && !/^\d*$/.test(location) ) {
          Craiggers.Search.set({
            'location_flag_response': Craiggers.Search.get('location_flag_response') + 1
          });
          var location_flag_response = Craiggers.Search.get('location_flag_response');
          $.manageAjax.add('geolocate', {
            url: '/location/search',
            dataType: 'json',
            data: {
              levels: 'country,state,metro,region,county,city,locality',
              text: location,
              type: 'istartswith'
            },
            success: function(data) {
              if ( Craiggers.Search.get('location_flag_response') != location_flag_response )
                return

              if ( data.numMatches < 50 ) {
                var locations = _.map(data.locations.slice(0, 19), function(loc, i) {

                  var item = {
                    name: loc.locationName,
                    code: loc.code,
                    level: loc.level,
                    oddeven: i % 2 ? 'ac_odd' : 'ac_even'
                  }

                  if( loc.code != 'all')
                    item.metro = loc.level + ': ';

                  return item
                });

                // sort by level
                levels = 'country,state,metro,region,county,city,locality'.split(',')
                locations.sort(function (a, b) {
                  if( levels.indexOf(a.level) > levels.indexOf(b.level) ) return 1
                  else if ( levels.indexOf(a.level) < levels.indexOf(b.level) ) return -1
                  else return 0
                })

                auto.html(JST['root-location-autocomplete']({
                  locations: locations,
                  present: !_.isEmpty(locations)
                }));

                if ( $(auto).parent().is('.column') )
                  $(auto).find('.ac_results_loc').css('margin', '0px');

                auto.find('.selectable').first().addClass('selected');
              } else {
                auto.html(JST['root-location-autocomplete-nummatches']({
                  num_matches: data.numMatches
                }));
              }
              auto.show();
            }
          });
        } else {
          auto.hide();
          if ( /^\d{5}$/.test(location) ) {
            this.$('.location .location-path').html('');
            $.manageAjax.add('geolocate', {
              url: LOCATION_API + 'USA-' + location + '/parent',
              dataType: 'json',
              success: function(data) {
                if(data.success) {
                  Craiggers.Search.set({
                    location: {
                      code: data.location.code,
                      level: data.location.level
                    }
                  });
                }
              },
              error: function(data) {
                Craiggers.Search.update({ location: {code:'all'} })
              }
            });
          } else {
            auto.hide();
            Craiggers.Search.update({ location: {code:'all'} })
          }
        }
      }, 0);
    },

    init_image_upload: function(){
      var entity = this
      this.$('#files_upload').fileupload({
        dataType: 'json',
        loadImageMaxFileSize: 1000000,
        add: function (e, data) {
          entity.$('.pictures .uploading').show();
          entity.$('.pictures .error_message').remove();
          data.submit();
        },
        done: function(e, data) {
          if(data.result.success) {
            var full = $.parseJSON(data.result.image).full
            entity.$('.pictures .uploading').hide()
            var img_container = $('<div />').attr({ 'class': 'uploaded_image_container', 'style': 'width: 120px;float:left;'})
            var img_name = $('<div/>').attr({ 'class': 'uploaded_image_name'}).text(data.files[0].name).appendTo(img_container)
            var img = $('<img />').attr({ 'class': 'uploaded_image', 'style': 'height: 100px;', 'src': full }).appendTo(img_container)
            $(img_container).append('<br />')
            var delete_link = $('<a />').attr({ 'class': 'delete_link', 'style': '', 'href': '#' }).text('delete').appendTo(img_container)
            entity.$('#uploaded_images_container').append(img_container)
            if (entity.model){
              var images_data = entity.model.get('images_data')
              images_data.push(data.result.image)
              entity.model.set({'images_data': images_data})
            } else {
              entity.images.push(data.result.image)
            }
          } else {
            entity.$('.pictures .uploading').hide()
            var error = $('<span/>').attr({ class: 'error_message', style: 'display: block; margin-bottom: 5px;' }).text(data.result.error)
            entity.$('.pictures').prepend(error)
          }
        }
      });

    },

    render: function() {
      this.$('.posting-form-content .error_message').remove();
      this.$('.field-block').removeClass('error');
      this.el.find('.category_field .input').autocomplete(
        Craiggers.Categories.getSubCategoryList(),
        Craiggers.Views.SearchBar.prototype.acoptions
      );

      this.init_image_upload()
      this.el.find('.annotations').html($('#annotations_block').html())
      var new_posting_popup = $('<div/>', {width: 620, class: 'posting-manage-popup'})
      new_posting_popup.html(this.el)

      $.fancybox({
        content: new_posting_popup,
        padding: 0,
        onComplete: function(){
          $('#fancybox-close').text('x').addClass('manage-postings-close-button')
          $('head').append('<link rel="stylesheet" href="vendcss" type="text/css" />');
        }
      });
      this.$('.posting-form-header').text('Post your item')
      this.el.show()
    },

    geolocate: function(){
      posting = this
      navigator.geolocation.getCurrentPosition(function(position){
        $.ajax({
          url: REVERSE_GEOLOCATION_URL + '?' + AUTH_TOKEN ,
          data: {
            'accuracy': 0,
            'latitude': position.coords.latitude,
            'longitude': position.coords.longitude
          },
          dataType: 'json',
          success: function(data) {
            var location = Craiggers.Locations.deepCodeLevel(data, ['country', 'state', 'metro'])
            api_call_for_geolocation(location.code).done(function(data){
              posting.$('.location_input').val(data.location.short_name)
              posting.location = data.location.code
            })
          }
        })
      })
    },

    addValidationErrors: function(errors, newPostingView){
      _.each(errors, function(message, error){
        $('#new_posting '+newPostingView.fieldsLookUpTable[error]).removeClass('error').addClass('error')
        $('#new_posting '+newPostingView.fieldsLookUpTable[error]).before("<span class='error_message'>"+message+"</span>")
      })
    },

    removeValidationErrors: function(errors, newPostingView){
      $('#new_posting .error').removeClass('error')
      $('.error_message').remove()
    },

    clearForm: function(){
      this.removeValidationErrors(this)
      $.each($('#new_posting select'), function(key, select){
        $(select).children().first().attr('selected', 'selected')
      })
      $('#new_posting #country_select').show()
      $('#new_posting input[type=text]').val('')
      $('#new_posting input[type=file]').val('')
      $('#new_posting input[type=checkbox]').removeAttr('checked')
      $('#new_posting textarea').val('')
      this.images = []
      this.el.find('#uploaded_images_container').html('')
    },


    updateCategory: function(event) {
      var val = $(event.currentTarget).val();

      if(code = Craiggers.Categories.codeByName(val)) {
        if (this.model) {
          this.model.set({category: code});
        } else {
          this.category = code
        }
        this.tooglePrice(code);
        this.annotations = this.updateAnnotations(this.annotations, code)
      }
    },

    tooglePrice: function (category_code) {
      var parent_code = Craiggers.Categories.parentCode(category_code)
      if (parent_code == 'AAAA' || parent_code == 'SSSS' || parent_code == 'RRRR') {
        console.log("showshow")
        $('#new_posting .price').show();
      } else {
        console.log("hidehide")
        $('#new_posting .price').hide();
      }
    },

    updateAnnotationsSelector: function (event) {
      var el = $(event.currentTarget);
      this.annotations[el.attr('name')] = el.val()
    },

    updateAnnotationsText: function (event) {
      var el = $(event.currentTarget);
      this.annotations[el.attr('name')] = el.val()
    },

    updateAnnotationsCheckbox: function(event) {
      var el = $(event.currentTarget);
      var name = el.attr('name');

      if(el.is(':checked')) this.annotations[name] = el.val();
      else this.annotations[name] = null;
    },

    updateAnnotations: function(annotations, category) {
      if(category && category !== 'all') {

        function show (type) {
          var selector = ['bedrooms', 'year', 'age', 'sex'];
          var checkboxes = 'cats dogs partTime telecommute contract internship nonprofit scheduling'.split(' ');
          var text = 'phone sqft make model vin personal_flavor compensation'.split(' '); // personal_flavor compensation

          var el = $('.annotations .' + type);

          // SELECT
          if($.inArray(type, selector) != -1) {
            if(annotations[type])
              el.find('select option[value=' + annotations[type]+ ']')
                .attr('selected', true)
            else
              el.find('select').prop('selectedIndex', 0);

          // CHECKBOX
          } else if($.inArray(type, checkboxes) != -1) {
            if(annotations[type])
              el.find('input').attr('checked', true)
            else
              el.find('input').attr('checked', false);

          // TEXT
          } else if($.inArray(type, text) != -1) {
            if(annotations[type])
              el.find('input').val(annotations[type]);
            else
              el.find('input').val('');
          } else return false;
          el.show();
        }

        function hide(type) {
          $('.annotations .' + type).hide();
          if(annotations[type]) {
            delete(annotations[type])
          }
        }

        function toggle(items) {
          _.each(items, show)
          _.each(_.difference(type, items), hide)
        }


        var parent = category;
        var type = ['phone', 'bedrooms', 'sqft', 'cats', 'dogs', 'make', 'model', 'vin', 'year',
                    'age', 'sex', 'personal_flavor', 'compensation', 'partTime',
                    'telecommute', 'contract', 'internship', 'nonprofit', 'scheduling'];

        if(!Craiggers.Categories.isTopLevel(parent)){
          parent = Craiggers.Categories.parentCode(category);
          switch(parent) {
            case 'AAAA':
              if(category === 'APET')
                toggle(['phone', 'make', 'age']);
              break;
            case 'CCCC': toggle(['phone']); break;
            case 'DDDD': toggle(['phone']); break;
            case 'SSSS':
              if($.inArray(category, ['SANT', 'SBIK', 'SCOL', 'SMUS']) !== -1)
                toggle(['phone', 'make', 'model', 'year']);
              if($.inArray(category, ['SAPL', 'SELE']) !== -1)
                toggle(['phone', 'make', 'model', 'vin', 'year']);
              if($.inArray(category, ['SAPP', 'SANC', 'SKID', 'SBAR', 'SEDU', 'SFNB', 'SFUR', 'SGFT',
                'SHNB', 'SHNG', 'SIND', 'SJWL', 'SLIT', 'SMNM', 'SOTH', 'SSNF', 'STIX', 'STOO',
                'STOY', 'SWNT']) !== -1)
                toggle(['phone', 'make', 'model']);
              break;
            case 'JJJJ':
              toggle(['phone', 'compensation', 'partTime', 'telecommute', 'contract', 'internship', 'nonprofit']);
              break;
            case 'MMMM':
              if($.inArray(category, ['MADU', 'MMFM', 'MMFW', 'MWFM']) !== -1)
                toggle(['phone', 'age', 'sex', 'personal_flavor']);
              break;

            case 'ZZZZ': toggle(['phone']); break;
            case 'PPPP':
              toggle(['phone', 'age', 'sex', 'personal_flavor']);
              break;
            case 'RRRR':
              if($.inArray(category, ['RCRE','RLOT','ROTH','RPNS']) !== -1)
                toggle(['phone', 'sqft']);
              if($.inArray(category, ['RHFS', 'RSHR']) !== -1)
                toggle(['phone', 'bedrooms', 'sqft']);
              if($.inArray(category, ['RHFR','RSUB','RSWP','RVAC','RWNT']) !== -1)
                toggle(['phone', 'bedrooms', 'sqft', 'cats', 'dogs']);
              break;
            case 'SVCS':
              toggle(['phone', 'scheduling']);
              break;
            case 'VVVV':
              toggle(['phone', 'make', 'model', 'vin', 'year']);
              break;

            default: _.each(type, hide); break;
          }
        }
      }


      return annotations
    }
  })
})
