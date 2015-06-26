class TapsConnector
  class << self
    def search(search, time)#, page, per_page, retvals)
      params = "retvals=#{search['retvals']}"
      params += "&rpp=#{search['rpp']}&page=#{search['page']}"
      params += "&timestamp=#{search['timestamp']}..#{time}"
      params << params_for_search(search)
      #params += "&has_image=1"
      #params += "&annotations=#{CGI.escape(ActiveSupport::JSON.encode(search.annotations))}" if search.annotations
      connect('/', params)
    end

    def widget_search(search, page, per_page, has_image, sort_by, price = nil)
      params = "rpp=#{per_page}&page=#{page}"
      params << params_for_search(search)
      params += "&has_image=#{has_image}" # should be 0|1
      params += "&sort=#{sort_by}"
      params += "&price=#{price}" if price
      params += "&retvals=category,location,heading,externalURL,timestamp,postKey,source,image,body,price,currency,images"
      params += "&annotations=#{CGI.escape(ActiveSupport::JSON.encode(search.annotations))}" if search.annotations
      connect('search', params)
    end

    def summary(search, dimension)
      params = "dimension=#{dimension}"
      params << params_for_search(search)      
      connect("/summary", params)
    end

    def find_item(id)
      connect("posting/get/#{id}")
    end

    def get_geoinfo(string)
      params = "agentID=svitla&authID=4db929afc15514d79a0b5878675e210f&data=#{string}"
      connect('geocoder/geocode', params)
    end

#    def location_count(search)
#      params =  params_for_search(search)
#      connect('search/count',params)
#    end

    def create_posting(posting)
      params = "postings=#{posting}"
      connect_post('posting/create', params)
    end

    def categories
      connect('reference/categories?authToken=c9e6638a4d2db53f3a50200290ae1b65')
    end

    def location_list(level, level2, code)
      connect_api3("reference/locations?level=#{level}&#{level2}=#{code}&authToken=c9e6638a4d2db53f3a50200290ae1b65")
    end

    def location_details(code)
      connect("reference/locations/#{code}&authToken=c9e6638a4d2db53f3a50200290ae1b65")
    end

    def sources
      connect('reference/source')
    end

    def create_notification(search, notification)
      params = "format=#{notification.format}"
      params += "&email=#{notification.email}" if notification.email
      params += "&jid=#{notification.email}" if notification.jid
      params += "&token=#{notification.email}" if notification.token
      params += "&expiration=#{notification.expiration}" if notification.expiration
      params += "&text=#{search.string}" if search.string
      params += "&src=#{search.source}" if search.source
      params += "&cat=#{search.category}" if search.category
      params += "&loc=#{search.location}" if search.location
      connect('notifications/create', params)
    end

    def delete_posting(posting_code)
      params = "agentID=svitla&authID=4db929afc15514d79a0b5878675e210f&data=#{CGI.escape(ActiveSupport::JSON.encode([posting_code]))}"
      connect("posting/delete", params)
    end

    #Update posting from API 3taps.com
    def update_posting (posting)
      params = "agentID=svitla&authID=4db929afc15514d79a0b5878675e210f&data=#{posting}"
      connect('posting/update', params)
    end

    private
    def params_for_search(search)
      params = ""
      params << "&anchor=#{CGI.escape(search['anchor'])}" if search['anchor'].present?
      params << "&text=#{CGI.escape(search['text'])}" if search['text'].present?
      params << "&source=#{CGI.escape(search['source_code'])}" if search['source_code'].present?
      params << "&category=#{CGI.escape(search['category_code'])}" if search['category_code'].present?
      params << "&locality=#{CGI.escape(search['locality'])}" if search['locality'].present?
      params << "&metro=#{CGI.escape(search['metro'])}" if search['metro'].present?
      params << "&country=#{CGI.escape(search['country'])}" if search['country'].present?
      params << "&state=#{CGI.escape(search['state'])}" if search['state'].present?
      params << "&county=#{CGI.escape(search['county'])}" if search['county'].present?
      params << "&city=#{CGI.escape(search['city'])}" if search['city'].present?
      params
    end
    

    def connect_post(path, params = nil)
      p "POST---------------------------------------------- http://www.3taps.net/#{path}?#{params}"
      #c = Curl::Easy.new("http://www.3taps.net/#{path}")
      param, data = params.split("=",2)
      #c.http_post(param.to_s + '=' + c.escape(data.to_s))
      request_data = param.to_s + '=' + CGI.escape(data.to_s)
      response = RestClient.post("http://www.3taps.net/#{path}", request_data)
      ActiveSupport::JSON.decode(response)
    end

    def connect(path, params = nil)
      address = params.present? ? path + '?' + params : path
      ::Rails.logger.error address
      p "GET---------------------------------------------- http://search.3taps.com/#{address}"
      #curl = Curl::Easy.new("http://www.3taps.net/#{address}")
      begin
        response = RestClient.get("http://search.3taps.com/#{address}")
        #curl.perform
      rescue
        "Some Error with Request."
      end
      #curl.body_str
      response
    end

    def connect_api3(path, params = nil)
      address = params.present? ? path + '?' + params : path
      ::Rails.logger.error address
      p "GET--- http://api3.3taps.com/#{address}"
      begin
        response = RestClient.get("http://api3.3taps.com/#{address}")
      rescue
        "Some Error with Request."
      end
      response
    end
  end
end
