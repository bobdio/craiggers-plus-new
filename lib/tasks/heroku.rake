namespace :heroku do
  desc "Deploy app to heroku"
  task :deploy do
    puts "Compiling assets..."
    system "jammit"

    puts "\nCommiting changes..."
    system "git commit -am 'Compress assets'"

    puts "\nIncrementing app version..."

    system "git fetch --tags"
    app_version = `git describe $(git rev-list --tags --max-count=1)`.succ
    puts "New version: #{app_version}"
    today = Time.now.strftime "%d %B %Y"
    system "git tag -a -m 'Deployed #{today}.' #{app_version}"
    system "git push --tags"

    puts "\nPushing..."
    system "git push heroku master"

    puts "\nVersioning..."
    system "heroku config:add APP_VERSION=#{app_version}"

    puts "\nDone"
  end
end
