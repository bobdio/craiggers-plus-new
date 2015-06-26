class Subcat < ActiveRecord::Base
  belongs_to :cat

  scope :with_code, lambda {
    where("subcats.code is not null")
  }
  scope :from_taps,  where(:originate => 1)
  scope :from_craig,  where(:originate => 0)
  scope :asc, order("subcats.name asc")
  scope :dsc, order("subcats.name desc")
  scope :ordered, order("subcats.position desc")
  scope :not, lambda { |n| where("subcats.code != ?", n) }
end
