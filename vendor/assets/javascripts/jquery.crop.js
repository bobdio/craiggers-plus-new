/* jQuery-crop v1.0.0, based on jWindowCrop v1.0.0
 * Copyright (c) 2012 Tyler Brown
 * Modified by Adrien Gibrat
 * Licensed under the MIT license.
 */
( function ( $ ) {
  var namespace = 'crop' // IE sucks
      , plugin  = function ( image, options ) {
      var self = this;
      $.extend( this.options, options );
      this.$image = $( image ).wrap( '<div class="' + namespace + 'Frame"/>' ) // wrap image in frame;
      this.$frame = this.$image.parent();
      this.$image
        .hide() // hide image until loaded
        .addClass( namespace + 'Image' )
        .data( namespace, this )
        .on( 'mousedown.' + namespace, function ( event ) {
          event.preventDefault(); //some browsers do image dragging themselves
          $( document )
            .on( 'mousemove.' + namespace, {
              mouse : {
                x   : event.pageX
                , y : event.pageY
              }
              , image : {
                x   : parseInt( self.$image.css( 'left' ), 10 )
                , y : parseInt( self.$image.css( 'top' ), 10 )
              }
            }, $.proxy( self.drag, self ) )
            .on( 'mouseup.' + namespace, function () {
              $( document ).off( '.' + namespace )
            } );
        } )
        .on( 'load.' + namespace, function () {
          if ( ! self.width ) {
            self.width  = self.$image.width();
            self.height = self.$image.height();
          }
          if ( self.width ) {
            var widthRatio    = self.options.width / self.width
              , heightRatio = self.options.height / self.height
            ;
            if ( widthRatio >= heightRatio )
              self.minPercent = self.width < self.options.width ?
                self.options.width / self.width : 
                widthRatio
              ;
            else
              self.minPercent = self.height < self.options.height ?
                self.options.height / self.height :
                heightRatio
              ;
            self.focal = { x : Math.round( self.width / 2 ), y : Math.round( self.height / 2 ) };
            self.zoom( self.minPercent );
            self.$image.fadeIn(200); //display image now that it has loaded
          }
        } )
        .load(); // init even if image is already loaded
      this.$frame
        .css( { width : this.options.width, height : this.options.height } )
        .append( this.options.loading )
        .hover(function(){self.$frame.toggleClass('hover');});
      if ( this.options.controls !== false )
        this.$frame
          .append( $( '<div/>', { 'class' : namespace + 'Controls' } )
            .append( $( '<span/>' ).append( this.options.controls ) )
            .append( $( '<a/>', { 'class' : namespace + 'ZoomIn' } ).on( 'click.' + namespace, $.proxy( this.zoomIn, this ) ) )
            .append( $( '<a/>', { 'class' : namespace + 'ZoomOut' } ).on( 'click.' + namespace, $.proxy( this.zoomOut, this ) ) )
          );
    }
  ;
  $[ namespace ] = $.extend( plugin
  , {
    prototype : {
      width     : 0
      , height  : 0
      , result  : {}
      , percent : null
      , options : {
        width      : 320
        , height   : 180
        , zoom     : 10
        , loading  : 'Loading...'
        , controls : 'Click to drag'
      }
      , zoom    : function ( percent ) {
        this.percent = Math.max( this.minPercent, Math.min( 1, percent ) );
        this.$image.width( Math.ceil( this.width * this.percent ) );
        this.$image.css( { 
          left  : plugin.fill( - Math.round( this.focal.x * this.percent - this.options.width / 2 ), this.$image.width(), this.options.width )
          , top : plugin.fill( - Math.round( this.focal.y * this.percent - this.options.height / 2 ), this.$image.height(), this.options.height )
        } );
        this.update();
      }
      , drag  : function ( event ) {
        this.$image.css( {
          left  : plugin.fill( event.data.image.x + event.pageX - event.data.mouse.x, this.$image.width(), this.options.width )
          , top : plugin.fill( event.data.image.y + event.pageY - event.data.mouse.y, this.$image.height(), this.options.height )
        } );
        this.update();
      }
      , zoomIn  : function () {
        return !! this.zoom( this.percent + ( 1 - this.minPercent ) / ( this.options.zoom - 1 || 1 ) );
      }
      , zoomOut : function () {
        return !! this.zoom( this.percent - ( 1 - this.minPercent ) / ( this.options.zoom - 1 || 1 ) );
      }
      , update  : function () {
        this.focal = {
          x   : Math.round( ( this.options.width / 2 - parseInt( this.$image.css( 'left'), 10 ) ) / this.percent )
          , y : Math.round( ( this.options.height / 2 - parseInt( this.$image.css ('top' ), 10 ) ) / this.percent )
        };
        this.$image.trigger( $.Event( 'crop', this.result = {
          cropX     : - Math.floor( parseInt( this.$image.css( 'left' ), 10 ) / this.percent )
          , cropY   : - Math.floor( parseInt( this.$image.css( 'top' ), 10 ) / this.percent )
          , cropW   : Math.round( this.options.width / this.percent )
          , cropH   : Math.round( this.options.height / this.percent )
          , stretch : this.minPercent > 1
        } ) );
      }
    }
    // ensure that no gaps are between target's edges and container's edges
    , fill    : function ( value, target, container ) { 
      if ( value + target < container )
        value = container - target;
      return value > 0 ? 0 : value;
    }
  } );

  $.fn[ namespace ] = function ( options ) {
    return this.each( function () {
      new plugin( this, options );
    } );
  };

} )( jQuery );


