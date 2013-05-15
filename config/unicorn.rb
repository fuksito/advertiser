app_root = File.expand_path('../..', __FILE__)

listen app_root + "/tmp/unicorn.sock"
pid    app_root + "/tmp/unicorn.pid"

worker_processes 2
timeout 30

stderr_path app_root + "/log/unicorn.stderr.log"
stdout_path app_root + "/log/unicorn.stdout.log"
