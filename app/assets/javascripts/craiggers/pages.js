Craiggers.Pages = {

  clear: function() {
    new Craiggers.Views.PostingDetail().hideThenClose();
    $('.page', '#container').hide();
    $(document).scrollTop(0);
    $.fancybox.close();
  },

  setSearchbarPosition: function() {
    var searchbar = $('#searchbar');
    if ( !searchbar.is(':visible') ) {
      searchbar.show();
    } else {
      searchbar.css({ 'top': '50%' });
      searchbar.find('.content').removeClass('expandable').css({ 'width': '960px' });
      searchbar.find('.location .input, .category .input').css({ 'margin-left': '6px', 'width': '180px' });
      searchbar.find('.query .input').css({ 'width': '200px' });
      searchbar.find('.query.wrapper').css({ 'margin-left': '95px' });
      searchbar.find('input.search').css({ 'margin-left': '10px' });
      searchbar.find('.geolocate').show();
      searchbar.find('.query').show();
      searchbar.find('.category').show();
      searchbar.find('.location').show();
      searchbar.find('.search').removeattr('disabled');
    }
    $('#searchbar').find('.query .input').focus();
    return true;
  },

  setSigninoutPosition: function() {
    // 2011-11-23 12:55 Author: Igor Novak
    //
    // this prevents shifting signinout block in navbar
    // when scrollbar appears
    //
    // probably, there is a better solution

    if ( $('#searchbar').is(':visible') ) {
      // landing page
      $('.signinout').css('width', '160px')
    } else {
      // results page
      $('.signinout').css('width', 160 - scrollbarWidth() + 'px')
    }

    function scrollbarWidth() {
      var div = $('<div style="height:50px;position:absolute;top:-200px;left:-200px;"><div></div></div>'); 
      // Append our div, do our calculation and then remove it 
      $('body').append(div);
      div.css('overflow', 'scroll');
      div.css('width', '50px');
      var w2 = $('div', div).width();
      $(div).remove();
      return 50 - w2
    }
  },

  Root: Backbone.View.extend({

    el: $('#root.page'),

    events: {
        'keydown #searchbar_query_input': 'keydownSearchbar',
        'click .advanced a': 'togleAdvanced'
    },

    initialize: function() {
      this.advanced = false

      Craiggers.Pages.clear();
      $('.input').val('').blur();
      $('.location-path').html('');
      Craiggers.Search = new Craiggers.Models.Search();
      new Craiggers.Views.SearchBar();
      Craiggers.Pages.setSearchbarPosition();
      $('#navbar').show().removeClass('search posting').addClass('root');
      this.el.show();
      Craiggers.Pages.setSigninoutPosition();
      $('#searchbar').find('.query .input').focus();
    },

    keydownSearchbar: function(e) {
      if (e.keyCode === Craiggers.Util.KEY.TAB) {
        $("#searchbar input[type='submit']").focus()
        e.preventDefault();
      }
    },

    togleAdvanced: function(e) {
      var link = $(e.currentTarget)
      var form = link.parent().parent()

      if(this.advanced){
        form.find('.location').hide()
        form.find('.category').hide()
        link.html('advanced search')
      }
      else
      {
        form.find('.location').show()
        form.find('.category').show()
        link.html('hide')
      }
      this.advanced = !this.advanced
    }

  }),

  Posting: Craiggers.Views.PostingContent.extend({

    el: $('#posting.page'),

    events: {
      'click .contact a': 'emailClicked'
    },

    initialize: function(options) {
      this.postkey = options.postkey;
      Craiggers.Pages.clear();
      Craiggers.Pages.setSearchbarPosition();
      $('#navbar').show().removeClass('search root').addClass('posting');
      this.el.empty().show();

      this.housingCode = 'hhh';
      this.jobsCode = 'jjj';

      var posting = Craiggers.Postings.get(this.postkey);
      if ( posting ) {
        this.render(posting);
        return;
      }

      var el = this.el,
          view = this;

      $.ajax({
        url: BASE_URL + '/search?sourceId=' + this.postkey + '&' + AUTH_TOKEN,
        dataType: 'jsonp',
        success: function(data, textStatus, jqXHR) {
          if ( data.code ) {
            el.html(data.message);
            return;
          } if ( Craiggers.Locations.extractCode ) {
            // for jeboom
            var loc = Craiggers.Locations.extractCode(data);
            Craiggers.Locations.nameByCode(loc, function(data) {
              view.$('.location').html(JST['locations-tagrow']({
                locations: Craiggers.Locations.extractLocationsList(data.location)
              }));
            })
          };
          view.model = new Craiggers.Models.Posting(data);
          view.render();
        },
      });
    },

    render: function() {
      var posting = this.model;
      var params = _.extend(posting.toJSON(), this.shareParams());
      this.el.html(JST['posting-detail'](params)).stripFontColor();

      // show message me link if we've got a phone number
      if (params.annotations.original_phone) {
        var number = parseInt(params.annotations.original_phone.replace(/[^0-9]/g, ''));
        if (number && number.toString().length > 9) {
          number = number.toString(36);
          var label = params.heading.replace(/[^a-zA-Z 0-9]/g, '').replace(/ /g, '');
          label = label.substr(0, 15).toLowerCase();
          this.$('#message-me').attr('href', 'http://messageme.anoni.com/n/' + number + '/l/' + label).show();
          //mixpanel.track('MessageMe Link Viewed');
        }
      }

      this.highlightAnnotations();
      this.$('.heading, .annotations').highlightQuery();
      this.initImages(posting);
      if ( !posting.get('images').length )
        this.$('.images').hide();

      this.$('.favorite').hide();
    },

    emailClicked: function(event) {
      if ($('#message-me').is(':visible')) {
        mixpanel.track('Email Preferred', null, function() {
          location.href = 'mailto:' + $(event.target).html()
        });
      }
      return false;
    }

  })

};
