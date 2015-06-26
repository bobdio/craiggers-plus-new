class Loc1 < ActiveRecord::Base
  belongs_to :location
  has_many :loc2s

  scope :with_code, lambda {
    where("loc1s.code is not null")
  }

  scope :asc, order("loc1s.name asc")
  scope :dsc, order("loc1s.name desc")

  def distance_to(to_lat, to_lon)
    lat, lon = self.latlon.gsub(/\(|\)/, '').split(',')
    Math.sqrt((to_lat.to_f - lat.to_f)**2 + (to_lon.to_f - lon.to_f)**2)
  end

end
