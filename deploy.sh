git pull origin dev
RAILS_ENV=production bundle exec rake assets:clean
RAILS_ENV=production bundle exec rake assets:precompile
cat $HOME/shared/pids/unicorn.pid | xargs kill
sleep 1
RAILS_ENV=production bundle exec rake db:migrate && RAILS_ENV=production bundle exec rake craiggers:bump_version && bundle exec unicorn_rails -c config/unicorn.rb -E production -D


