class ProfileController < ApplicationController
  before_filter :only => [:index, :identify, :unidentify] do
    redirect_to :root unless current_user.signedin?
  end

  def index
    get_notification_settings
    render :layout => 'static'
  end

  def update
    settings = {
      photo: params[:photo] && File.new(params[:photo].tempfile.path, 'r'),
      email: params[:email_address],
      bio:  params[:bio],
      location: params[:location],
      website: params[:website],
      session_token: current_user[:session_token]
      # :settings => {
      #   :email => params[:email_address],
      #   :phone => params[:phone_number],
      #   :is_blocked => !params[:enable_chats],
      #   :blockUnverified => params[:blockUnverified],
      #   :notifications => params[:notifications] || {}
      # }.to_json
    }
    user = UserAPI.update(current_user['id'], settings)
    @current_user = user if user
    self.current_user = UserAPI.login(session[:username], session[:password])
    # get_notification_settings
    flash[:notice] = "Your profile has been successfully updated!"
    redirect_to :action => :index
  end

  def change_block_option
    is_blocked = ActiveSupport::JSON.decode(current_user['settings'])["is_blocked"]
    UserAPI.update(current_user['id'],{ :settings => {:is_blocked => !is_blocked} })
    render :nothing => true
  end

  def identify
    redirect_to "/auth/#{params[:provider]}"
  end

  def unidentify
    UserAPI.unidentify(current_user.id, params[:id])
    session[:current_user] = nil # force update from api
    redirect_to :action => :index
  end

end
