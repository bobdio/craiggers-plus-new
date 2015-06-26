desc "run all craiggers tasks in order"
task :craiggers do
  puts "starting craiggers:generate:locations..."
  Rake::Task['craiggers:generate:locations'].invoke
  puts "starting craiggers:generate:categories..."
  Rake::Task['craiggers:generate:categories'].invoke
  puts "starting craiggers:add:nearby_locations..."
  Rake::Task['craiggers:add:nearby_locations'].invoke
  puts "starting craiggers:add_taps_codes..."
  Rake::Task['craiggers:add:taps_codes'].invoke
  puts "starting craiggers:add:latlons"
  Rake::Task['craiggers:add:latlons'].invoke
  puts 'craiggers init complete!'
end
