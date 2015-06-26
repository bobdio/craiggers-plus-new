class LocationController < ApplicationController
  def show
    if locations = Location.expand(params[:id])
      data = {success: true, context: {}}

      locations.each do |location|
        if location.code == params[:id]
          long = (location.bounds_min_long + location.bounds_max_long) / 2
          lat = (location.bounds_min_lat + location.bounds_max_lat) / 2

          data.merge!({
            code: location.code,
            level: location.level,
            name: location.short_name,
            lat: lat,
            long: long
          })
        else
          data[:context].merge!({
            location.level.pluralize => [{
              code: location.code,
              level: location.level,
              name: location.short_name,
            }]
          })
        end
      end

      render json: data
    else
      render json: {success: false, error: {code: "Location with '#{params[:id]}' not found."}}
    end
  end

  def children
    if location = Location.find_by_code(params[:id])
      render json: {success: true, codes: location.children.map(&:code)}
    else
      render json: {success: false, error: {code: "Location with '#{params[:id]}' not found."}}
    end
  end

  def parent
    if location = Location.find_by_code(params[:id])
      if location.level == 'zipcode'
        available_parent = ['country', 'state', 'metro']
        while 1 do
          if available_parent.include? location.parent.level
            break
          else
            location = location.parent
          end
        end
      end

      render json: {
        success: true,
        location: {
          level: location.parent.level,
          code: location.parent.code
        }
      }
    else
      render json: {success: false, error: {code: "Location with '#{params[:id]}' not found."}}
    end
  end

  def get
    codes = params[:codes].split(',')
    locations = Location.where(Location.arel_table[:code].in(codes)).order(:id)

    if locations.present?
      data = []

      locations.each do |location|
        data << {
          name: location.short_name,
          code: location.code,
          level: location.level
        }
      end

      render json: {success: true, locations: data}
    else
      render json: {success: false, error: {code: "Location with '#{params[:codes]}' not found."}}
    end
  end

  def search
    locations = Location.search_by_name params[:text]
    count = locations.size

    if count < 50
      locations = locations.slice(0, 19);
      locations.map! do |loc|
        { locationName: loc.short_name, code: loc.code, level: loc.level }
      end
    else
      locations = []
    end

    render json: { locations: locations, numMatches: count }
  end
end
