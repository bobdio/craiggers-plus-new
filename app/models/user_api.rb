require 'rest_client'

class UserAPI

  class << self

    def base_url
      ServerConfig.user_api
      #'http://localhost:8080/threetaps'
    end

    def create(username,password,email, photo = false, contact_me = false)
      settings = {}
      settings[:contact_me] = 1 if contact_me
      # TODO: refactoring
      return nil unless username.present? and password.present? and email.present?
      request('create',{:username => username, :password => password, :email => email })
      login(username,password)
    end

    def find(email)
      return nil unless email.present?
      request('get_profile',{:email => email})
    end

    # /users/login
    # 
    # @desc
    # Returns a user object associated with the given account.
    # If the account is not known by 3taps, it will be created and associated
    # with a new user, which will be returned.
    #
    # @params
    # guid - User ID in provider system
    # provider - Auth provider name ('twitter', 'facebook', or 'linkedin')
    def login(username,password)
      return unsigned_user unless username.present? and password.present?

      begin
        response = request 'login', username: username
        login_data = JSON.parse response

        client_salt = Digest::MD5.hexdigest(rand(100000).to_s)[5..25]
        pass_with_server_salt = Digest::MD5.hexdigest(password + login_data['server_salt'])
        pass_with_server_and_client_salt = Digest::MD5.hexdigest(pass_with_server_salt + client_salt)

        response = request 'authenticate',
          session_token: login_data['session_token'],
          session_length: 6,
          client_salt: client_salt,
          hash: pass_with_server_and_client_salt

        user = build_user(response.body)
        user[:session_token] = login_data['session_token']
        user
      rescue => e
        p e.to_json
        unsigned_user
      end
    end

    # convenience method to get a user from the api
    #    def get(guid, provider, displayName, photo)
    #      login(guid, provider, displayName, photo)
    #    end

    # /users/update
    #
    # @desc
    # Edits a user profile. All fields except userID are optional.
    # To clear a field, submit an empty value for it.
    #
    # @params
    # userID: User id to update
    # settings: JSON string of settings
    # photo: Profile photo for user as multipart file upload or URL
    # displayName: Display name to update in provider
    # provider: Provider to update displayName or photo for
    def update(username, options)
      begin
        resp = request('update', options.merge({ :username => username }))
        build_user(resp.body)
      rescue => e
        p e.to_json
        unsigned_user
      end
    end

    # /users/identify
    #
    # @desc
    # Adds an identity to the user profile
    #
    # @params
    # userID: User id to add identity for
    # guid: Id in provider system
    # provider: Name of provider
    def identify(options)
      begin
        resp = request('identify', options)
        p resp.to_json
        resp
      rescue => e
        p e.to_json
        nil
      end
    end

    # /users/unidentify
    #
    # @desc
    # Removes an identity from the user profile
    #
    # @params
    # userID: User to remove identity from
    # provider: Name of provider
    def unidentify(user_id, provider)
      request('unidentify', { :userID => user_id, :provider => provider })
    end

    # /users/save_search
    # /users/unsave_search
    #
    # @desc
    # Adds/removes a saved search to the settings of the given user.
    #
    # @params
    # userID: User ID to create saved search for
    # name: Name of the saved search
    # params: A param object describing the search, using the same params as the Search API
    # extra: An extra string where apps can store things like search URL (could be JSON object)
    def save_search(user_id, search)
      search.symbolize_keys
      request('save_search', { :userID => user_id, :name => search[:name], :params => search[:params], :extra => search[:extra] })
    end

    def unsave_search(user_id, searchID)
      request('unsave_search', { :userID => user_id, :searchID => searchID })
    end

    # /users/favorite
    # /users/unfavorite
    #
    # @desc
    # Adds/removes a favorite to the settings of the given user.
    #
    # @params
    # userID: User ID to create favorite for
    # postKey: PostKey identifiying postKey to favorite.
    # extra: Extra data you might need.
    def favorite(user_id, favorite)
      # favorite.symbolize_keys
      # request('favorite', { :userID => user_id, :postKey => favorite[:postkey], :extra => favorite[:extra] })
    end

    def unfavorite(user_id, favorite)
      # favorite.symbolize_keys
      # request('unfavorite', { :userID => user_id, :postKey => favorite[:postkey], :extra => favorite[:extra] })
    end

    def set_setting(user_id, key, val)
      request('set_setting',{:userID => user_id, :setting => key, :value => val})
    end

    def request(path, data)
      params = {}
      url = "#{base_url}/identity/#{path}"
      ::Rails.logger.error "REQUEST--------------------------------------"
      ::Rails.logger.error "PATH---#{path}"
      ::Rails.logger.error "URL---#{url}"
      ::Rails.logger.error "DATA---#{data.inspect}"
      ::Rails.logger.error "END REQUEST--------------------------------------"
      data.each do |k,v|
        v = JSON.generate(v) if v.is_a?(Hash)
        v = v.to_s if !v.is_a?(File)
        params[k.to_s] = v
      end
      response = RestClient.post(url, params)
    end


    # <PyotrK(2011-09-22)>: Methods  that make current_user ambivalent and persistent
    # from now 'current_user.signedin?' is always available everywhere
    def build_user(body)
      hash = JSON.parse(body)
      hash["displayName"] = hash["user"] = hash["username"]
      hash["userID"] = hash["username"]
      hash["id"] = hash["username"]
      hash['conversations'] = {}
      hash["settings"] ||= '{}'
      hash["settings"] = JSON.parse(hash["settings"])
      begin
        photo = hash['profile']['photo_url_128x128']
        RestClient.get(photo)
      rescue => e
        photo = 'http://dev.craiggers.com/images/user.jpg'
      end
      hash["photo"] = photo
      hash["image"] = photo
      hash["signedin?"] = hash["signedin"] = true
      hash["is_admin"] = false
      hash["is_admin"] = true if hash["displayName"] == 'admin'
      APIUser.new(hash)
    end

    def unsigned_user
       # APIUser.new({:singedin? => false, :singedin => false})
       APIUser.new
    end
    # </PyotrK(2011-09-22)>

  end

end
