require "sequel"
require "json"
require_relative "connection.rb"

db = Sequel.postgres(:host=>$pg[:host], :database=>$pg[:database], :user=>$pg[:username], :password=>$pg[:password], :sslmode => 'require')

db.create_table!(:photos) do
    primary_key :id
    String :link, :text => true
    String :statigram, :text => true
    String :title
    String :comment, :text => true
end

data = JSON.parse(File.read('public/data/mecha.json'))

data.each do |d|
  db[:photos].insert([:link, :statigram, :title], d.values)
end