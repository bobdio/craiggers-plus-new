task :transfer_data_to_user_api => :environment do

  User.all.each do |user|
    # transfer authorizations/identities
    auth = user.authorizations.first
    resp = api_request('login', { 
      :guid => auth.uid, 
      :provider => auth.provider 
    })
    puts "------------------"
    puts user.name
    puts "{ :guid => #{auth.uid}, :provider => #{auth.provider} }"
    api_user = JSON.parse(resp.body)

    next unless api_user.present?
      
    # transfer favorites
    user.favorites.each do |favorite|
      api_request('favorite', {
        :userID => api_user['id'],
        :postKey => favorite.postkey,
        :extra => {
          :path => favorite.path,
          :heading => favorite.heading,
          :price => favorite.price,
          :utc => favorite.utc
        }
      })
    end
    puts "#{user.favorites.count} favorites"

    # transfer saved searches
    user.saved_searches.each do |search|
      api_request('save_search', {
        :userID => api_user['id'],
        :name => search.name,
        :extra => { :url => search.url }
      })
    end
    puts "#{user.saved_searches.count} saved searches"

  end
end
  
def api_request(path, data)
  params = []
  data.each do |k,v| 
    v = JSON.generate(v) if v.is_a?(Hash)
    params << "#{k.to_s}=#{CGI::escape(v.to_s)}"
  end
  uri = URI.parse("http://3taps.net/users/#{path}?#{params.join('&')}")
  response = Net::HTTP.get_response(uri)
end
