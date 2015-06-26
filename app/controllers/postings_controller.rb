#require 'RMagick'
class PostingsController < ApplicationController
  layout 'static'

  def new
    @posting = Posting.new
  end

  def create
    if session[:posting]
      @posting = session[:posting]
      @posting.annotations = session[:annotation] || []
      post_key = @posting.save
      if post_key
        # "waiting while indexed by server"
        sleep(10)
        SocialAPI.set_owner(current_user.id, post_key, current_provider)
      end
      if  @posting.errors.empty? && @posting.privacy != '0'
        private_key=UserPosting.generate_private_key_and_save(session[:user_id], @posting)
        #add_post_key_to_cookies(@posting.post_key)
        flash[:notice] = "Posting was saved! Post key is: #{@posting.post_key}, Private key is: #{private_key}"
        session[:posting] = nil
        #session[:thumbnails].each{|thumb|}
        # remove thumbnails
        session[:thumbnails]
        redirect_to(:action => :new) and return
      elsif @posting.errors.empty? && @posting.privacy == '0'
        flash[:notice] = "Posting was saved! Post key is: #{@posting.post_key}"
        session[:posting] = nil
        #session[:thumbnails].each{|thumb|}
        # remove thumbnails
        session[:thumbnails]
        redirect_to(:action => :new) and return
      else
        flash[:notice] = @posting.errors[:post_key][0] || "You must be signed in to do that"
        render :action => :new
      end
    end
    #render :nothing=>true
  end

  def files_upload
    urls, errors = FileUpload.new(params).formated_arrays_of_urls_and_errors
    render :text => {:images => urls, :errors => errors }.to_json
  end

  def show
    unless params[:id]
      @posting = Posting.new(params[:posting])
      @posting.urls = session[:urls]
      ::Rails.logger.error "####################################################################  show"
      ::Rails.logger.error @posting.urls.inspect
      session[:urls] = []
      @posting.urls.compact! unless @posting.urls.nil?
      @posting.annotations = params[:annotation] || []
      @posting.set_privacy
      @posting.set_email
      @posting.source = 'CRAIG'
      if @posting.valid?
        session[:posting] =  @posting
        session[:annotation] = params[:annotation] || []
      else
        render :new
      end
      @posting
    else
      @posting = Posting.find(params[:id])
      @posting.urls = @posting.images
    end
  end

  def delete
    if Posting.destroy(params[:id])
      flash[:notice] = "Posting was deleted."
    else
      flash[:notice] = "Posting was not deleted."
    end
  end

  def edit
    @posting = Posting.find(params[:id])
    session[:posting] = @posting
  end

  def update
    @posting = session[:posting]
    if @posting.update(params[:id], params[:posting])
      flash[:notice] = "Posting updated"
    else
      flash[:error] = "Uh oh, your posting could not be processed. Something strange happened. Please try again."
      render :action => :edit
    end
  end

  def topsy
    @topsy_item = RemoteAction.new(session[:search]).topsy_data
  end

  def craigslist
    @posting = Posting.new
  end

  def save_details
    session[:posting_in_progress] = false
    settings = params.except(:controller, :action)
    settings.delete('settings');
    UserAPI.update(current_user['id'],{ :settings => {:posting => settings}.to_json })
    render :nothing => true, :status => 200 and return
  end

  def clear_details
    session[:posting_in_progress] = false
    UserAPI.update(current_user['id'],{ :settings => {:posting =>{}}})
    render :nothing => true, :status => 200 and return
  end

  def get_details
    session[:posting_in_progress] = true
    current_user.update_from_api
    settings = get_notification_settings["posting"]
    render :json => settings
  end

  def captcha
    response = RestClient.post("http://www.google.com/recaptcha/api/verify", "privatekey=6LdDU8YSAAAAAKK6FYeZld7T6x3ulzKZyqH8QOjY&remoteip=#{request.remote_ip}&challenge=#{params[:challenge]}&response=#{params[:response]}")
    if response.match 'true'
      render :nothing => true, :status => 200
    else
      render :nothing => true, :status => 500
    end
  end

  def get_template
    @posting_text = Posting.get_craiggers_posting_hash_from_params(params)
    render :template => 'shared/craiggers.html.erb', :layout => false
  end

  def publish_posting
    posting_details = params.except(:controller, :action)
    @posting = Posting.new
    @posting.create_from_hash(posting_details)
    post_key = @posting.save
    if post_key
      # "waiting while indexed by server"
      if current_user
        if params[:rememberSettings]
          notifications = {}
          notifications[:emailEnabled] = params[:enableEmail]
          notifications[:textEnabled] = params[:enableText]
          notifications[:email] = {}
          notifications[:email][:ownFlagged] = params[:flagEmail]
          notifications[:email][:ownCommented] = params[:commentEmail]
          notifications[:email][:ownUpdated] = false
          notifications[:email][:ownDeleted] = false
          notifications[:email][:ownMessageSent] = params[:chatEmail]
          notifications[:email][:ownMessageAndUnavailable] = params[:messageEmail]
          notifications[:text] = {}
          notifications[:text][:ownFlagged] = params[:flagText]
          notifications[:text][:ownCommented] = params[:commentText]
          notifications[:text][:ownUpdated] = false
          notifications[:text][:ownDeleted] = false
          notifications[:text][:ownMessageSent] = params[:chatText]
          notifications[:text][:ownMessageAndUnavailable] = params[:messageText]
          #claim = Claim.create(:identity_id => current_identity["identityID"], :identity_key => current_identity["identityKey"], :posting_key => post_key)
          #claim.approve(notifications)
          #claim.approve(params[:title])
        else
          #claim = Claim.create(:identity_id => current_identity["identityID"], :identity_key => current_identity["identityKey"], :posting_key => post_key)
          #claim.approve(params[:title])
        end
        # 2011-10-24 13:52 Author: Igor Novak
        # TODO: dirty
        #current_user['postings'] << { 'postKey' => post_key }

        #SocialAPI.set_owner(current_user['id'], post_key, current_provider)
      end
      render :json => {:postKey => post_key}
    else
      render :nothing => true, :status => 500
    end
  end

end

