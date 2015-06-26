namespace :craiggers do
  namespace :get do
    desc "get all resources"
    task :resources=>[:environment, :taps_categories, :taps_locations, :taps_sources]

    desc "categories from xls"
    task :categories => :environment do
      f = Excel.new("/tmp/categories.xls")
      f.default_sheet = f.sheets.first
      i = 2
      while 1 do
        break unless f.cell(i, 'A')
        cat = Cat.where(code: f.cell(i, 'A')).first_or_create(
          originate: 1,
          name: f.cell(i, 'B'),
          group: f.cell(i, 'B'),
          code: f.cell(i, 'A')
        )
        subcat = Subcat.create(
          originate: 1,
          name: f.cell(i, 'D'),
          group: f.cell(i, 'D'),
          code: f.cell(i, 'C'),
          category: f.cell(i, 'B'),
          cat_id: cat.id
        )
        p cat.name + ' ' + subcat.name.to_s
        i += 1
      end
    end

    desc "get taps categories"
    task :taps_categories => :environment do
      categories=ActiveSupport::JSON.decode(TapsConnector.categories)
      cat = Cat.from_taps
      subcat = Subcat.from_taps
      cat.each{ |item| item.destroy } unless cat.nil?
      subcat.each{ |item| item.destroy } unless subcat.nil?
      categories.each do |category|
        cat = Cat.create(
            :originate => 1,
            :name => category["categoryClassName"],
            :group => category["categoryClassName"],
            :code => category["categoryClass"]
        )

        #Cat.create(category.merge({:originate => 1, :name =>  category["group"]  }))
        category["categories"].each do |sub|
          Subcat.create(
              :originate => 1,
              :name => sub["categoryName"],
              :category => cat.name,
              :code => sub["category"],
              :cat_id => cat.id
          )
        end
        #Subcat.create!(category.merge({:originate => 1, :name => category["category"], :cat_id => Cat.find_by_group(category["group"]).id  }))
      end
    end

    desc "get taps locations"
    task :taps_locations => :environment do
      Location.delete_all

      Location.create!({ full_name: 'All Locations',
                        short_name: 'All Locations',
                        code: 'all',
      })

      [{
        :name => 'Canada',
        :code => 'CAN'
      },{
        :name => 'United States',
        :code => 'USA'
      }].each do |country|
        Location.create!({
          :short_name => country[:name],
          :full_name => country[:name],
          :code => country[:code],
          :level => 'country'
        })
      end

      levels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality', 'zipcode']
      levels.each_index do |i|
        base_level = levels[i]
        next_level = levels[i+1]

        return unless next_level

        p '===================================='
        p "#{base_level} <- #{next_level}"
        p '------------------------------------'

        used_locations = [] # try exclude some locations

        Location.where(level: base_level).each do |parent|
          unless locations_data = TapsConnector.location_list(next_level, base_level, parent.code)
            p 'Bad request!'
            next
          end
          locations = ActiveSupport::JSON.decode(locations_data)['locations']
          locations.each do |location|
            Location.where(code: location['code'])
                    .first_or_create({ full_name: location["full_name"],
                                       short_name: location["short_name"],

                                       bounds_max_lat: location["bounds_max_lat"],
                                       bounds_max_long: location["bounds_max_long"],
                                       bounds_min_lat: location["bounds_min_lat"],
                                       bounds_min_long: location["bounds_min_long"],

                                       level: next_level,
                                       parent: parent
            })
          end

          used_locations << locations
        end


        levels[0...i].reverse_each do |base|
          p "#{base} <- #{next_level}"

          Location.where(level: base).each do |parent|
            unless locations_data = TapsConnector.location_list(next_level, base, parent.code)
              p 'Bad request!'
              next
            end
            locations = ActiveSupport::JSON.decode(locations_data)['locations']
            locations = locations - used_locations
            locations.each do |location|
              Location.where(code: location['code']).first_or_create({
                full_name: location["full_name"],
                short_name: location["short_name"],

                bounds_max_lat: location["bounds_max_lat"],
                bounds_max_long: location["bounds_max_long"],
                bounds_min_lat: location["bounds_min_lat"],
                bounds_min_long: location["bounds_min_long"],

                level: next_level,
                parent: parent
              })
            end
          end
        end

        p '===================================='
      end
    end

    desc "get taps sources"
    task :taps_sources => :environment do
      Source.destroy_all
      Source.create code: 'CRAIG', name: 'Craigslist'
      # Source.create!(ActiveSupport::JSON.decode(TapsConnector.sources))
    end
  end
end
