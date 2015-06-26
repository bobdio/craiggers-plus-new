class ApplicationController < ActionController::Base
  before_filter :force_ssl, :log_user_agent, :authenticate
  has_mobile_fu

  # protect_from_forgery
  skip_before_filter :verify_authenticity_token, :only => :files_upload
  layout 'main'

  protected
  def log_user_agent
    SULOUA.info "#{Time.now.utc}: #{request.user_agent}"
  end

  def init
    Session.sweep
    @locations = Location.countries
    @cats = Cat.from_taps.includes(:subcats)
    @sources = Source.asc
  end

  def current_domain
    @current_domain ||= DomainConfig.get_settings('jeboom.com')
    @current_domain['host'] = request.url.match(/^.+(com|000|dev|ua)/)[0]
    @current_domain
  end

  def current_user
    session[:current_user]
  end

  def current_app_settings
    @current_app_settings = session[:current_app_settings] = get_app_settings
    @current_app_settings
  end

  def get_user
    UserAPI.login(session[:username], session[:password])
  end

  def current_provider
    'craiggers'
  end

  #TODO: PyotrK(2011/09/21): Move this staff to user_api.rb into 'parse_response' method
  def get_notification_settings
    settings = {
      :posting => {},
      :is_blocked => false,
      :email => '',
      :phone => '',
      :notifications => {
        :emailEnabled => false,
        :textEnabled => false,
        :email => {},
        :text => {}
      }
    }.with_indifferent_access

    if current_user.signedin
      # get_user
      settings.merge! current_user[:settings]
      # settings.merge! ActiveSupport::JSON.decode(current_user["settings"])  unless  current_user["settings"].blank?
      settings["posting"] = ActiveSupport::JSON.decode(settings["posting"]) if settings["posting"].class == String
    end
    @settings = settings
  end

  def get_app_settings
    app_settings = {
      :social_message => SocialMessage.current_message
    }.with_indifferent_access
    app_settings
  end

  def current_user=(user)
    @current_user = session[:current_user] = user
  end

  def current_app_settings=(app_settings)
    @current_app_settings = session[:current_app_settings] = app_settings
  end

  helper_method :current_user, :current_provider, :current_domain, :get_notification_settings, :current_app_settings, :get_app_settings

  def authorize_user
    return true if current_user.signedin
    if request.xhr?
      render :nothing => true, :status => 403
    else
      redirect_to :root
    end
  end

  def check_mail_params
    unless params.has_key?(:from) and params.has_key?(:to) and params.has_key?(:data)
      render :nothing => true, :status => 400 and return false
    end
  end

  def get_identity_data(provider, guid)
    if provider == 'facebook'
      return { :otherData => "#{fb_friends_number(guid)} friends" }
    end
    if provider == 'twitter'
      return { :otherData => "#{twitter_followers_number(guid)} followers" }
    end
  end

  private

  def authenticate
    unless Rails.env.production?
       unless authenticate_with_http_basic {|u, p|  u == "3taps" && p == "taptaptap" }
         request_http_basic_authentication
       end
     end
  end

  def twitter_followers_number(guid)
    uri = "http://api.twitter.com/1/users/show.json?user_id=#{guid}"
    data = RestClient.get(uri)
    JSON.parse(data)['followers_count']
  end

  def fb_friends_number(guid)
    token = URI.escape(fb_access_token)
    uri = "https://graph.facebook.com/#{guid}/friends?access_token=#{token}"
    data = RestClient.get(uri)
    JSON.parse(data)['data'].length
  end

  def fb_access_token
    fb_keys = current_domain['fb_api_keys'][current_domain['host']]
    uri = "https://graph.facebook.com/oauth/access_token?client_id=#{fb_keys['key']}&client_secret=#{fb_keys['secret']}&grant_type=client_credentials"
    data = RestClient.get(uri)
    data.split('=')[1]
  end

  def force_ssl
    return if Rails.env != 'production'
    # return unless ['staging', 'production'].include? Rails.env
    return if request.ssl?
    return if current_domain['name'] != 'craiggers'
    return if request.host.starts_with? 'dev'
    return if request.host.starts_with? 'staging'

    host = request.host
    host = "www.#{host}" if !host.starts_with? 'www.'
    redirect_to "https://#{host}/#{request.query_string}"
  end

  def get_json_data(url)
    begin
      data = RestClient.get url
      ActiveSupport::JSON.decode data
    rescue => e
      return {success: false, error: e.to_s}
    end
  end

  def signedin
    unless current_user.signedin
      render nothing: true, :status => 403 and return false
    end
  end
end
