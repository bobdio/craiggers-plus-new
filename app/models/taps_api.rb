require 'rest_client'

class TapsAPI
  class << self
    def base_url
      "should be overriden"
    end

    def request(path, data)
      params = {}
      url = "#{base_url}/#{path}"
      ::Rails.logger.error "REQUEST--------------------------------------"
      ::Rails.logger.error "PATH---#{path}"
      ::Rails.logger.error "URL---#{url}"
      data.each do |key,value|
        value = JSON.generate(value) if value.is_a?(Hash)
        value = value.to_s if !value.is_a?(File)
        params[key.to_s] = value
      end
      ::Rails.logger.error "PARAMS SENT---#{params.inspect}"
      response = RestClient.post(url, params)
      ::Rails.logger.error "RESPONSE---#{response.inspect}"
      ::Rails.logger.error "END REQUEST--------------------------------------"
      response
    end

    def get_request(path, data)
      params = []
      url = "#{base_url}/#{path}"
      ::Rails.logger.error "REQUEST--------------------------------------"
      ::Rails.logger.error "PATH---#{path}"
      ::Rails.logger.error "URL---#{url}"
      ::Rails.logger.error "DATA---#{data.inspect}"
      data.each {|key,value| params << "#{key}=#{value}"}
      params = params.join('&')
      ::Rails.logger.error "PARAMS SENT---#{params.inspect}"
      response = RestClient.get("#{url}?#{params}")
      ::Rails.logger.error "RESPONSE---#{response.inspect}"
      ::Rails.logger.error "END REQUEST--------------------------------------"
      response
    end
  end
end