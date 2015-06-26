class UserController < ApplicationController
  before_filter :only => [:change_password, :change_password_request, :sign_up, :sign_in] do
    render :layout => false and return if request.get?
  end
  before_filter :init, :only => [:change_password]

  def change_password
    # 2011-10-10 00:07 Author: Igor Novak
    # behavior is the same as for other actions (sign_in, sign_up etc)
    # TODO: clean up is needed

    @token = params[:token]
    saved_request = PasswordRetrieveRequest.find_by_token(@token)
    session[:current_user] = UserAPI.unsigned_user
    session[:username] = nil
    session[:password] =  nil
    unless saved_request
      flash[:notice] = "Reset password link is expired or already used."
      # redirect_to :root and return
    end
    if request.post? && saved_request
      password = params[:password]
      user = UserAPI.update(saved_request.user_id, { :password => password })
      if user.signedin?
        session[:current_user] = user
        session[:username] = user[:username]
        session[:password] =  password
        saved_request.destroy
        render :nothing=> true
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
        name =  UserAPI.update(user_id,{}).username
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
      begin
        self.current_user = UserAPI.create(params[:name], params[:password], params[:email], current_domain['generic_image'], params[:contact_me])
        session[:username] = params[:name]
        session[:password] = params[:password]
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
            current_user.save_search(search)
          end
        end
        render :json => current_user.to_json and return
      rescue => e
        render :status => 301, :text => e.response
      end
    end
  end

  def sign_in
    render :layout => false and return if request.get?
    if request.post?
      user = UserAPI.login(params[:name],params[:password])
      if user.signedin?
        cookies.permanent['_session_id'] = cookies['_session_id'] if params[:remember]
        session[:username] = params[:name]
        session[:password] = params[:password]
        session[:current_user] = user
        render :json => current_user.to_json and return
      else
        render :text => "", :status => 301 and return
      end
    end
  end

  def favorites
    if current_user.signedin?
      render :json => current_user.favorites.map { |f| JSON.parse(f.json) }
    else
      favorites = Favorite.find(session[:favorites] || [])
      render :json => favorites.map { |f| JSON.parse(f.json) }
    end
  end

  def signedin
    render :json => current_user.update_from_api.to_json and return
  end

  def saved_searches
    searches = current_user.searches.map do |search|
      {json: JSON.parse(search.json),
       key: search.secret_key,
       notifications: search.send_notifications}
    end

    render json: searches
  end

  def get_notification_settings_for_posting
    if current_user && get_notification_settings
      render :json =>  get_notification_settings.to_json and return
    else
      render :nothing => true and return
    end
  end

  #<PyotrK(2011-09-28)>: Renamed this one into 'locations' to prevent double render error in change_password
  def locations
    #render :nothing => true, :status => 404 and return unless request.xhr?

    #render :text => Geokit::Geocoders::MultiGeocoder.geocode(params['ip'] || request.remote_ip).state
    #res = Net::HTTP.post_form(URI.parse("http://3taps.net/geocoder/geocode"), { 'data' => [{ 'latitude' => params[:lat], 'longitude' => params[:lon] }].to_json })

    logger.debug "/user/locations"
    logger.debug params.inspect

    loc_1 = Loc1.all.min_by{ |loc_1| loc_1.distance_to(params[:lat], params[:lon]) }

    logger.debug "loc_1 returned by db"
    logger.debug loc_1.inspect

    render :json => loc_1
  end
  #</PyotrK(2011-09-28)>

  def update_identities_data
    # settings = {}
    # current_user[:identities].each do |identity|
    #   data = get_identity_data(identity[:provider], identity[:guid])
    #   settings[identity[:provider]] = data if data # unless data.nil?
    # end
    # UserAPI.update(current_user[:id], { :settings => { :identities => settings } })
    render :nothing => true
  end

end
