task :environment do
  
  if File.exist?('Gemfile')
    require 'bundler'
    Bundler.setup(:default)
  end

  require "#{ROOT_PATH}/config/boot.rb"

end