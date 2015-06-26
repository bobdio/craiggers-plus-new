class PostingController < ApplicationController
  before_filter :check_mail_params, :only => :mail

  # caches_action :index
  # it doesn't work well enough
  # in part, index method isn't performed,
  # so PasswordRetrieveRequest login doesn't work
  # we need something other

  def index
    # if request.user_agent =~ /msie/i or request.user_agent =~ /(Mobile\/.+Safari)/i
    if request.user_agent =~ /msie/i
      redirect_to unsupported_browser_path
    end
    init

    token = params[:token]
    if token && PasswordRetrieveRequest.find_by_token(token)
      @change_password = true
    end
  end

  def show
  end

  def categories
    render :json => Cat.with_code, :include => :subcats
  end

  def favorite
    if current_user.signedin?
      current_user.favorite(params[:posting])
    else
      saved = Favorite.create(:json => params[:posting])
      session[:favorites] ||= []
      session[:favorites] << saved.id
    end
    render :nothing => true
  end

  def unfavorite
    if current_user.signedin?
      current_user.unfavorite(params[:posting])
    else
      saved = Favorite.find_by_json(params[:posting])
      if saved.present?
        session[:favorites].delete(saved.id)
        saved.destroy
      end
    end
    render :nothing => true
  end

  def mail
    PostingMailer.send_posting(params[:to], params[:from], params[:data][:postkey], current_domain).deliver
    render :nothing => true
  end

  def comments
=begin
    result = ActiveSupport::JSON.decode(SocialAPI.comments(params[:postKey]))
    result = result.sort_by{ |e| e[:id].to_i }
    branches = result.select{ |e| e[:parentID] == nil }
    leaves = result.select{ |e| e[:parentID] != nil }
    leaves.each do |e1|
      branches.each do |e2|
        if e1[:parentID] == e2[:id]
          branches.insert(branches.index(e2) + 1, e1)
          break
        end
      end
    end
    render :json => branches
=end
    render :json => []
  end

  def comment
    options = {
      :userID => current_user.id,
      :postKey => params[:postKey],
      :text => params[:comment][:text],
      :flagTypeID => params[:flag] && params[:flag][:code],
      :parentID => params[:parentID]
    }
    render :text => SocialAPI.comment(options)
  end

end
