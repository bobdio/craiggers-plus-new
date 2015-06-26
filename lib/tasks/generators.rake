require 'json'

namespace :craiggers do
  namespace :generate do

    desc "parses categories csv file and saves data into cat/subcat models"
    task :categories => :environment do

      puts "environment loaded"
      puts "starting..."

      puts "destroying current cats/subcats..."
      Cat.destroy_all
      Subcat.destroy_all
      
      puts "starting csv parse..."

      categories_data = JSON.parse(TapsConnector.categories,:symbolize_names => true)[:categories]

      parent_categories_data = categories_data.map {|record| {name: record[:group_name], code: record[:group_code]}}.uniq
      parent_categories_data.each do |parent_category_data|
        cat = Cat.new(parent_category_data) 
        cat.originate = 1 
        cat.save
      end

      parent_categories = Cat.all

      categories_data.each do |record|
        sub = Subcat.new
        sub.name = record[:name]
        sub.code = record[:code]
        sub.cat_id = parent_categories.select {|parent_category| parent_category.code == record[:group_code]}.first.id
        sub.originate = 1
        sub.save
      end
    end


    desc "parses locations csv file and saves data in location/loc1/loc2 models"
    task :locations => :environment do

      puts "environment loaded"
      puts "starting..."

      puts "destroying all current location data..."
      Location.destroy_all
      Loc1.destroy_all
      Loc2.destroy_all

      puts "starting csv parse..."
      File.open("#{Rails.root}/lib/locations/cl-locations-data.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
        # country/state/loc_1/location_1/url/loc_2/location_2/(blank)/Display City State/Display State
        unless Location.find_by_name(cols[1])
          location = Location.new
          location.name = cols[1]
          location.code = cols[8].match(/\w{2}$/)[0]
          location.save
          puts 'location >> ' + location.name.to_s + ' >> saved'
        end

        next if cols[2].blank? or cols[3].blank?

        location ||= Location.find_by_name(cols[1])
        unless location.loc1s.collect{ |l| l.name }.include?(cols[3])
          loc_1 = Loc1.new
          loc_1.name = cols[3]
          loc_1.code = cols[2]
          loc_1.location = location
          loc_1.save
          puts 'loc_1 >> ' + loc_1.name.to_s + ' >> saved'
        end

        next if cols[5].blank? or cols[6].blank?

        loc_1 ||= location.loc1s.select{ |l| l.name.eql?(cols[3]) }.first
        loc_2 = Loc2.new
        loc_2.name = cols[6]
        loc_2.code = cols[5]
        loc_2.loc1 = loc_1
        loc_2.save
        puts 'loc_2 >> ' + loc_2.name.to_s + ' >> saved'
      end
    end


    desc "parses locations csv file and saves data in loc1 models"
    task :locations => :environment do

      puts "environment loaded"
      puts "starting..."

      puts "destroying all current location data..."
      Location.destroy_all
      Loc1.destroy_all
      Loc2.destroy_all

      puts "starting csv parse..."
      File.open("#{Rails.root}/lib/locations/cl-locations-data.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
        # country/state/loc_1/location_1/url/loc_2/location_2/(blank)/Display City State/Display State
        unless Location.find_by_name(cols[1])
          location = Location.new
          location.name = cols[1]
          location.code = cols[8].match(/\w{2}$/)[0]
          location.save
          puts 'location >> ' + location.name.to_s + ' >> saved'
        end

        next if cols[2].blank? or cols[3].blank?

        location ||= Location.find_by_name(cols[1])
        unless location.loc1s.collect{ |l| l.name }.include?(cols[3])
          loc_1 = Loc1.new
          loc_1.name = cols[3]
          loc_1.code = cols[2]
          loc_1.location = location
          loc_1.save
          puts 'loc_1 >> ' + loc_1.name.to_s + ' >> saved'
        end

        next if cols[5].blank? or cols[6].blank?

        loc_1 ||= location.loc1s.select{ |l| l.name.eql?(cols[3]) }.first
        loc_2 = Loc2.new
        loc_2.name = cols[6]
        loc_2.code = cols[5]
        loc_2.loc1 = loc_1
        loc_2.save
        puts 'loc_2 >> ' + loc_2.name.to_s + ' >> saved'
      end
    end


    desc "parses neighborhoods csv file and saves data in neighborhood models"
    task :neighborhoods => :environment do

      puts "starting neighborhood parse/generate"
      puts "destroying all current neighborhood data"
      Neighborhood.destroy_all

      puts "parsing..."
      File.open("#{Rails.root}/lib/locations/cl-neighborhoods.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
        Neighborhood.create do |n|
          n.loc2_code = cols[0]
          n.code = cols[1]
          n.name = cols[2]
        end
        puts cols[2]
      end

      puts "neighborhoods successfully generated"

    end

  end

end
