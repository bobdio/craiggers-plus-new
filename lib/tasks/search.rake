require 'google/api_client'

namespace :search do
  desc "search update"
  task :update => :environment do
    SavedSearch.where(send_notifications: true).each do |search|
      options = ActiveSupport::JSON.decode search.json
      params = options['params']
      params['rpp'] = 1
      params['timestamp'] = options['timestamp'] || (Time.now - 1.hour).to_i
      time_now = Time.now.to_i
      next unless results = TapsConnector.search(params, time_now)
      hash = ActiveSupport::JSON.decode results
      if hash['num_matches'] > 0
        params['rpp'] = hash['num_matches']
        results = TapsConnector.search(params, time_now)
        hash = ActiveSupport::JSON.decode results
        options['headings'] = hash['postings'].collect{|posting| posting['heading']}
        #options['extra']['url'] += "&timestamp=#{options['timestamp']}..#{time_now}"
        if index = options['extra']['url'].index('timestamp')
          options['extra']['url'] = options['extra']['url'][0...index-1]
        end
        SearchMailer.search_update(search, hash['num_matches'], options).deliver
        options['timestamp'] = time_now
      end
      json = ActiveSupport::JSON.encode options
      search.json = json
      search.save
    end
  end

  desc "update fusion table"
  task :fusion => :environment do
    #mins = [0, 15, 30, 45]

    Time.zone = 'America/Los_Angeles'
    time_now = Time.zone.now.beginning_of_hour
    min = Time.now.min
    #if min > 45
    #  min = 45
    #else
    #  if min > 40
    #    min = 40
    #  else
    #    if min > 20
    #      min = 20
    #    else
    #      min = 0
    #    end
    #  end
    #end

    #time_now = time_now + min.minutes
    time_now = time_now.to_i #- 7 * 3600 # PDT -7

    params = {
      retvals: 'location',
      rpp: 1,
      page: 0,
      timestamp: (time_now - 3599).to_s,
      country: 'USA'
    }
    params.stringify_keys!
    results = TapsConnector.search(params, time_now)
    hash = ActiveSupport::JSON.decode results

    array = []

    while hash['num_matches'].nil?
      results = TapsConnector.search(params, time_now)
      hash = ActiveSupport::JSON.decode results
    end

    p hash['num_matches']

    if hash['num_matches'] > 0
      (hash['num_matches'] / 100.0).ceil.times do |i|
        params = {
          retvals: 'heading,external_url,location,annotations',
          rpp: 100,
          page: i,
          timestamp: (time_now - 3599).to_s,
          country: 'USA'
        }
        params.stringify_keys!
        results = TapsConnector.search(params, time_now)
        hash = ActiveSupport::JSON.decode results
        while hash['postings'].nil?
          p hash['error'] if hash['error']
          results = TapsConnector.search(params, time_now)
          hash = ActiveSupport::JSON.decode results
        end

        array += hash['postings'].inject([]) do |a, result|
          link = "<a href='#{result['external_url']}' target='_blank'>#{result['heading']}</a>"
          #link = link_to result['heading'], result['external_url']
          a << {
              "Number" => 1,
              "Title" => link,
              "Location" => (result['location']['lat'].to_s || '') + ',' + (result['location']['long'].to_s || ''),
              "Neighborhood" => result['annotations']['source_neighborhood'] || ''
              #"Date" => Time.at(result['timestamp']).utc.to_s
          }
          a
        end

      end

      array.sort! do |a, b|
        a['Location'] <=> b['Location']
      end

      array2 = array.inject([array[0]]) do |map, a|
        if map.last['Location'] == a['Location']
          map.last['Title'] += '<br/>' + a['Title']
          #map.last['Date'] += ',<br/>' + a['Date']
          map.last['Number'] += 1
          map.last['Neighborhood'] += '<br/>' + a['Neighborhood']
        else
          map << a
        end
        map
      end

      p array2.size

      body = array2.inject([]) do |map, a|
        map << a['Number'].to_s + ';' + a['Title']  + ';' + a['Location'] + ';' + a['Neighborhood']
      end.join("\n")
      body.gsub!(/[\\\"]/,'') # getting quotes out of body

      p body.length

      @ft = GData::Client::FusionTables.new
      @ft.clientlogin('marat.kamenschikov@gmail.com', '')
      table = @ft.show_tables[0]
      table.truncate!
      #table.insert(array2)

      client = Google::APIClient.new
      key = Google::APIClient::PKCS12.load_key(GOOGLE_KEY, 'notasecret')
      service_account = Google::APIClient::JWTAsserter.new(
          '36014280275@developer.gserviceaccount.com',
          'https://www.googleapis.com/auth/fusiontables',
          key
      )
      client.authorization = service_account.authorize
      fusion = client.discovered_api('fusiontables', 'v1')

      t = client.execute(
          :headers => {'Content-Type' => 'application/octet-stream'},
          #:api_method => fusion.table.import_rows,
          :uri => 'https://www.googleapis.com/upload/fusiontables/v1/tables/1xMGaeChsHytKxK3Pc42YmQ7vTExGni5et82VkuQ/import',
          :http_method => :post,
          :parameters => {
              #:tableId => '1xMGaeChsHytKxK3Pc42YmQ7vTExGni5et82VkuQ',
              :delimiter => ";",
              #:delimiter => "~",
              :isStrict => false
          },
          :body => body
      )
      p t.data

    end

  end

  task :fusion_hours => :environment do
    @ft = GData::Client::FusionTables.new
    @ft.clientlogin('marat.kamenschikov@gmail.com', '')
    table = @ft.show_tables[0]

    time = 1364900400

    1.times do |j|

      #time_now = Time.now.to_i
      params = {
          retvals: 'location',
          rpp: 1,
          page: 0,
          state: 'USA-CA',
          timestamp: (time + (j*3600 + 1)).to_s
      }
      params.stringify_keys!
      results = TapsConnector.search(params, time + (j+1)*3600)
      hash = ActiveSupport::JSON.decode results

      array = []

      if hash['num_matches'] > 0
        p "getting #{hash['num_matches']} postings"
        (hash['num_matches'] / 100.0).ceil.times do |i|
          params = {
              retvals: 'location',
              rpp: 100,
              page: i,
              state: 'USA-CA',
              timestamp: (time + (j*3600 + 1)).to_s
          }
          params.stringify_keys!
          results = TapsConnector.search(params, time + (j+1)*3600)
          hash = ActiveSupport::JSON.decode results

          array += hash['postings'].inject([]) do |a, result|
            a << {
                "Text" => result['heading'] || '',
                "URL" => result['external_url'] || '',
                "Location" => (result['location']['latitude'].to_s || '') + ',' + (result['location']['longitude'].to_s || ''),
                "Date" => Time.at(result['timestamp']).utc
            }
            a
          end

        end

        p "adding #{array.size} records for #{j}th hour"
        table.insert(array)

        #for result in hash['postings']
        #  table.insert [{
        #                    "Text" => result['heading'],
        #                    "Number" => '1',
        #                    "Location" => result['location']['latitude'].to_s + ',' + result['location']['longitude'].to_s,
        #                    #"Latitude" => result['location']['latitude'],
        #                    #"Longitude" => result['location']['longitude'],
        #                    "Date" => Time.at(result['timestamp'])
        #                }]
        #end
      end
    end
  end
end
