namespace :craiggers do
  namespace :add do


    desc "parses nearby locations csv file and saves nearby location codes to location models"
    task :nearby_locations => :environment do

      File.open("#{Rails.root}/lib/nearby/US_States.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
        location = Location.find_by_code(cols[1])
        #location.nearby = cols[2..(cols.count-1)].reject{ |n| n.empty? }.join("|")
        location.save
      end

    end


    desc "parses taps codes csv file and saves 3taps codes to loc1 models"
    task :taps_codes => :environment do

      puts "adding loc_1 taps_codes"

      File.open("#{Rails.root}/lib/locations/cl-locations-tapscodes.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }

        loc_1 = Loc1.find_by_code(cols[5])
        if loc_1
          loc_1.taps_code = cols[0]
          loc_1.save
        else
          puts "missing #{cols[5]}"
        end
      end

      puts "loc_1s parsed / saved"
      puts "adding location taps_codes"

      Location.all.each do |location|
        #location.taps_code = location.code + 'Z'
        location.save
      end

      puts "taps_codes added, task complete"

    end


    desc "parses latlon csv file and saves latlon values to loc1 models"
    task :latlons => :environment do

      puts "adding loc_1 latlons"

      File.open("#{Rails.root}/lib/locations/cl-locations-tapscodes-latlon.csv", 'r').each_line do |row|
        cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }

        loc_1 = Loc1.find_by_code(cols[5])
        if loc_1
          loc_1.latlon = cols[14] + "," + cols[15]
          loc_1.save
        else
          puts "missing #{cols[5]}"
        end
      end

      puts "loc_1s latlons parsed / saved"

    end


  end
end
