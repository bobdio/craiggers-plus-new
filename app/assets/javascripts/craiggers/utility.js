// extend underscore a bit
_.mixin({

  isDefined: function(obj) {
    !_.isUndefined(obj);
  },

  isPresent: function(obj) {
    !_.isEmpty(obj);
  },

  commatizeNumber: function(num) {
    num = (num + '').replace(',', '');

    var parts = num.split('.');
    var dec = '';
    if ( parts.length === 2 ) {
      num = parts[0];
      dec = parts[1];
    } else if ( parts.length === 1 ) {
      num = parts[0];
    } else {
      // more than 2 parts?! let's just ignore all '.'s then
      num = parts.join('');
    }

    var commatized = '';
    for ( var i = num.length - 1, j = 1; i > 0; --i, j++ ) {
      commatized = num.charAt(i) + commatized;
      if ( j % 3 == 0 ) {
        commatized = ',' + commatized;
      }
    }
    commatized = num.charAt(0) + commatized;

    if ( dec.length ) commatized = commatized + '.' + dec;

    return commatized;
  },

  cacheBuster: function() {
    return new Date().getTime();
  },

  trim: function(str) {
    return str.replace(/^\s*|\s*$/g,'');
  },

  tic: function(name) {
    var s = window.STOPWATCH || [];
    s.push({
      name: name,
      time: new Date().getTime()
    });
    window.STOPWATCH = s;
  },

  toc: function() {
    var s = window.STOPWATCH;
    if ( !s.length )
      throw 'missing tic for toc';

    var t = s.pop();
    var diff = new Date().getTime() - t.time;
    console.log((s.name || 'tictoc') + ': ' + diff);
  },

  // see http://api.jquery.com/focus/#dsq-comment-body-56821668
  focus: function(x) {
    var el;
    if ( x instanceof jQuery ) {
      el = x;
    } else if ( _.isString(x) ) {
      el = $(x);
    } else {
      throw 'expecting jquery selector or jquery object';
    }
    setTimeout(function() { el.focus(); }, 20);
  },

  capitalize: function(str, allwords) {
    if ( allwords ) {
      var words = str.split(' ');
      return _.map(words, function(word) {
        return _.capitalize(word);
      }).join(' ');
    } else {
      return str.charAt(0).toUpperCase() + str.slice(1);
    }
  }

});

_.extend(Backbone.Model.prototype, {
  // TODO: get rid of this

  one: function(ev, callback) {
    ev = ev + '.1';
    var calls = this._callbacks || (this._callbacks = {});
    var list  = this._callbacks[ev] || (this._callbacks[ev] = []);
    list.push(callback);
    return this;
  },

  trigger: function(ev) {
    var list, calls, i, l;
    if ( !(calls = this._callbacks) ) return this;
    list = (calls[ev] || []).concat(calls[ev + '.1'] || []);
    if ( list.length ) {
      for ( i = 0, l = list.length; i < l; i++ ) {
        list[i].apply(this, Array.prototype.slice.call(arguments, 1));
      }
      // unbind events that are only to be fired once
      this.unbind(ev + '.1');
    }
    if ( list = calls['all'] ) {
      for ( i = 0, l = list.length; i < l; i++ ) {
        list[i].apply(this, arguments);
      }
    }
    return this;
  }

});

