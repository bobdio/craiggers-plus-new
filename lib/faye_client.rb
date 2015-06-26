class FayeClient
  class << self

    def send(user_id, data)
      connect(user_id, data)
    end

    def send_all(data)
      connect("messages/new", data)
    end

    def connect(channel, data)
      message = {:channel => channel, :data => data, :ext => {:auth_token => FAYE_TOKEN}}
      uri = URI.parse("http://social-api.lv.svitla.com:9292/faye")
      Net::HTTP.post_form(uri, :message => message.to_json)
    end
  end
end