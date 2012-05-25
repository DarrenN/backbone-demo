#!/usr/bin/env ruby
require "sequel"
require "json"

db = Sequel.connect(ENV['PG']);

db.create_table!(:photos) do
    primary_key :id
    String :link, :text => true
    String :statigram, :text => true
    String :title
    String :comment, :text => true
end

data = JSON.parse(File.read('../public/data/mecha.json'))

data.each do |d|
  db[:photos].insert([:link, :statigram, :title], d.values)
end