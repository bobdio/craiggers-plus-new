class PostingsController < ApplicationController
  before_filter :only => :create do
    redirect_to :root unless current_user.signedin
  end

  def show_posting_from_postings_api
    @response = JSON.parse(RestClient.get("http://posting3.3taps.com/postings/#{params[:id]}")).with_indifferent_access
    render layout: false
  end

  def send_posting

  end

  def delete
    posting = Posting.find(params[:id])
    posting.destroy
    PostingApi.delete_posting(posting)
    render :text => 'posting was destroyed successfully'
  end

  def count
    render json: {count: Posting.count}
  end

  def by_user
    render json: Posting.where({username: params[:name]}).to_json(methods: [ :location, :timestamp, :annotations ])
  end

  def index
    @postings = Posting.unscoped.order("actual_date DESC").page(params['page'].to_i+1).per_page(params['rpp'].to_i)
    respond_to do |format|
      format.html { render layout: false }
      format.json { render json: @postings.to_json(methods: [ :location, :timestamp, :annotations ]) }
    end
  end

  def update
    location = Location.find_by_code(params[:location])
    posting = Posting.find(params[:id])
    posting.attributes = {
      heading: params[:heading],
      category: params[:category],
      location_id: location.try(:id),
      body: params[:body],
      price: params[:price],
      currency: params[:currency],
      images: params[:images],
      annotations: params[:annotations]
    }

    posting.actual_date = Time.now if params[:mode] == 'repost'
    if posting.save
      posting.reload
      PostingApi.update_posting(posting)
      render json: { success: true, posting: posting.to_json(:methods => ['location_code', 'timestamp', :annotations]) }
    else
      render json: { success: false, errors: posting.errors }
    end
  end

  def show
    @posting = Posting.find(params[:id])
    @posting.location_code = @posting.location.code
    render json: @posting.to_json(:methods => 'location_code')
  end

  def show_view
    @posting = Posting.find(params[:id])
    render layout: false
  end 

  def create
    location = Location.find_by_code(params[:location])
    posting = Posting.create heading: params[:heading],
                             source: 'JBOOM',
                             category: params[:category],
                             location_id: location.try(:id),
                             account_id: 'stub',
                             external_url: root_url,
                             body: params[:body],
                             price: params[:price],
                             currency: params[:currency],
                             images: params[:images],
                             annotations: params[:annotations],
                             status: 'offered',
                             username: current_user.username,
                             actual_date: Time.now
    if !posting.new_record?
      posting = Posting.find(posting.id)
      PostingApi.create_posting(posting)
      render json: { success: true, posting: posting.to_json(:methods => ['location_code', 'timestamp', :annotations]) }
    else
      render json: { success: false, errors: posting.errors }
    end
  end

  def files_upload
    file = FileUpload.new(params)

    if file.error
      render json: {success: false, error: file.error}
    else
      render json: {success: true, image: file.urls.to_json}
    end
  end
end
