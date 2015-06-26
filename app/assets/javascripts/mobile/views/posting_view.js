var PostingView = BaseView.extend({

        el: "#accordion",

        template : JST["mobile/templates/posting"],

        headerTemplate : JST["mobile/templates/posting_results_header"],

        IMAGES_LIMIT : 5,

        render : function (prefix) {
            if (!prefix) {
                prefix = "";
            }
            var galleryHolderID = prefix + "gallery_holder_" + this.model.get("id");

            //render posting body and footer
            var templateData = {
                id: this.model.get("id"),
                href_id : "#"+this.model.get("id"),
                details_id : "details_" + this.model.get("id"),
                location_name : labelsUtils.generatePostingLocationLabel(this.model.get("location")),
                gallery_holder_id : galleryHolderID,
                icon_class : this.model.get('source').toLowerCase()
            }
                        
            this.$el.append(this.template(templateData));

            this.posting = $(this.$el.find("#"+this.model.get("id")));

            this.renderCategories();
            this.renderContact();

            //render posting header
            $(this.posting.find(".posting_header")).prepend(this.headerTemplate({
                id: this.model.get("id"),
                title: this.model.get("heading"),
                timeAgo : labelsUtils.generateTimeAgoLabel(this.model.get("timestamp")),
                price: labelsUtils.generatePriceLabel(this.model.get("price"), this.model.get("currency"))
            }));

            var postingTitle = $(this.posting.find(".postin_title"));
            if (postingTitle) {
                postingTitle.highlightQuery();
            }

            this.renderPostingImages(this.model, $(this.$el.find("#" +this.model.get("id") + " #gallery.gallery")), galleryHolderID, false, this.IMAGES_LIMIT);
            
            this.refreshImagesActivation();

            if (!app.models.syncModel.get('is_locations_synced')) {
                app.models.syncModel.once('change:is_locations_synced', $.proxy(this.refreshLocationLabel, this));
            } else {
                this.refreshLocationLabel();
            }

            this.model.get('location').once("location_udpated", $.proxy(this.refreshLocationLabel, this));
        },

        renderCategories : function () {
            var category = app.collections.categories.getCategoryByCode(this.model.get("category"));
            var parentCategoryElement = $(this.posting.find('.category_parent'));
            var parentCategoryNameElement = $(this.posting.find('.category_parent .category_name'));
            var subcategoryElement = $(this.posting.find('.sub_category'));
            var subcategoryNameElement = $(this.posting.find('.sub_category .category_name'));

            if (category) {
                
                var parentCategory = null;
                if (category.get("cat_id") !== 0) {
                    parentCategory = app.collections.categories.get(category.get("cat_id"));
                }

                if ((parentCategory !== null) && (parentCategory.get('name') !== "")) {
                    parentCategoryNameElement.html(parentCategory.get('name'));
                    parentCategoryElement.attr({id: parentCategory.get('code')});

                    subcategoryNameElement.html(category.get('name'));
                    subcategoryElement.attr({id: category.get('code')});
                } else {
                    parentCategoryNameElement.html(category.get('name'));
                    parentCategoryElement.attr({id: category.get('code')});
                }
                
            } else {
                parentCategoryNameElement.html(this.model.get("category"));
            }

            if (subcategoryNameElement.html() == "") {
                subcategoryElement.hide();
            }

        },

        renderContact : function () {
            var sourceAccount = this.model.getSourceAccount();
            var sourcePhone = this.model.getSourcePhone();
            var sourceAccountLink = "";
            var sourcePhoneLink = "";
            var contactLink = "";

            if (sourceAccount !== "") {
                sourceAccountLink = "mailto:" + sourceAccount;
                contactLink = sourceAccountLink;
            }
            if (sourcePhone !== "") {
                sourcePhoneLink = "tel:" + sourcePhone;
                contactLink = sourcePhoneLink;
            }

            if (contactLink == "") {
                this.posting.find('#contact_button').hide();
            } else {
                $(this.posting.find("#contact_button a")).attr('href', contactLink);
            }

            if ((sourceAccountLink !== "") && (sourcePhoneLink !== "")) {
                this.posting.find('#contact_button').addClass('selectable');
            }
        },

        refreshImagesActivation : function () {
            if (!this.galleryImages) {
                this.galleryImages = this.posting.find(".posting_gallery_image");
            }
            
            _.each(this.galleryImages, function (image, key) {
                var image = $(image);
                if (image.hasClass('disabled') && (image.offset().left < $(window).width())) {
                    image.removeClass('disabled');
                    var imageData = this.model.get('images')[key];
                    if (imageData) {
                        image.append(this.renderImage(imageData.full, this.model.get('id')));
                    }
                }
            }, this);
        },

        onGalleryScrollMove : function (event) {
        	this.refreshImagesActivation();
        },

        refreshLocationLabel : function () {
            var locationLabel = labelsUtils.generatePostingLocationLabel(this.model.get("location"));

            if (locationLabel !== "") {
                var price = $(this.posting.find(".price"));
                if (price.html() !== "") {
                    locationLabel = " - " + locationLabel;        
                } else {
                    price.hide();
                }
                $(this.posting.find(".location")).html(locationLabel);
            }
                
        }
});

_.extend(PostingView.prototype, PostingViewMixin.prototype);