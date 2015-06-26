namespace :sqlite do
  desc "Create shared/db path"
  task :create_shared_db_dir do
    run "mkdir -p #{deploy_to}/#{shared_dir}/db"
  end
  after "deploy:setup", "sqlite:create_shared_db_dir"
end