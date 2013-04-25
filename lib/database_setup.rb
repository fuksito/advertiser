require 'active_record'
require 'active_support/core_ext'

dbconf = YAML::load(File.open("config/#{ENV['RACK_ENV']}.yml"))  
ActiveRecord::Base.establish_connection(dbconf)
ActiveRecord::Base.include_root_in_json = false

unless ActiveRecord::Base.connection.tables.include? ('campaigns')
  ActiveRecord::Migration.class_eval do
    create_table :campaigns do |t|
      t.string  :title
      t.datetime :starts_at
      t.datetime :ends_at
      t.string :time_zone
      t.text :data
    end
  end
end