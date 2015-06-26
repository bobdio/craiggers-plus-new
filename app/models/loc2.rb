class Loc2 < ActiveRecord::Base
  belongs_to :loc1

  scope :with_code, lambda {
    where("loc2s.code is not null")
  }

  scope :asc, order("loc2s.name asc")
  scope :dsc, order("loc2s.name desc")

end
