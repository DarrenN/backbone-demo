require "sinatra"
require "sinatra/reloader" if development?
require "json"
require "sequel"
require "pg"
require_relative "connection.rb"

# Simple JSON app for Backbone Demo.
#
# 1. Models, we don't need no stinkin' models!
# 2. SQLite3. No validations. HA!
# 3. Don't ever use this for anything other than demo.
# 4. You've been warned.

# Everything in JSON, it's what Backbone craves.
# Oh, and hook up the DB.
before do
	@db = Sequel.postgres(:host=>$pg[:host], :database=>$pg[:database], :user=>$pg[:username], :password=>$pg[:password], :sslmode => 'require')
	@ds = @db[:photos]
	content_type 'application/json'
end

# Stay DRY people, stay dry.
# We serve index.rb from a few routes, so make it a method
def serve_index
	content_type 'text/html' # this is not JSON.
	@photos = @ds.order(:title).all.to_json
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
	@photos = @db[:photos].order(:title).all.to_json
end

# Returns single photo
get '/photo/:id' do 
	row = @ds.filter(:id => params[:id]).first.to_json
	if row.empty?
		halt 500, {:response => 'fail'}.to_json
	end
	row[0].to_json
end

# Create a photo
post '/photo' do
	unless (@ds.insert([:link, :statigram, :title], params.values))
		halt 500, {:response => 'fail - could not save'}.to_json
	end
	{:response => 'success'}.to_json
end

# Update a photo with the new stuff. Stupidity ensues.
put '/photo/:id' do
	resp = JSON.parse(request.body.read)
	data = @ds.filter(:id => params[:id]).first.merge(resp) # < I'm with stupid!
	puts data
	unless (@ds.filter(:id => params[:id]).update(
		:link => data['link'],
		:statigram => data['statigram'],
		:title => data['title'],
		:comment => data['comment'],
		))
		halt 500, {:response => 'fail - could not save'}.to_json
	end
	{:response => 'success'}.to_json
end

# Delete record
delete '/photo/:id' do
	@ds.filter(:id => params[:id]).delete
	{:response => 'success'}.to_json
end

# Delete record
get '/slides' do
	content_type 'text/html' # this is not JSON.
	erb :slides
end