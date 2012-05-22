## Simple BackboneJS app for use in demo at Arc90

### Dependencies:

* Ruby - http://www.ruby-lang.org/en/
* SQLite3 - http://sqlite.org/

### Install server:

I've setup a little Sinatra server to handle the backend for the demo. This interfaces with a SQLite DB for persistence. There is a [Bundler](http://gembundler.com/) Gemfile present to install dependencies for you. So let's install Bundler and our dependencies:

```bash
$ gem install bundler
$ bundle install
```

**Optional** - I like to use [Thin](http://code.macournoyer.com/thin/) as my dev server, but you don't have to, Sinatra will use WebBrick by default. If you want to use Thin then just `$ gem install thin`.

### Setup ze DB

The DB is part of the Repo, so if you have SQLite3 installed you can just go. There is a little Ruby script called `prepdb.rb` that will reload the DB to its default state whenever you want (say, after you've deleted a bunch of photos or something.) So you could run that now with `$ ruby prepdb.rb` just to make sure everything is working.

### Launch server

`$ ruby server.rb`

And then point your browser to `http://127.0.0.1:4567`

**BOOM!**