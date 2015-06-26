require 'open-uri'

class AdminController < ApplicationController
  before_filter :only_admin_user

  def saved_searches
    @sort_by = params[:sort_by] || 'created_at'
    @direction = params[:direction] || 'desc'

    @saved_searches = SavedSearch
      .paginate(:page => params[:page])
      .order("#{@sort_by} #{@direction}")
    render layout: 'admin'
  end

  def saved_search
    saved_search = SavedSearch.find params[:id]
    @saved_searches = SavedSearch.where key: saved_search.key
    @json = ActiveSupport::JSON.decode saved_search.json
    render layout: 'admin'
  end

  def map
    @time_to = Time.zone.now
    @time_from = @time_to - 10.minute
    @postings_url = "http://api.3taps.com/api/latest/search/?retvals=location&page=0&timestamp=#{@time_from.to_i}..#{@time_to.to_i}"
    # @response_json = open("http://api.3taps.com/api/latest/search/?retvals=location&page=0&timestamp=#{@time_from.to_i}..#{@time_to.to_i}").read
    # @response = ActiveSupport::JSON.decode @response_json
    # @postings = @response['postings']
  end

  def map2
    render layout: false
  end

private
  def only_admin_user
    access_for = ['Marat', 'megnakamura', 'test4', 'admsev1', 'devtest']
    unless current_user.id || access_for.include?(current_user.id)
      flash[:error] = "You must be logged in to access this section"
      redirect_to :root
    end
  end
end
