class SocialMessage < ActiveRecord::Base
  def self.current_message
    message = ""
    social_message = SocialMessage.last 
    if social_message
      message = social_message.text
    end
    message
  end
end