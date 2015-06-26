require "bundler/capistrano"
require "rvm/capistrano"

server "174.142.68.176", :web, :app, :db, primary: true

set :rails_env, 'production'
set :application, "jeboom"
set :deploy_to, "/home/jeboom/#{application}"
set :user, application
set :deploy_via, :remote_cache
set :use_sudo, false

set :unicorn_conf, "#{deploy_to}/current/config/unicorn.rb"
set :unicorn_pid, "#{deploy_to}/shared/pids/unicorn.pid"

set :scm, "git"
set :repository, "git@github.com:3taps/Craiggers-Plus.git"
set :branch, fetch(:b, "production")
set :rvm_ruby_string, '1.9.3-p392@global'
set :rvm_type, :user
set :keep_releases, 2

default_run_options[:pty] = true
ssh_options[:forward_agent] = false

# bundle settings
set :bundle_gemfile, "Gemfile"
set(:bundle_dir) { File.join(shared_path, 'bundle') }
set :bundle_flags, "--deployment --quiet"
set :bundle_without, [:development, :test]

namespace :deploy do
  task :symlink_shared do
    run "ln -nfs #{shared_path}/version.txt #{release_path}/version.txt"
    run "cd #{release_path} && bundle exec rake assets:clean RAILS_ENV=#{rails_env}"
    #run "echo 'var BASE_URL = \"http://api6.3taps.com\"' > #{release_path}/app/assets/javascripts/base_url.js"
  end
  task :restart do
    run "if [ -f #{unicorn_pid} ] && [ -e /proc/$(cat #{unicorn_pid}) ]; then kill -USR2 `cat #{unicorn_pid}`; else cd #{deploy_to}/current && bundle exec unicorn_rails -c #{unicorn_conf} -E #{rails_env} -D; fi"
  end
  task :start do
    run "bundle exec unicorn_rails -c #{unicorn_conf} -E #{rails_env} -D"
  end
  task :stop do
    run "if [ -f #{unicorn_pid} ] && [ -e /proc/$(cat #{unicorn_pid}) ]; then kill -QUIT `cat #{unicorn_pid}`; fi"
  end
end

after 'deploy:update_code' do
  deploy.migrate
#  run "cd #{release_path}; RAILS_ENV=#{rails_env} bundle exec rake craiggers:bump_version --trace"
#  run "cd #{release_path}; RAILS_ENV=#{rails_env} bundle exec rake assets:precompile --trace"
end

before 'deploy:assets:precompile', 'deploy:symlink_shared'
after "deploy", "deploy:cleanup" # keep only the last 5 releases