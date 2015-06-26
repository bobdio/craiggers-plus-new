class PostingApi
  class << self
    def create_posting(posting, status_attr = nil)
      # http://polling.3taps.com/poll/?anchor=188917515&rpp=1
      status = {offered: true}

      status = {deleted: true} if status_attr.eql? 'deleted'
      Rails.logger.info posting.images
      post_data = {
          auth_token: '52583033c5aa2786f93ea4d862b74120',
          postings:
          [{
            account_id: posting.account_id,
            source: posting.source,
            category: posting.category,
            location: get_location_hash(posting.location),
            external_id: posting.id,
            external_url: posting.external_url,
            heading: posting.heading,
            body: posting.body,
            html: nil,
            timestamp: posting.created_at.to_i,
            expires: nil,
            language: nil,
            price: posting.price,
            currency: posting.currency,
            images: posting.images,
            annotations: posting.annotations,
            status: status,
            immortal: false
          }]
        }

      Rails.logger.info '-----------------posting api--------------------------'
      Rails.logger.info post_data
      Rails.logger.info(RestClient.post "http://posting3.3taps.com", post_data.to_json, :content_type => :json)
    end
    alias_method :update_posting, :create_posting

    def delete_posting(posting)
      create_posting(posting, 'deleted')
    end

    def get_location_hash(location)
      location_tree = {}
      current_location = location
      loop do
        location_tree[current_location.level] = current_location.code
        current_location = current_location.parent
        break if current_location.nil?
      end

      {
        lat: (location.bounds_min_lat + location.bounds_max_lat) / 2,
        long: (location.bounds_min_long + location.bounds_max_long) / 2,
        accuracy: nil,
        bounds: [location.bounds_min_lat, location.bounds_max_lat, location.bounds_min_long, location.bounds_max_long],
        country: location_tree['country'],
        state: location_tree['state'],
        metro: location_tree['metro'],
        region: location_tree['region'],
        county: location_tree['county'],
        city: location_tree['city'],
        locality: location_tree['locality'],
        zipcode: location_tree['zipcode']
      }
    end
  end
end
