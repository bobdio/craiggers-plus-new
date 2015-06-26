_.extend(Craiggers.Views, {

  SearchFilters: Craiggers.Views.Filter.extend({

    el: $('#searchfilters'),

    events: {
      'change :checkbox[param], :radio[param]': 'updateParam',
      'change .dates input': 'updateDate',
      'change #annotations_block select': 'updateSelector',
      'keyup #annotations_block input': 'updateText',
      'change #annotations_block :checkbox': 'updateCheckbox',
      'click .datepicker-label': 'clickDatepicker'
    },

    initialize: function() {
      this.$('.datepicker').each(function() {
        $(this).datepicker({
          minDate: -5,
          maxDate: 0,
          dateFormat: 'yy-mm-dd',
          altField: '#' + this.id + '_label',
          altFormat: 'M d'
        });
      });

      Craiggers.Search.bind('change:params', _.bind(this.updateFromModel, this));
      Craiggers.Search.bind('change:category', this.updateAnnotations);

      if ( this.updateFromModel() )
        this.showResults()
    },

    updateAnnotations: function() {
      var params = Craiggers.Search.get('params');
      var category = Craiggers.Search.get('category');

        function show (type) {
          var selector = ['start_year', 'end_year','age', 'bedrooms'];
          var checkboxes = 'cats dogs telecommute contract internship partTime nonprofit'.split(' ');
          var text = 'make model vin sqft'.split(' '); // personal_flavor compensation

          var el = $('#annotations_block .' + type);

          // SELECT
          if($.inArray(type, selector) != -1) {
            if(params[type])
              el.find('select option[value=' +params[type]+ ']').attr('selected', true)
            else
              el.find('select').prop('selectedIndex', 0);

          // CHECKBOX
          } else if($.inArray(type, checkboxes) != -1) {
            if(params[type])
              el.find('input').attr('checked', true)
            else
              el.find('input').attr('checked', false);

          // TEXT
          } else if($.inArray(type, text) != -1) {
            if(params[type])
              el.find('input').val(params[type]);
            else
              el.find('input').val('');
          } else return false;

          el.show();
        }

        function hide(type) {
          $('#annotations_block .' + type).hide();
          if(params[type]) {
            var update = {};
            update[type] = null
            Craiggers.Search.update({ params: update });
          }
        }

        function toggle(items) {
          _.each(items, show)
          _.each(_.difference(type, items), hide)
        }


        var parent = category;
        var type = ['bedrooms', 'cats', 'dogs'
                    , 'sqft'
                    , 'make', 'model', 'vin', 'start_year', 'end_year'
                    , 'age', 'personal_flavor'
                    , 'compensation', 'partTime', 'telecommute', 'contract', 'internship', 'nonprofit'];
        if(!Craiggers.Categories.isTopLevel(parent))
          parent = Craiggers.Categories.parentCode(category);

        switch(parent) {
          case 'RRRR':
            if($.inArray(category, ['RCRE', 'RLOT', 'RPNS']) == -1)
              toggle(type.slice(0, 4))
            else if (category !== 'RLOT')
              toggle(type.slice(3, 4));
            break;

          case 'VVVV': toggle(type.slice(4, 9)); break;
          case 'PPPP': toggle(type.slice(9, 11)); break;
          case 'JJJJ': toggle(type.slice(11, 17)); break;
          case 'all': toggle([]); break;
          default: _.each(type, hide); break;
        }
    },

    updateFromModel: function() {
      var params = Craiggers.Search.get('params');

      if ( params['title-only'] ) {
        this.$('.title-only').attr('checked', true);
      } else {
        this.$('.entire-post').attr('checked', true);
      }

      this.$('.has-image').attr('checked', !!params['has-image']);
      this.$('.has-price').attr('checked', !!params['has-price']);

      if ( params['start'] ) {
        var start = new Date(params['start']);
        var start_time = start.getTime()/1000 + start.getTimezoneOffset()*60;

        console.log(params['start']);

        start = new Date
        start.setTime(start_time*1000);

        console.log(start);
        this.$('#start_date').datepicker('setDate', start);
      }
      if ( params['end'] ){
        var end = new Date(params['end']);
        var end_time = end.getTime()/1000 + end.getTimezoneOffset()*60 + 86399;

        end = new Date
        end.setTime(end_time*1000)

        this.$('#end_date').datepicker('setDate', end);
      }

      var expand = _.any('title-only has-image start has-price'.split(' '), function(k) {
        return params[k]
      });

      this.updateAnnotations();
      return true //expand
    },

    updateParam: function(event) {
      var el = $(event.currentTarget);
      var param = el.attr('param');
      var val = el.is(':checked');
      var update = {};

      if ( param === 'entire-post' ) {
        update['title-only'] = false;
      } else {
        update[param] = val;
      }

      Craiggers.Search.update({ params: update });
      console.info('updateParam')
    },

    updateSelector: function (event) {
      console.info('updateSelector')
      var el = $(event.currentTarget),
          update = {};

      update[el.attr('name')] = el.val()
      Craiggers.Search.update({ params: update });
    },

    updateText: function (event) {
      var el = $(event.currentTarget),
          update = {};

      update[el.attr('name')] = el.val()
      Craiggers.Search.update({ params: update });
      if(event.keyCode == Craiggers.Util.KEY.ENTER){
        Craiggers.Search.set(SINGLE_SEARCH_DEFAULT_CONFIG)
        Craiggers.Search.set({ type_of_search: 'new_search' })
        Craiggers.Search.submit()
      }

      console.info('updateText')
    },

    updateCheckbox: function(event) {
      console.info('updateCheckbox')
      var el = $(event.currentTarget);
      var name = el.attr('name');
      var update = {};

      if(el.is(':checked')) update[name] = el.val();
      else update[name] = null;

      Craiggers.Search.update({ params: update });
    },

    updateDate: function(event) {
      console.info('updateDate')
      var params = {};
      var key = event.currentTarget.id.replace(/_date/, '');
      var date = $(event.currentTarget).datepicker('getDate');
      params[key] = $.datepicker.formatDate('yy-mm-dd', date);

      Craiggers.Search.update({ params: params });
    },

    clickDatepicker: function(e) {
      var id = e.currentTarget.id.slice(0, -6);
      $('#' + id).datepicker('show');
    },

  })
})