_.extend(Craiggers.Util, {

  KEY: {
    UP: 38,
    DOWN: 40,
    J: 74,
    K: 75,
    F: 70,
    ESC: 27,
    S: 83,
    '/': 191,
    ENTER: 13,
    LEFT: 37,
    RIGHT: 39,
    Z: 90,
    H: 72,
    L: 76,
    TAB: 9
  },

  // http://37signals.com/svn/posts/1557-javascript-makes-relative-times-compatible-with-caching
  DateHelper: {
    // Takes the format of "Jan 15, 2007 15:45:00 GMT" and converts it to a relative time
    // Ruby strftime: %b %d, %Y %H:%M:%S GMT
    // TODO this don't work quite right derp
    //time_ago_in_words_with_parsing: function(from) {
      //var date = new Date;
      //date.setTime(Date.parse(Date(from)));
      //return this.time_ago_in_words(date);
    //},

    time_ago_in_words: function(from) {
      return this.distance_of_time_in_words(new Date, from);
    },

    distance_of_time_in_words: function(to, from) {
      var distance_in_seconds = (to - from) / 1000;
      var distance_in_minutes = Math.floor(distance_in_seconds / 60);

      if ( distance_in_minutes == 0 ) { return 'less than a min'; }
      if ( distance_in_minutes == 1 ) { return '1 min'; }
      if ( distance_in_minutes < 45 ) { return distance_in_minutes + ' mins'; }
      if ( distance_in_minutes < 120 ) { return '1 hour'; }
      if ( distance_in_minutes < 1440 ) { return Math.floor(distance_in_minutes / 60) + ' hours'; }
      if ( distance_in_minutes < 2880 ) { return '1 day'; }
      if ( distance_in_minutes < 43200 ) { return Math.floor(distance_in_minutes / 1440) + ' days'; }
      if ( distance_in_minutes < 86400 ) { return '1 month'; }
      if ( distance_in_minutes < 525960 ) { return Math.floor(distance_in_minutes / 43200) + ' months'; }
      if ( distance_in_minutes < 1051199 ) { return '1 year'; }

      return 'over ' + Math.floor(distance_in_minutes / 525960) + ' years';
    },

    formatTimestamp: function(date) {
      if(!date) return '';

      var hours = date.getHours(),
          minutes = date.getMinutes(),
          ampm = hours >= 12 ? 'PM' : 'AM';

      hours = hours % 12;
      hours = hours ? hours : 12;
      minutes = minutes < 10 ? '0'+minutes : minutes;

      var time = hours + ':' + minutes + ampm;
      var timezone = /\((.*)\)$/.exec(date)[1]
      date = $.datepicker.formatDate('yy-mm-dd', date)

      return  date + ' ' + time + ' ' + timezone;
    }
  }

});


(function($) {

  $.fn.stripFontColor = function() {

    return this.each(function() {
      $(this).find('font').attr('color', '');
    });

  };

  $.fn.targetBlankifyLinks = function() {

    return this.each(function() {
      $(this).find('a').each(function() {
        $(this).attr('target', '_blank');
      });
    });

  };

  $.fn.highlightQuery = function(q) {

    var query = q || Craiggers.Search.get('query') || '';
    if ( !query ) return this;
    // pull out phrases
    var phrases = _.compact(query.match(/".+"/g) || []);
    // get rid of the quotes
    query = query.replace(/".+"/g, '');
    // pull out remaining words
    var words = _.compact(query.split(' ') || []);
    // remove special words
    words = _.reject(words, function(word) {
      return _.include(['or', 'and'], word.toLowerCase());
    });
    // ?! remove everything after 'not' keyword
    var not = words.indexOf('not');
    if ( not > -1 ) words = words.slice(0, not);
    // words only
    var hoptions = { wordsOnly: true };

    return this.each(function() {

      var el = $(this);

      _.each(phrases, function(phrase) {
        el.highlight(phrase.replace(/^"|"$/g, ''), hoptions);
      });

      _.each(words, function(word) {
        el.highlight(word, hoptions);
      });

    });

  };

})(jQuery);

if ( !window.console ) {
  window.console = {
    log: function() { },
    warning: function() { },
    error: function() { },
  };
};

Date.formatThreeTaps = function(date) {
  return [
    date.getFullYear(),
    '/',
    zeroFill((date.getMonth() + 1), 2),
    '/',
    zeroFill(date.getDate(), 2),
    ' ',
    zeroFill(date.getHours(), 2),
    ':',
    zeroFill(date.getMinutes(), 2),
    ':',
    zeroFill(date.getSeconds(), 2)
  ].join('')

  function zeroFill(number, width) {
    width -= number.toString().length;
    if ( width > 0 ) {
      return new Array(width + (/\./.test(number) ? 2 : 1)).join('0') + number;
    }
    return number;
  }
};
