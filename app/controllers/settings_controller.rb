class SettingsController < ApplicationController
  before_filter :only => [:index] do
    redirect_to :root unless current_user.is_admin
  end

  def index
    get_app_settings
    render :layout => 'static'
  end
  
  def update
    social_message = ""
    social_message = params[:social_message] if params[:social_message]
    app_settings = {
     :social_message => social_message
    }
    SocialMessage.new({:text => social_message}).save
    self.current_app_settings = app_settings if app_settings
    flash[:notice] = "Your settings has been successfully updated!"
    redirect_to :action => :index
  end
end