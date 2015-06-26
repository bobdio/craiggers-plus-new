Craiggers.Views.PostingDetail = Craiggers.Views.PostingContent.extend({

  el: $('#detail'),

  events: {
    'click .favorite': 'favorite',
    'click .close': 'close',
    'click .email': 'sharePopup',
    'click .location .tag': 'updateAndSearchLocation',
    'click .category .tag': 'updateAndSearchCategory',
    'click .annotations .annotag': 'updateAndSearchAnnotation',
    'click .button': 'showDialog',
    'click .link': 'showDialog',
    'mouseenter .details-popup-holder': 'showDetailsPopup',
    'mouseleave .details-popup-holder': 'hideDetailsPopup',
    'click .local_posting_actions .delete_posting': 'deletePosting',
    'click .local_posting_actions .edit_posting': 'editPosting',
    'click .local_posting_actions .repost_posting': 'repostPosting',
    // 'click .contact a': 'emailClicked'
  },

  deletePosting: function(){
    if (confirm('Are you sure you want to delete this posting?')) {
      Craiggers.LocalPostings.remove(this.model);
    }
  },

  editPosting: function() {
    new Craiggers.Views.PostingEdit({model: this.model});
  },

  repostPosting: function(){
    new Craiggers.Views.PostingEdit({model: this.model, mode: 'repost'});
  },

  initialize: function() {
    this.view = this.$('.view');
    this.content = this.$('.content');
    if( !this.model ) return;

    var detail = this;

    this.model.bind('change:favorited', function() {
      detail.checkFavorited()
    });

    // TODO: refactoring (take codes from somewhere else)
    this.housingCode = this.model.get('housingCode');
    this.jobsCode = this.model.get('jobsCode');
  },

  checkFavorited: function() {
    if(this.model.get('favorited'))
      this.$('.favorite').addClass('favorited');
    else
      this.$('.favorite').removeClass('favorited');
  },

  resize: function(){
    var setSize = function (diff) {
      $('#detail').css({'max-width': $('#container').width() - diff})
      $('#detail').css({'min-width': $('#container').width() - diff})
    }

    setTimeout(function() {
      if (Craiggers.drawerOpen)
        setSize(Craiggers.postingsMode == 'favorites' ? 612 : 802);
      else
        setSize(Craiggers.postingsMode == 'favorites' ? 442 : 652);
    }, 300)
  },

  render: function() {
    var detail = this,
        model = this.model,
        postKey = model.get('id');

    Craiggers.Search.update({
      params: _.extend( Craiggers.Search.get('params'), { postKey: postKey })
    });
    if(Craiggers.postingsMode == 'search'){
      Craiggers.currentPostingDetail = this.model
    }  else {
      Craiggers.currentFavoriteDetail = postKey
    }
      
    Craiggers.Controller.saveLocation(Craiggers.Search.get('url'))
    
    detail.el.show().css('opacity', '0').animate({
      opacity: 1
    }, 800, function(){})

    var params = _.extend(model.toJSON(), detail.shareParams())

    // TODO: need check
    if(model.get('location') && !model.get('location').country)
      params.show_annotations_locations_tag = true

    detail.content.html(JST['posting-detail'](params))

    var shown_postings = Craiggers.Search.get('postings') || {}
    var postings_by_id = shown_postings[model.id]

    if (postings_by_id){
      postings_by_id.annotations = postings_by_id.annotations || {}
      model.set(Craiggers.Util.get_hash_for_settings_posting_model(postings_by_id))
    }

    _gaq.push(['_trackPageview', '/view'])

    if(!model.get('body')) {
      detail.$('.body').text('loading...')
      $.ajax({
        url: BASE_URL + '/?id=' + model.id + '&' + AUTH_TOKEN,
        dataType: 'json',
        data: Craiggers.Postings.params,
        success: function(response) {
          model.set(Craiggers.Util.get_hash_for_settings_posting_model(response.postings[0]))
          detail.postRender()
        }
      })
    } else {
      detail.postRender()
    }

    detail.resize();
    detail.view.show()

    var id = model.get('id')
    if ( Craiggers.visited[id] ) {
      Craiggers.visited.trigger && Craiggers.visited.trigger('visitTwice');
    } else {
      Craiggers.visited[id] = true;
    }


    $('.content_without_footer').height($('.content_without_footer').height() - $('.publicdomain_and_powered').height())
    // set fancybox behaviour for fancybox links
    $(".fancybox_image").fancybox({
      type: 'image',
      openEffect  : 'none',
      closeEffect : 'none',
      cyclic: true 
    });
    if ($('img.main').width() > $('img.main').height()){
      $('img.main').crop({
        width: 400,
        height: 300,
        controls: false,
        loading: ''
      });
    }
    //TODO: comment section - need refactoring
    if ( !model.get('supportComments') )
      return

    detail.refreshComments();
    if ( Craiggers.commentRefreshIntervalID != 9999 ) {
      clearInterval(Craiggers.commentRefreshIntervalID);
      Craiggers.commentRefreshIntervalID = 9999;
    }

    Craiggers.commentRefreshIntervalID = setInterval(function() {
      detail.refreshComments();
    }, 45000);
  },

  postRender: function() {
    var model = this.model
        detail = this;

    annotations = model.get('annotations')

    if(price = model.get('price'))
      model.set({ format_price: Craiggers.Util.commitize_price(price) })

    model.set({ source_account: annotations['source_account'] })

    if(phone = annotations.phone){
      if(phone.length == 10)
        phone = phone.replace(/(\d{3})(\d{3})(\d{4})/, '($1) $2-$3');
      else
        phone = phone.replace(/(\d{3})(\d{4})/, '$1-$2');
      annotations['format_phone'] =  phone
    } else {
      annotations['format_phone'] = ''
    }

    var checkboxes = 'cats dogs telecommute contract internship partTime nonprofit'.split(' ');
    _.each(checkboxes, cleanAnnotations)


    var params = _.extend(model.forTemplate(), detail.shareParams());
    _.extend(params, annotations);
    detail.content.html(JST['posting-detail-complete'](params));
    detail.highlightAnnotations();
    detail.$('.heading, .annotations').highlightQuery();

    if( (code = Craiggers.Locations.deepCode(model.get('location'))) && !model.get('locations') )
      Craiggers.Locations.nameByCode(code, function(data){
        detail.content.find('.location').html(
          JST['locations-tagrow']({
            locations: Craiggers.Locations.extractLocationsListS(data)
          })
        );
        Craiggers.Views.PostingContent.prototype.highlightLocations();
      })
    else
        Craiggers.Views.PostingContent.prototype.highlightLocations();

    detail.initImages(model);
    if ( model.get('images').length == 0 ) {
      detail.$('.images').hide();
    };
    ( !detail.$('.body').text() ) && detail.$('.body').hide();
    detail.$('.body').stripFontColor().highlightQuery().targetBlankifyLinks();

    function cleanAnnotations (type) {
      if(annotations[type] != 'YES' && annotations[type] != 'ON') 
        delete(annotations[type])
    }
  },

  close: function() {
    Craiggers.Search.update({
      params: _.extend(
        Craiggers.Search.get('params'),
        {postKey: ''}
      )
    });

    Craiggers.Controller.saveLocation(Craiggers.Search.get('url'));

    if(Craiggers.postingsMode == 'search')
      Craiggers.currentPostingDetail = null;
    else
      Craiggers.currentFavoriteDetail = null;

    //TODO: comment section - need refactoring
    if ( Craiggers.commentRefreshIntervalID != 9999 ) {
      clearInterval(Craiggers.commentRefreshIntervalID);
      Craiggers.commentRefreshIntervalID = 9999;
    }

    this.hideThenClose();
  },

  hideThenClose: function() {
    $('#postings .posting').removeClass('selected');
    this.view.hide();
    this.el.hide();
  },

  favorite: function(event) {
    event.stopImmediatePropagation();

    var favorited = !this.$('.favorite').hasClass('favorited');
    this.model.setFavorited(favorited);
  },

  // emailClicked: function(event) {
  //   if ($('#message-me').is(':visible')) {
  //     mixpanel.track('Email Preferred', null, function() {
  //       location.href = 'mailto:' + $(event.target).html()
  //     });
  //   }
  //   return false;
  // },

  refreshComments: function(event) {
    return false; // disabling
    var current = this;
    $.ajax({
      url: '/posting/comments?postKey=' + this.model.get('id'),
      dataType: 'json',
      success: function(data) {
        $('.view-comments').html('');
        if ( Craiggers.currentPostingDetail != current.model.get('id') )
          return

        for (i in data) {
          Craiggers.Users.findOrCreate(data[i].commenterID);
          var current_parent = data[i].parentID;
          data[i].timestamp = Craiggers.Util.DateHelper.time_ago_in_words(
            new Date(data[i].timestamp.replace(/-/g, '/'))
          );
          data[i].text = data[i].text.replace(/\+/g, ' ').replace(/(%0D)?%0A/g, '\n');
          if ( current_parent ) {
            var reply = JST['reply-comment-view']({ comments : data[i] });
            if ( $('#comment-view-' + current_parent).is('.flagged-comment') ) {
              reply.addClass('flagged-comment');
            }
            $('#comment-view-' + current_parent).append(reply);
          } else {
            if ( data[i].flagTypeID ) {
              data[i].flag = current.flagReasonName(data[i].flagTypeID);
              $('.view-comments').append(JST['root-flag-comment-view']({
                comments : data[i]
              }));
            } else {
              $('.view-comments').append(JST['root-comment-view']({
                comments : data[i]
              }));
            }
          }
        }

        // apply alternating style
        $('.comment-view', '#detail').each(function(a) {
          if ( a % 2 ) $(this).addClass('even');
        });
      }
    });
    return false;
  },

  flagReasonName: function (flagcode) {
    switch(flagcode) {
      case 1:
        return "Miscategorized"
      case 2:
        return "Not my posting"
      case 3:
        return "Deceptive Offering"
      case 4:
        return "Obscene Offering"
      case 5:
        return "Illegal Offering"
      case 6:
        return "Stolen Goods"
      case 7:
        return "Posting attached to the wrong or unauthorized identity"
      case 8:
        return "Other"
    }
  },

  fancybox: function(params) {
    $.fancybox({
      autoDimensions: false,
      centerOnScroll: true,
      content: JST['comment-popup'](params),
      enableEscapeButton: true,
      height: content,
      hideOnOverlayClick: false,
      showCloseButton: true,
      width: 480
    });
  },

  showDialog: function(event) {
    event.stopImmediatePropagation();
    if ( !Craiggers.User.attributes.signedin ) {
      new Craiggers.Views.Dialog('must_sign_in');
      return;
    };

    var target = $(event.target);
    var curposting = this;
    var postKey = this.model.get('id');

    if ( target.is('.flag') ) {
      this.showFlagDialog(curposting, postKey)
    } else if ( target.is('.comment') ) {
      this.showCommentDialog(curposting, postKey)
    } else if ( target.is('.link') ) {
      this.replyToComment(curposting, postKey, target)
    };

    return false;
  },

  showFlagDialog: function(curposting, postKey) {
    var params = {
      title: 'Flag posting',
      subtitle: curposting.model.get('heading'),
      heading: curposting.model.get('heading'),
      type: 'flag'
    };
    var current_posting = this;
    this.fancybox(params);

    $('#flag_comment').focus();

    // set the events for flag form
    $('form', '#comment-posting').submit(function(e) {
      e.preventDefault();
      var self = $(this);
      var currentposting = $('.posting.selected');
      var params = self.serialize() + '&postKey=' + postKey;
      if ( $('#flag_code').val() != "Pick a reason" ) {
        var form_data = self.serializeArray();
        $('.view-comments').append(JST['root-flag-comment-view']({
          comments : {
            flag: current_posting.flagReasonName(parseInt(form_data[0].value)),
            id: 'xx',
            credit: Craiggers.User.get('username'),
            timestamp: 'less than a min',
            text: form_data[1].value
          }
        }));
        $.fancybox.close();
        $.ajax({
          url: '/posting/comment?' + params,
          success: function(data) {
            currentposting.addClass('flagged');
            current_posting.refreshComments();
          },
          error: function() {
            alert("You must be signed in to do that");
          }
        });
        return false;
      } else {
        new Craiggers.Views.Alert("Please pick a reason");
      }
    });
    return false;
  },

  replyToComment: function(curposting, postKey, target) {
    var commentId = target.attr('id');
    var params = {
      title: 'Reply to',
      subtitle: $('.comment-text', '#comment-view-' + commentId).first().text(),
      heading: curposting.model.get('heading'),
      type: 'text'
    };

    this.fancybox(params);
    this.setCommentFormEvent(curposting, postKey, commentId);
  },

  showCommentDialog: function(curposting, postKey) {
    var params = {
      title: 'New comment',
      heading: curposting.model.get('heading'),
      type: 'text'
    };

    this.fancybox(params);
    this.setCommentFormEvent(curposting, postKey);
  },

  setCommentFormEvent: function(curposting, postKey, commentId) {
    $('#flag_code').remove();
    $('#text_comment').focus();
    var current_posting = this;
    $('form', '#comment-posting').submit(function(e) {
      e.preventDefault();
      var self = $(this);
      var currentposting = $('.posting.selected');
      if ( $('#text_comment').val() ) {
        var form_data = self.serializeArray();
        var comment = {
          id: 'xx',
          credit: Craiggers.User.get('username'),
          timestamp: 'less than a min',
          text: form_data[0].value
        };
        var params = self.serialize() + '&postKey=' + postKey;
        if ( commentId ) {
          var reply = JST['reply-comment-view']({
            comments : comment
          });
          if ( $('#comment-view-' + commentId).hasClass('flagged-comment') ) {
            reply.addClass('flagged-comment');
          }
          $('#comment-view-' + commentId).append(reply);
          params += '&parentID=' + commentId;
        } else {
          $('.view-comments').append(JST['root-comment-view']({
            comments : comment
          }));
        }
        $.fancybox.close();
        $.ajax({
          url: '/posting/comment?' + params,
          success: function() {
            var commentCount = parseInt(curposting.model.get('commentCount')) + 1;
            commentCount += (commentCount == 1) ? ' comment': ' comments';
            curposting.model.set({
              'commentCount': commentCount
            });
            currentposting.find('.numcomments').html(commentCount);
            current_posting.refreshComments();
          }
        });
      } else {
        new Craiggers.Views.Alert("Please enter a comment");
      }
      return false;
    });
  },

  showDetailsPopup: function(event) {
    var $target = $(event.currentTarget);
    if ( !$target.find('.user-details-popup').length ) {
      var user = Craiggers.Users.get($target.data('uid'));
      if ( !user ) {
        // 2011-10-26 17:01 Author: Igor Novak
        // TODO: impove behavior
        //   the error is occured when user data is not yet loaded
        //   consider calling this in callback
        //   (or just reduce ajax requests number)
        $(this.el).find('.user-details-popup').hide();
        return;
      }

      user.bind('change', renderDetailsPopup);
      renderDetailsPopup();
    };
    $target.find('.user-details-popup').show();

    function renderDetailsPopup() {
      var html = ich['user-details-popup'](user.toJSON());
      $target.append(html);
    };
  },

  hideDetailsPopup: function() {
    $(this.el).find('.user-details-popup').hide();
  },

  showLocalPosting: function(localPostingId){
    view = this
    $.get("postings/"+localPostingId+"/show_view", function(data, status, xhr) {
      $("#detail .content").html(data);
      $("#detail").css('display', 'block');
      $("#detail .view").css('display', 'block');
    });
  }
});
