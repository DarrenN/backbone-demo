// Tell Underscore.js to use {{ Mustache }} style templates
_.templateSettings = {
  interpolate : /\{\{(.+?)\}\}/g
};

// Globals. Deal with it.
var Statigram = {},
	Photos,
	Workspace;

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
		this.$el.append(this.template(data));
	},

	events : {
		"click .button-comment" 	: "toggle_form",
		"click .button-delete"  	: "delete_photo",
		"click input[type=submit]" 	: "submit_comment"
	},

	// Fade-in/out the Comment form on each photo view
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

	// Send comment to server and change form label color depending on response
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
		collection.view.container.prepend(collection.view.$el).animate({ opacity : 1}, 2000);
	}
});

// Router - we handle our search feature here with Push State.
// Queries are passed up to the collection for filtering.
Statigram.Workspace = Backbone.Router.extend({
	routes : {
		"search/" : "search",
		"search/:query" : "search"
	},

	search : function(query) {
		Photos.search(query);
		$('#search').val(query);
	}
});

// Keep an eye on the search form and send queries to the Router.
// This is breaking the rules if you want to be "pure", but illustrates that this is
// all just JavaScript. So if you need to quickly attach an event on something you can
// do so rather easily and still talk to your Backbone-wired app. Ideally you would 
// make a view for search as part of an Über-view.
$('#search-submit').click(function(e){
	e.preventDefault();
	Workspace.navigate("search/" + $('#search').val(), {trigger: true});
});

// Launch the app by instantiating the Photos collection and resetting it
// with the JSON blob from the DB. Photos listens for a reset event and fires
// a render() on PhotoSheetView. We also start our Router to manage search queries.
Statigram.init = function(data) {
	Photos = new Statigram.Photos();
	Photos.reset(data);
	Workspace = new Statigram.Workspace();
	Backbone.history.start({ pushState : true });
};
