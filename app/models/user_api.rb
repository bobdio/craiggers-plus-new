require 'rest_client'

class UserAPI < TapsAPI

  class << self
    def find(email)
      return nil unless email.present?
      request('get_profile',{:email => email})
    end

    def base_url
      ServerConfig.user_api
    end

    def subscribe(user_id)
      request('identity/update', {request_id: get_request_id, session_token: session_token, email_address: email})
    end

    def create(username,password, email)
      password_salt = SecureRandom.hex(16)
      password_hash = Digest::MD5.hexdigest("#{password_salt}#{password}")
      params = {request_id: get_request_id, username: username, password_salt: password_salt, password_hash: password_hash}

      response = JSON.parse(request('user/signup', params))
      return {'user' => nil, 'response' => response} unless response['success']
      session_token = response['session_token']

      response = JSON.parse(get(session_token))

      email_update_success = update_email(session_token, email)['success']
      unconfirmed_email = email_update_success ? email : nil

      user = response['success'] ? build_user(response.merge({'session_token' => session_token, 'unconfirmed_email' => unconfirmed_email})) : nil
      {'user' => user, 'response' => response}
    end

    def login(username,password)
      response = request 'user/get_salt', {request_id: get_request_id, username: username}

      password_salt = JSON.parse(response)['password_salt']
      password_hash = Digest::MD5.hexdigest(password_salt+password)
      response = JSON.parse(request('user/signin', {request_id: get_request_id, username: username, password_hash: password_hash}))
      session_token = response['session_token']
      response = JSON.parse(get(session_token))

      user = response['success'] ? build_user(response.merge({'session_token' => session_token})) : nil
      {'user' => user, 'response' => response}
    end

    def update_email(session_token, email)
      JSON.parse(request('identity/update', {request_id: get_request_id, session_token: session_token, email_address: email}))
    end

    def update_username(session_token, username)
      JSON.parse(request('identity/update', {request_id: get_request_id, session_token: session_token, username: username}))
    end

    def verify_email(session_token, unconfirmed_email, pin)
      JSON.parse(request('identity/verify_email', {request_id: get_request_id, session_token: session_token, email_address: unconfirmed_email, pin_code: pin}))
    end

    def get(session_token)
      request('identity/get', {request_id: get_request_id, session_token: session_token})
    end

    def save_search(user_id, search)
      search.symbolize_keys
      request('save_search', { :userID => user_id, :name => search[:name], :params => search[:params], :extra => search[:extra] })
    end

    def unsave_search(user_id, searchID)
      request('unsave_search', { :userID => user_id, :searchID => searchID })
    end

    def set_setting(user_id, key, val)
      request('set_setting',{:userID => user_id, :setting => key, :value => val})
    end

    def build_user(data)
      identity = data['identity']
      hash = {}
      hash['session_token'] = data['session_token']
      hash['unconfirmed_email'] = data['unconfirmed_email']
      hash["username"] = hash["displayName"] = identity['username']
      hash["user_id"] = data['user_id']
      hash["signedin"] = true
      hash["email"] = identity['email_address']
      hash["image"] = 'http://dev.craiggers.com/images/user.jpg'
      hash["signedin"] = true
      APIUser.new(hash)
    end

    def unsigned_user
       APIUser.new
    end

    def get_request_id
      salt = get_request('client/get_request_salt',{system_id: IDENTITY_SYSTEM_ID})
      hash = Digest::MD5.hexdigest("#{IDENTITY_PRIVATE_KEY}#{salt}")
      hash = Digest::MD5.hexdigest("#{salt}#{IDENTITY_PRIVATE_KEY}")
      request_id = "#{hash}#{salt}"
      request_id = "#{salt}#{hash}"
      request_id
    end
  end
end