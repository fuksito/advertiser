server 'fuksito.com', :web, :app, :db, :primary => true

set :default_environment, { 'PATH' => "/var/lib/gems/1.9.1/bin/:$PATH" }

require 'bundler/capistrano'

set :user, 'deployer'
set :application, 'advertiser'
set :repository, 'https://github.com/fuksito/advertiser.git'
set :brach, 'master'
set :deploy_to, "/home/#{user}/apps/#{application}"
set :use_sudo, false
set :deploy_via, :remote_cache

set :shared_children, %w(db)

default_run_options[:pty] = true

set :normalize_asset_timestamps, false # rails stuff, not needed

namespace :deploy do

  # task :restart do
  #   run "if [ -f #{unicorn_pid} ]; then kill -USR2 `cat #{unicorn_pid}`; else cd #{current_path} && bundle exec unicorn -c #{unicorn_conf} -E #{rack_env} -D; fi"
  # end

  task :start do
    # run "cd #{current_path} && bundle exec unicorn -c #{unicorn_conf} -E #{rack_env} -D"
    run "cd #{current_path} && bundle exec ruby ./server.rb -p 5000"
  end

  task :restart do
    start
  end

  # task :stop do
  #   run "if [ -f #{unicorn_pid} ]; then kill -QUIT `cat #{unicorn_pid}`; fi"
  # end

end