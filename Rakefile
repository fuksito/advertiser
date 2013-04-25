require 'rake'
ENV['RACK_ENV'] ||= 'development'
ROOT_PATH = File.expand_path('..', __FILE__)
$LOAD_PATH.unshift("#{ROOT_PATH}/lib")
Dir["#{File.dirname(__FILE__)}/tasks/**/*.rake"].sort.each { |ext| load ext }