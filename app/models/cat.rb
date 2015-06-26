class Cat < ActiveRecord::Base
  has_many :subcats

  scope :with_code, lambda {
    where("cats.code is not null")
  }
  scope :from_taps,  where(:originate => 1)
  scope :from_craig,  where(:originate => 0)

  scope :asc, order("cats.name asc")
  scope :dsc, order("cats.name desc")
end
