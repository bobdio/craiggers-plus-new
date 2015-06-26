require 'rest_client'

class NotificationAPI < TapsAPI
  class << self
    def base_url
      ServerConfig.notification_api
    end

    def subscribe(user_id)
      JSON.parse(request('subscribe', {user_id: user_id}))
    end

    def unsubscribe(subscription_id)
      JSON.parse(request('unsubscribe', {subscription_id: subscription_id}))
    end

    def send(subscription_id, message, link, sender = 'JEBOOM', gateway = 'email')
      request('send', {subscription_id: subscription_id, message: message, link: link, sender: sender, gateway: gateway})
    end
  end
end