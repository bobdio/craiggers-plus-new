require 'json'

task :generate_locations_json do
  json = {}
  File.open("#{Rails.root}/lib/locations/cl-locations-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    # city/state/loc_1/location_1/url/loc_2/location_2/(blank)/Display City State/Display State
    unless json.has_key?(cols[0])
      json[cols[0]] = {}
    end
    unless json[cols[0]].has_key?(cols[1])
      json[cols[0]][cols[1]] = {}
    end
    unless json[cols[0]][cols[1]][cols[3]].present?
      json[cols[0]][cols[1]][cols[3]] = {
        'loc_1' => cols[2],
        'location_1' => cols[3],
        'url' => cols[4],
        'Display City State' => cols[8],
        'Display State' => cols[9]
      }
    end
    unless json[cols[0]][cols[1]][cols[3]].has_key?('subs')
      json[cols[0]][cols[1]][cols[3]]['subs'] = []
    end
    if cols[5].present? and cols[6].present? 
      json[cols[0]][cols[1]][cols[3]]['subs'].push({
        'loc_2' => cols[5],
        'location_2' => cols[6]
      })
    end
  end
  File.open("#{Rails.root}/public/json/locations.json", 'w') { |f| f.write(JSON.pretty_generate(json)) }
end
