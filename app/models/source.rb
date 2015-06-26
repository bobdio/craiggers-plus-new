class Source < ActiveRecord::Base

  scope :asc, order("sources.name asc").where("sources.hidden = ?", false)

end
