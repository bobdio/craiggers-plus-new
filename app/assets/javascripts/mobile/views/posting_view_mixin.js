/**
* This mixin module contains view methods for rendering postings views
*/

var PostingViewMixin = (function() {
        var module = function () {};

        _.extend(module.prototype, {
            renderPostingHeader : function (headerContainer, posting) {
                var defaultContactText = "Contact: See posting for details";
                var sourceAccount = posting.getSourceAccount();
                var sourcePhone = labelsUtils.getPhoneNumberLabel(posting.getSourcePhone());
                var price = labelsUtils.generatePriceLabel(posting.get("price"), posting.get("currency"));

                var headerTemplate = JST["mobile/templates/posting_header"];

                var templateData = {
                    id: posting.get("id"),
                    source_account_name : sourceAccount,
                    source_account_link : "mailto:" + sourceAccount,
                    source_phone : sourcePhone,
                    source_phone_link : "tel:" + posting.getSourcePhone(),
                    icon_class : posting.get('source').toLowerCase(),
                    title: posting.get("heading"),
                    price: price
                }

                headerContainer.prepend(headerTemplate(templateData));

                if ((sourceAccount == "") || (_.isNull(sourceAccount))) {
                    $(headerContainer.find(".source-account")).html(defaultContactText);
                }

                if ((sourcePhone == "") || (_.isNull(sourcePhone))) {
                    $(headerContainer.find(".source_phone")).html(sourcePhone);
                    var sourceInfo = $(headerContainer.find(".source_info"));
                    sourceInfo.addClass('no_contact_info');
                }

                if (price == "") {
                    $(headerContainer.find(".price")).hide();
                }

                var postingTitle = $(headerContainer.find(".postin_title"));
                if (postingTitle) {
                    postingTitle.highlightQuery();
                }
                    
            },

            renderImage : function (imageURL, id) {
                var img = $(document.createElement("div"));

                img.attr({
                    style: 'background:#d8dce6 url(' + imageURL + ') no-repeat center;display: inline-block; width:310px;height:232px; background-size: cover',
                    role: "img",
                    class: "posting_image",
                    data: id
                });

                return img;
            },
            /**
            * Renders posting images. If images length > 0 will be added isroll into gallery
            * activateSlideShow {{Boolean}} in case of true renders photoswipe gallery
            * imagesLimit {{Number}} shows how many images should be added into gallery. all images will be added if imagesLimit
            * has no value
            */
            renderPostingImages : function (posting, gallery, galleryHolderID, activateSlideShow, imagesLimit) {
                var images = posting.get("images");
                var self = this;
                if (images.length > 0) {
                    if ((imagesLimit) && (images.length > imagesLimit)) {
                        images = images.splice(0, imagesLimit);
                    }
                    //set width of the gallery accroding to images number
                    gallery.attr({style :'width:'+ images.length*320 +'px'});
                    _.each(images, function(image, key) {
                        var div = $(document.createElement("div"));
                        div.attr({class: "posting_gallery_image", data: posting.get('id')});

                        if (activateSlideShow) {
                            var a = $(document.createElement("a"));
                            a.attr("href", image.full);
                            a.append(this.renderImage(image.full, posting.get('id')));
                            div.append(a);
                        } else {
                            div.addClass('disabled');
                        }

                        gallery.append(div);

                    }, this);

                    if (images.length > 1) {
                        this.getScroller(galleryHolderID, {
                            vScroll : false,
                            onBeforeScrollStart: function ( e ) {
                                if ( this.absDistX > (this.absDistY) ) {
                                    // user is scrolling the x axis, so prevent the browsers' native scrolling
                                    e.preventDefault();
                                }
                   			},
                   			onScrollMove : function (event) {
                   				if (self.onGalleryScrollMove) {
                   					self.onGalleryScrollMove(event);	
                   				}
						    }
                   		});
                    }

                    if (activateSlideShow) {
                        var options = {};
                        $(gallery.find("a")).photoSwipe(options);
                    }
                        
                } else {
                    $("#"+galleryHolderID).hide();
                }
            }
        })

        return module;
}());