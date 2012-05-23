require "sinatra"
require "sinatra/reloader" if development?
require "json"
require "sqlite3"

# Simple JSON app for Backbone Demo.
#
# 1. Models, we don't need no stinkin' models!
# 2. SQLite3. No validations. HA!
# 3. Don't ever use this for anything other than demo.
# 4. You've been warned.

# Everything in JSON, it's what Backbone craves.
# Oh, and hook up the DB.
before do
	@db = SQLite3::Database.new "./db/test.db"
	@db.results_as_hash = true
	content_type 'application/json'
end

# Stay DRY people, stay dry.
# We serve index.rb from a few routes, so make it a method
def serve_index
	content_type 'text/html' # this is not JSON.
	@photos = @db.execute2( "select * from photos" ).drop(1).to_json
	erb :index
end

# Return all items in DB to template for bootstrappin'
get '/' do
	serve_index
end

# Handle a /search route (client uses pushState)
get '/search' do
	serve_index
end

# Really? REALLY? I have to brute force the slash?!
get '/search/' do
	serve_index
end

# Handle a /search route (client uses pushState)
get '/search/:query' do
	serve_index
end

# Send the whole shebang down
get '/photos' do
	@photos = @db.execute2( "select * from photos" ).drop(1).to_json
end

# Returns single photo
get '/photo/:id' do 
	row = @db.execute2("select * from photos where id=?", params[:id]).drop(1)
	if row.empty?
		halt 500, {:response => 'fail'}.to_json
	end
	row[0].to_json
end

# Create a photo
post '/photo' do
	unless (@db.execute2("insert into photos (link, statigram, title) values (?, ?, ?, ?)", params.values))
		halt 500, {:response => 'fail - could not save'}.to_json
	end
	{:response => 'success'}.to_json
end

# Update a photo with the new stuff. Stupidity ensues.
put '/photo/:id' do
	resp = JSON.parse(request.body.read)
	data  = @db.execute2("select * from photos where id=?", params[:id]).drop(1)[0].merge(resp) # < I'm with stupid!
	unless (@db.execute2("update photos set link = ?, statigram = ?, title = ?, comment = ? where id = ?", 
		data['link'],
		data['statigram'],
		data['title'],
		data['comment'],
		data['id']).count > 0)
		halt 500, {:response => 'fail - could not save'}.to_json
	end
	{:response => 'success'}.to_json
end

# Delete record
delete '/photo/:id' do
	@db.execute2("delete from photos where id = ?", params[:id])
	{:response => 'success'}.to_json
end

# Delete record
get '/slides' do
	content_type 'text/html' # this is not JSON.
	erb :slides
end