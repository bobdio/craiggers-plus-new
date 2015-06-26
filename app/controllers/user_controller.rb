class UserController < ApplicationController
  before_filter :only => [:change_password, :change_password_request, :sign_up, :sign_in] do
    render :layout => false and return if request.get?
  end
  before_filter :init, :only => [:change_password, :activate_email]

  def update_email
    response = UserAPI.update_email(current_user.session_token, params[:email])
    if response['success']
      current_user.unconfirmed_email = params[:email]
      render json: current_user
    else
      render json: response['error']
    end
  end

  def update_username
    response = UserAPI.update_username(current_user.session_token, params[:username])
    if response['success']
      current_user.username = current_user.displayName = params[:username]
      render json: current_user
    else
      render json: response['error']
    end
  end

  def verify_email
    response = UserAPI.verify_email(current_user.session_token, current_user.unconfirmed_email, params[:pin])
    if response['success']
      current_user.email = current_user.unconfirmed_email
      current_user.unconfirmed_email = nil
      render json: current_user
    else
      render json: response['error']
    end
  end

  def change_password
    # 2011-10-10 00:07 Author: Igor Novak
    # behavior is the same as for other actions (sign_in, sign_up etc)
    # TODO: clean up is needed

    @token = params[:token]
    saved_request = PasswordRetrieveRequest.find_by_token(@token)
    session[:current_user] = UserAPI.unsigned_user
    session[:username] = nil
    session[:password] = nil
    unless saved_request
      flash[:notice] = "Reset password link is expired or already used."
      # redirect_to :root and return
    end
    if request.post? && saved_request
      password = params[:password]
      user = UserAPI.update(saved_request.user_id, {:password => password})
      if user.signedin
        session[:current_user] = user
        session[:username] = user[:username]
        session[:password] = password
        saved_request.destroy
        render :nothing => true
      else

      end
    end
  end

  def change_password_request
    if request.post?
      email, error, name = params[:email], "", params[:name]
      begin
        #<PyotrK(2011-09-30)>TODO Move this stuff to PasswordRetrieveRequest model
        user_id = UserAPI.find(name)
        PasswordRetrieveRequest.delete_all(:user_id => user_id)
        name = UserAPI.update(user_id, {}).username
        token = (Digest::SHA1.new << name + email + Time.now.to_s).hexdigest
        PasswordRetrieveRequest.create!(:user_id => user_id, :token => token);
        #</PyotrK(2011-09-30)>
        UserMailer.send_password_change_link(email, current_domain, token, name.titleize)
        #rescue => e
        #  render :text => error, :status => 500 and return
      end
      render :nothing => true and return
    end
  end

  def sign_up
    if request.post?
      render json: {response: {success: false, error: 'Username is blank'}} if params[:name].blank? and return
      render json: {response: {success: false, error: 'Password is blank'}} if params[:password].blank? and return
      render json: {response: {success: false, error: 'Email is blank'}} if params[:email].blank? and return

      mobile_client = is_tablet_device? || is_mobile_device?

      response = UserAPI.create(params[:name], params[:password], params[:email])
      # raise response['response']['error'].to_yaml
      self.current_user = response['user']

      if favorites = session[:favorites]
        favorites.each do |favorite_id|
          saved = Favorite.find(favorite_id)
          posting = JSON.parse(saved.json)
          current_user.favorite(posting)
        end
      end

      if favorites = session[:savedsearches]
        favorites.each do |search_id|
          saved = SavedSearch.find(search_id)
          search = JSON.parse(saved.json)
          SavedSearch.create(username: current_user.username, json: search)
        end
      end

      # UserMailer.send_verify_email_link(params[:name], params[:email])

      # BEGIN --- comment out to support email verification ---
      #render :json => response['user'] || response['response']['error']
      # END ---

      if mobile_client
        UserMailer.send_verify_email_link(nil, params[:name], params[:email], mobile_client)
        #error = 'Email verification has been sent to your mail'

        render :json => response['user'] || response['response']['error']
      else
        if response['response']['error'] != "Duplicate username"
          verification = Verification.new(name: params[:name], email: params[:email])

          error = if verification.save
                    user = Verification.find_by_name params[:name]
                    UserMailer.send_verify_email_link(user.secure_hash, user.name, user.email, mobile_client)
                    'Email verification has been sent to your mail'
                  else
                    verification.errors.full_messages.join("<br>")
                  end
        end
        self.current_user = nil
        error = 'Duplicate username'
        render :json => {response: {success: false, error: error}} # sending error to show message in modal window
      end

    end
  end

  def sign_in
    user = Verification.find_by_name(params[:name])
    json_response = if user.nil? || user.verified
                      render :layout => false and return if request.get?
                      render json: {response: {success: false, error: 'Username is blank'}} if params[:name].blank? and return
                      render json: {response: {success: false, error: 'Password is blank'}} if params[:password].blank? and return

                      response = UserAPI.login(params[:name], params[:password])
                      session[:current_user] = response['user'].presence

                      response['user'] || response['response']['error']
                      # UserAPI.update_email(current_user.session_token, current_user.email)
                    else
                      {response: {success: false, error: "Please verify your email first"}}
                    end
    render :json => json_response
  end

  def favorites
    if current_user
      render :json => current_user.favorites.map { |f| JSON.parse(f.json) }
    else
      favorites = Favorite.find(session[:favorites] || [])
      render :json => favorites.map { |f| JSON.parse(f.json) }
    end
  end

  def signedin
    render :json => current_user.to_json
  end

  def saved_searches
    searches = current_user.searches.map do |search|
      {json: JSON.parse(search.json),
       key: search.secret_key,
       notifications: search.send_notifications,
       interval: search.interval}
    end

    render json: searches
  end

  def get_notification_settings_for_posting
    if current_user && get_notification_settings
      render :json => get_notification_settings.to_json and return
    else
      render :nothing => true and return
    end
  end

  def locations
    #render :nothing => true, :status => 404 and return unless request.xhr?

    #render :text => Geokit::Geocoders::MultiGeocoder.geocode(params['ip'] || request.remote_ip).state
    #res = Net::HTTP.post_form(URI.parse("http://3taps.net/geocoder/geocode"), { 'data' => [{ 'latitude' => params[:lat], 'longitude' => params[:lon] }].to_json })

    logger.debug "/user/locations"
    logger.debug params.inspect

    loc_1 = Loc1.all.min_by { |loc_1| loc_1.distance_to(params[:lat], params[:lon]) }

    logger.debug "loc_1 returned by db"
    logger.debug loc_1.inspect

    render :json => loc_1
  end

  def activate_email
    user = Verification.find_by_secure_hash params[:secure_hash]
    user.update_attributes(verified: true)
  end
end
