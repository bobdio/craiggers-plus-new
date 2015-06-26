source 'https://rubygems.org'

gem 'rails', '3.2.9'

# Bundle edge Rails instead:
# gem 'rails', :git => 'git://github.com/rails/rails.git'

gem 'fusion_tables'

gem 'pg'
gem 'passenger'

gem 'google-api-client'

gem 'whenever'
gem 'mobile-fu'

#gem 'resque', :require => 'resque/server'

# Gems used only for assets and not required
# in production environments by default.
group :assets do
  gem 'memcache-client'
  gem 'sass-rails',   '~> 3.2.3'
  gem 'coffee-rails', '~> 3.2.1'
  gem 'jquery-ui-rails'
  gem 'handlebars_assets'
  gem 'jquery-fileupload-rails'

  # See https://github.com/sstephenson/execjs#readme for more supported runtimes
  gem 'therubyracer', :platforms => :ruby

  gem 'uglifier', '>= 1.0.3'
end

gem 'jquery-rails'

gem 'haml-rails'

group :development, :test do
  gem 'awesome_print'
  gem 'pry'
end

group :development do
  gem 'capistrano', :require => false
  gem 'rvm-capistrano', :require => false
  gem 'capistrano_mailer', github: 'devinfoley/capistrano_mailer'
end

gem 'omniauth'
gem 'hashie'
gem 'rest-client'
gem 'rmagick'
gem 'aws-s3', require: 'aws/s3'
gem 'supermodel', github: 'maccman/supermodel'

gem 'recaptcha', require: 'recaptcha/rails'

group :production do
  gem 'unicorn'
  gem 'god'
  gem 'tlsmail'
end

gem 'will_paginate', '~> 3.0'
