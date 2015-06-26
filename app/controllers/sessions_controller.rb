class SessionsController < ApplicationController

  def create
    auth = request.env['omniauth.auth']

    auth['user_info'].symbolize_keys

    # get google photo
    if auth['provider'] == 'google'
      account_name = auth['user_info'][:email].gsub(/@[\w\W]*$/, '')
      # 2011-11-02 17:06 Author: Igor Novak
      # TODO: restore or remove google avatar
      # auth['user_info'][:image] = get_google_avatar(account_name)
      auth['user_info'][:image] = nil
      auth['user_info'][:nickname] = account_name
      auth['uid'] = auth['user_info'][:email]
    end

    #format twitter handle
    if auth['provider'] == 'twitter'
      auth['user_info'][:nickname] = "@#{auth['user_info'][:nickname]}"
    end

    # fix nickname for linkedin
    if auth['provider'] == 'linked_in'
      auth['user_info'][:nickname] = auth['user_info'][:name]
    end

    options = {
      :userID => self.current_user.id,
      :guid => auth['uid'],
      :provider => auth['provider'],
      :displayName => auth['user_info'][:nickname] || auth['user_info'][:name],
      :photo => auth['user_info'][:image] || nil
    }
    if UserAPI.identify(options)
      update_identity_data(auth[:provider], auth[:uid])
    else
      flash[:error] = "That account is already being used by another user"
    end

    session[:current_user] = UserAPI.login(session[:username], session[:password])

    if session[:favorites].present?
      session[:favorites].each do |f|
        fav = Favorite.find(f)
        self.current_user.favorite(JSON.parse(fav.json))
        fav.destroy
      end
      session[:favorites] = nil
    end

    if session[:savedsearches].present?
      session[:savedsearches].each do |s|
        search = SavedSearch.find(s)
        SavedSearch.create(username: current_user.username, json: JSON.parse(search.json))
        search.destroy
      end
      session[:savedsearches] = nil
    end

    #self.current_user.update_from_api

    redirect_to(:controller => :profile, :action => :index)# : redirect_to(:root)
  end

  def destroy
    cookies.delete(:guid)
    cookies.delete(:provider)
    cookies.delete(:displayName)
    cookies.delete(:photo)
    reset_session
    session[:current_user] = UserAPI.unsigned_user
    redirect_to :root
  end

  #<PyotrK(11-10-10)>: Add facebook api keys to domain config
  def setup
    # https://github.com/intridea/omniauth/wiki/Dynamic-Providers
    fb_api_keys = current_domain['fb_api_keys'][current_domain['host']]
    request.env['omniauth.strategy'].client_id = fb_api_keys['key']
    request.env['omniauth.strategy'].client_secret = fb_api_keys['secret']

    render :text => "Setup complete.", :status => 404
  end
  #</PyotrK(11-10-10)>

  private

  def update_identity_data(provider, guid)
    settings = current_user[:settings][:identities] || {}
    data = get_identity_data(provider, guid)
    settings[provider] = data if data # unless data.nil?
    UserAPI.update(current_user[:id], { :settings => { :identities => settings } })
  end

  def get_google_avatar(account_name)
    begin
      response = RestClient.get("https://www.googleapis.com/buzz/v1/people/#{account_name}/@self")
      google_profile = Hash.from_xml(response)
      img_ext = google_profile[:entry][:photos][1][:value].gsub(/^[\w\W]*\./, '-')
      image_name = google_profile[:entry][:photos][1][:value].gsub(/\W/, '-') + '.' + img_ext
      AWS::S3::Base.establish_connection!(
        :access_key_id     => 'AKIAIHZUZW2V7FCGPEPA',
        :secret_access_key => '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'
      )
      AWS::S3::S3Object.store(
        image_name,
        RestClient.get(google_profile[:entry][:photos][1][:value]),
        Posting:: AMAZON_BUCKET,
        :access => :public_read
      )
      Posting::AMAZON_SITE + Posting::AMAZON_BUCKET + '/' + image_name
    rescue
       ''
    end
  end

end