/*! Copyright (c) 2011 Brandon Aaron (http://brandonaaron.net)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Thanks to: http://adomas.org/javascript-mouse-wheel/ for some pointers.
 * Thanks to: Mathias Bank(http://www.mathias-bank.de) for a scope bug fix.
 * Thanks to: Seamus Leahy for adding deltaX and deltaY
 *
 * Version: 3.0.6
 * 
 * Requires: 1.2.2+
 */

(function($) {

var types = ['DOMMouseScroll', 'mousewheel'];

if ($.event.fixHooks) {
    for ( var i=types.length; i; ) {
        $.event.fixHooks[ types[--i] ] = $.event.mouseHooks;
    }
}

$.event.special.mousewheel = {
    setup: function() {
        if ( this.addEventListener ) {
            for ( var i=types.length; i; ) {
                this.addEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = handler;
        }
    },
    
    teardown: function() {
        if ( this.removeEventListener ) {
            for ( var i=types.length; i; ) {
                this.removeEventListener( types[--i], handler, false );
            }
        } else {
            this.onmousewheel = null;
        }
    }
};

$.fn.extend({
    mousewheel: function(fn) {
        return fn ? this.bind("mousewheel", fn) : this.trigger("mousewheel");
    },
    
    unmousewheel: function(fn) {
        return this.unbind("mousewheel", fn);
    }
});


function handler(event) {
    var orgEvent = event || window.event, args = [].slice.call( arguments, 1 ), delta = 0, returnValue = true, deltaX = 0, deltaY = 0;
    event = $.event.fix(orgEvent);
    event.type = "mousewheel";
    
    // Old school scrollwheel delta
    if ( orgEvent.wheelDelta ) { delta = orgEvent.wheelDelta/120; }
    if ( orgEvent.detail     ) { delta = -orgEvent.detail/3; }
    
    // New school multidimensional scroll (touchpads) deltas
    deltaY = delta;
    
    // Gecko
    if ( orgEvent.axis !== undefined && orgEvent.axis === orgEvent.HORIZONTAL_AXIS ) {
        deltaY = 0;
        deltaX = -1*delta;
    }
    
    // Webkit
    if ( orgEvent.wheelDeltaY !== undefined ) { deltaY = orgEvent.wheelDeltaY/120; }
    if ( orgEvent.wheelDeltaX !== undefined ) { deltaX = -1*orgEvent.wheelDeltaX/120; }
    
    // Add event and delta to the front of the arguments
    args.unshift(event, delta, deltaX, deltaY);
    
    return ($.event.dispatch || $.event.handle).apply(this, args);
}

})(jQuery);
