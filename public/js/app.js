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
	model      : Statigram.Photo,
	initialize : function() {
		this.view = new Statigram.PhotoSheetView();
		this.view.collection = this; // Give view a reference to this collection
		this.on("reset", this.view.render, this); // Pass collection to render()
	}
});

// View - individual Photos
Statigram.PhotoView = Backbone.View.extend({
	tagName : 'li',
	render  : function() {
		this.$el.append(this.model.get('statigram'));
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

// Launch the app by instantiating the Photos collection and resetting it
// with the JSON blob from the DB. Photos listens for a reset event and fires
// a render() on PhotoSheetView
Statigram.init = function(data) {
	Photos = new Statigram.Photos();
	Photos.reset(data);
};
