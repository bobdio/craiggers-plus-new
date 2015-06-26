class User < ActiveRecord::Base
  has_many :authorizations
  has_many :favorites
  has_many :saved_searches
  has_many :recent_searches

  def self.create_from_hash!(hash)
    create(:name => hash['user_info']['name'])
  end

end
