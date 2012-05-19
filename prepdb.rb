require "sqlite3"
require "json"

db = SQLite3::Database.new "./db/test.db"

rows = db.execute <<-SQL
  drop table photos;
SQL

rows = db.execute <<-SQL
  create table photos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    link text,
    statigram text,
    title varchar(255),
    comment text
  );
SQL

data = JSON.parse(File.read('../data/mecha.json'))

stmt = db.prepare "insert into photos (link, statigram, title, id) values ( ?, ?, ?, ? )"
data.each do |d|
  puts d.inspect
  stmt.execute d.values
end