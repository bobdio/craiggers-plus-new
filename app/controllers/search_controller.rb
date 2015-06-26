class SearchController < ApplicationController
  before_filter :check_mail_params, :only => :mail
  before_filter :signedin, only: [:delete, :save, :update]

  def save
    send_notifications = params[:notifications] || false
    subscription_id = send_notifications ? NotificationAPI.subscribe(current_user.user_id)['subscription_id'] : nil

    search = SavedSearch.create(username: current_user.username, json: params[:json], send_notifications: send_notifications, subscription_id: subscription_id, interval: params[:interval])

    render json: { success: true, key: search.secret_key, notifications: search.send_notifications }
  end

  def delete
    current_user.unsave_search(params[:key])
    render nothing: true
  end

  def update
    saved = SavedSearch.find_by_secret_key params[:key]
    if saved
      saved.update_by_params name: params[:name],
                             email: params[:email],
                             send_notifications: params[:notifications]
    end
    render nothing: true
  end

  def latest
    session[:previous] = params[:url]
    render :nothing => true
  end

  def previous
    if session[:previous].present?
      render :text => session[:previous]
      session[:previous] = nil
    else
      render :nothing => true, :status => 404
    end
  end

  def mail
    search = request.url.gsub(/search\/mail$/, "##{params[:data][:search]}")
    SearchMailer.send_criteria(params[:to], params[:from], search).deliver
    render :nothing => true
  end

  def off_notifications
    unless search = SavedSearch.find_by_secret_key(params[:secret_key] )
      flash[:popup] = "Search not found"
    else
      search.update_attributes send_notifications: false, unsubscribed: Time.now
      flash[:popup] = "You have successfully unsubscribed from your saved search named: #{search.name}"
    end
    redirect_to :root
  end

  def load_search
    if search = SavedSearch.find_by_uniq_key(params[:uniq_key])
      search.counter = search.counter + 1
      search.save

      param = ActiveSupport::JSON.decode search.json
      redirect_to "#{root_path}##{param['extra']['url']}"
    else
      redirect_to :root
    end
  end

  def load_posting
    redirect_to "#{root_path}#!/search/all/all/all//subnav=workspace-link&nav=search-link&postKey=#{params[:uniq_key]}"
  end

  def load_search_result
    load_search and return if params[:uniq_key][0] == 's'
    load_posting
  end
end