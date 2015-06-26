namespace :craiggers do
  task :bump_version => :environment do
    f = File.open('version.txt')
    data = f.read
    version = data.to_i
    f.close
    f = File.open('version.txt', 'w')
    f.write(version + 1)
    f.close
  end
end
