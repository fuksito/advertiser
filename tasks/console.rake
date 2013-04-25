desc "Start IRB with all runtime dependencies loaded"

task :console => :environment do |t,args|

  dirs = ['lib'].select { |dir| File.directory?(dir) }

  original_load_path = $LOAD_PATH

  # add the project code directories
  $LOAD_PATH.unshift(*dirs)

  # clear ARGV so IRB is not confused
  ARGV.clear

  require 'irb'

  # set the optional script to run
  IRB.conf[:SCRIPT] = args.script
  IRB.start

  # return the $LOAD_PATH to it's original state
  $LOAD_PATH.reject! { |path| !(original_load_path.include?(path)) }
end