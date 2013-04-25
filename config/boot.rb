require "bundler"
require 'sinatra'
require "sinatra/json"

Bundler.require(:default, ENV['RACK_ENV'].to_sym)

ROOT_PATH = File.expand_path('../..', __FILE__)
$LOAD_PATH.unshift("#{ROOT_PATH}")

require 'lib/database'
