ENV['RACK_ENV'] ||= 'development'

require 'sinatra'
require File.expand_path('../config/boot',  __FILE__)

configure do
  set :views, "#{File.dirname(__FILE__)}/views"
  set :public_folder, "#{File.dirname(__FILE__)}/public"
end

get '/' do
  erb :index
end

get '/campaigns/new' do
  erb :index
end

get '/campaigns/:id' do
  erb :index
end

put '/campaigns/:id' do

  model = JSON.parse(params[:model])
  campaign = Campaigns.find(params[:id])
  if campaign.update_attributes(model)
    campaign.attributes.to_json
  else
    status 412
    campaign.errors.to_hash.to_json
  end
end

delete '/campaigns/:id' do
  Campaigns.find(params[:id]).destroy
end

get '/campaigns' do
  Campaigns.all.to_json
end

post '/campaigns' do

  model = JSON.parse(params[:model])
  campaign = Campaigns.new(model)
  if campaign.save
    campaign.attributes.to_json
  else
    status 412
    campaign.errors.to_hash.to_json
  end
end