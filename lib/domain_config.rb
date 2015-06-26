class DomainConfig
  class << self
    def config
      @@config ||= YAML.load_file(File.expand_path(File.dirname(__FILE__) + "/../config/domains.yml"))
    end

    def get_settings(domain)
      config[domain]
    end
  end
end