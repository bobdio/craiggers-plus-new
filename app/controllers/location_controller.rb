class LocationController < ApplicationController
  include ActionView::Helpers::FormOptionsHelper

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

  def children_for_select
    if location = Location.find(params[:id])
      level = location.level
      child_level = level.next
      if (childs = location.children).present?
        children = childs.find_by_level(child_level)
        render json: {success: true, options: "<option>select #{level}</option>"+options_from_collection_for_select(children, :id, :full_name), level: child_level}
      else
        render json: {success: false, error: {code: "Location with id '#{params[:id]}' doesn't have childs"}}
      end
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
    levels = params[:levels].split(',') if params[:levels].present?
    levels ||= ['country', 'state', 'metro', 'region', 'county', 'city', 'locality', 'zipcode']
    locations = Location.search_by_name(params[:text]).where("level in ('#{levels.join("','")}')")
    if levels.include? 'zipcode'
      parents = locations.collect do |loc|
        Location.expand loc.code
      end.flatten.select do |loc|
        levels.include? loc.level
      end
      locations << parents
      locations.flatten!
    end

    count = locations.size

    if count < 50
      locations = locations.slice(0, 19);
      locations.map! do |loc|
        {locationName: loc.short_name, code: loc.code, level: loc.level}
      end
    else
      locations = []
    end

    render json: {locations: locations, numMatches: count}
  end
end
