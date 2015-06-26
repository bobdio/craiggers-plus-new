class Location < ActiveRecord::Base
  scope :asc, order("locations.full_name asc")
  scope :dsc, order("locations.full_name desc")
  scope :countries, where(level: 'country')

  belongs_to :parent, foreign_key: "parent_id", class_name: "Location"
  has_many :children, foreign_key: "parent_id", class_name: "Location"
  has_many :postings
  
  attr_accessor :country, :state, :metro, :region, :county, :city, :locality, :zipcode
  # NOTE: exampel:
  # def country
  #   Location.expand(code)[-1]
  # end
  # def state
  #   Location.expand(code)[-2]
  # end


  class << self
    def search_by_name(text)
      where arel_table[:short_name].matches("%#{text}%")
    end

    def name_for(params)
      levels = ['country', 'state', 'metro', 'region', 'county', 'city', 'locality']
      levels.each do |level|
        if params[level]
          location = find_by_code params[level]
          return location.full_name
        end
      end

      'All'
    end

    def expand(code)
      location = find_by_code(code)
      return nil if location.blank?

      data = [location]
      while 1 do
        if parent = data.last.parent
          data << parent
        else
          break
        end
      end
      data
    end
  end

  def next_level
    levels = %w(country state metro county city locality)
    levels.each_with_index do |arr_level, index| 
      return levels[index+1] if level == arr_level
    end
    nil
  end
end
