// Tell Underscore.js to use {{ Mustache }} style templates
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

// Yes, Globals. Deal with it.
var Statigram = {},
	Photos;

// Model - we explicitly create a new view for every model
Statigram.Photo = Backbone.Model.extend({
	initialize : function() {
		this.view = new Statigram.PhotoView({
			model : this
		});
		this.view.render();
	}
});

// Collection - stores a group of Models
Statigram.Photos = Backbone.Collection.extend({
	url   : '/photo',
	model : Statigram.Photo,

	initialize : function() {
		this.view = new Statigram.PhotoSheetView();
		this.view.collection = this; // Give view a reference to this collection
		this.on("reset", this.view.render, this); // Pass collection to render()
	},

	// Find phots by title and fade out non-matches.
	search : function(term) {
		var regex = new RegExp(term, "i");
		this.each(function(photo){
			if (!regex.test(photo.get('title'))) {
				photo.view.$el.fadeTo('fast', 0.25);
			} else {
				photo.view.$el.fadeTo('fast', 1);
			}
		});
	}
});

// View - individual Photos. Magick happens here.
Statigram.PhotoView = Backbone.View.extend({
	tagName   : 'li',
	className : 'photo',

	initialize : function() {
		this.template = _.template($('#tpl_photo').html());
	},

	render : function() {
		var data = this.model.attributes;
		// Null vals show up in form so we need to manually nuke. *boom*
		if (data.comment === null) {
			data.comment = '';
		}
		this.$el.append(this.template(this.model.attributes));
	},

	events : {
		"click .button-comment" : "toggle_form",
		"click .button-delete"  : "delete_photo",
		"click input[type=submit]" : "submit_comment"
	},

	toggle_form : function(e) {
		e.preventDefault();
		if (this.options.form_state !== 1) {
			this.options.form_state = 1;
			this.$('.photo-form').fadeIn('fast');
			this.$('.button-comment').css({ color : "#333" });
		} else {
			this.options.form_state = 0;
			this.$('.photo-form').fadeOut('fast');
			this.$('.button-comment').css({ color : "#999" });
		}
	},

	delete_photo : function(e) {
		e.preventDefault();
		this.model.destroy({
			success : function(model, response) {
				model.view.$el.fadeOut('fast');
			},
			error : function(model, response) {
				model.view.$('h1').css({
					color : "#f00"
				});
			}
		});
	},

	submit_comment : function(e) {
		e.preventDefault();
		this.model.save({comment : this.$('textarea').val()},{
			success : function(model, response) {
				model.view.$('label').
				css({ color : 'green' }).
				html('Comment saved!');
			},
			error : function(model, response) {
				model.view.$('label').
				css({ color : 'red' }).
				html('Could not save commemnt');
			}
		});
	}
});

// View - container for individual PhotoViews
Statigram.PhotoSheetView = Backbone.View.extend({
	tagName : 'ul',
	initialize : function () {
		this.container = $('#photos');
	},

	// Assemble PhotoViews from Photos reference and insert into container.
	// We stash all of the PhotoViews into PhotoSheetView.$el (ul) and then
	// insert $el into container (#photos)
	render : function(collection) {
		collection.models.forEach(function(model){
			collection.view.$el.append(model.view.$el);
		});
		collection.view.container.prepend(collection.view.$el);
	}
});

// Keep an eye on the search form and send queries to Collection
$('#search-submit').click(function(e){
	e.preventDefault();
	Photos.search($('#search').val());
});

// Launch the app by instantiating the Photos collection and resetting it
// with the JSON blob from the DB. Photos listens for a reset event and fires
// a render() on PhotoSheetView
Statigram.init = function(data) {
	Photos = new Statigram.Photos();
	Photos.reset(data);
};
