set :stages, %w(staging dev production)
require 'capistrano/ext/multistage'
require './config/boot'