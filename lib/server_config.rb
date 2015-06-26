class ServerConfig
  class << self
    def config
      @@config ||= YAML.load_file(File.expand_path(File.dirname(__FILE__) + "/../config/servers.yml"))
    end

    def user_api
      config["user_api"][::Rails.env]
    end

    def notification_api
      config["notification_api"][::Rails.env]
    end
  end
end
