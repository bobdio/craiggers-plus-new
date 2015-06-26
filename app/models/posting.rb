require 'aws/s3'
require 'RMagick'

#<PyotrK(11-10-10)>: Dummy fix to resolve conflicts with activesupport v.3.1 requirement
class Posting < SuperModel::Base
  UPLOADABLE_FILESIZE = 1.megabyte
  TOTAL_SIZE = 10.megabytes

  AMAZON_SITE = 'http://s3.amazonaws.com/'
  AMAZON_BUCKET = '3taps_storage'
  
  class Privacy
    ANONYMOUS = '0'
    SEMI_ANONYMOUS = '1'
    PUBLIC = '2'

    TITLES = {
      '0' => 'anonymous',
      '1' => 'semi-anonymous',
      '2' => 'public'
    }
  end
  attributes :source, :category, :location, :heading, :uid,
    :privacy, :email, :anonymize_email, :files, :post_key, :description,
    :email0, :email1, :email0_confirmation, :email1_confirmation, :annotations,
    :account_name, :external_url, :claimUserID
  attr_accessor :urls, :post_key
  validates_presence_of :source, :category, :location, :heading
  validates_inclusion_of :privacy, :in => [Privacy::ANONYMOUS, Privacy::SEMI_ANONYMOUS, Privacy::PUBLIC]
  validates_confirmation_of :email, :if => Proc.new {|p| p.privacy != Privacy::ANONYMOUS}
  validates_length_of :description, :maximum => 5000

  def self.destroy(id)
    DeleteAction.delete(id)
  end

  def self.find(id)
    Action.new.find_item(id)
  end

  def self.get_craiggers_posting_hash_from_params(params)
    posting_text = {}
    posting_text[:name] = params[:name]
    posting_text[:title] = params[:title]
    posting_text[:status] = params[:annotations][:status].try(:upcase)
    posting_text[:price] = params[:annotations][:price]
    posting_text[:category] = params[:category_name]
    posting_text[:subcategory] = params[:subcategory_name]
    unless params[:annotations][:price].nil?
      posting_text[:price] =  if params[:annotations][:status] == 'stolen' || params[:annotations][:status] ==  "lost"
        'Reward: $'
      else
        case params[:category]
        when "SVCS" then "Rate: $"
        when "JJJJ" then "Compensation: $"
        when "SSSS" then "Price: $"
        when "AAAA" then "Price: $"
        when "VVVV" then "Price: $"
        when "RRRR" then "Price: $"
        when 'MMMM' then
          case params[:subcategory]
          when 'MADU' then "Compensation: $"
          when 'MALC' then "Price: $"
          when 'MARM' then "Price: $"
          when 'MDRU' then "Price: $"
          when 'MGAM' then "Price: $"
          else "$"
          end
        else
          "$"
        end
      end  + params[:annotations][:price]
    end
    posting_text[:description] = params[:description]
    posting_text[:postKey] = params[:postKey]
    posting_text[:timestamp] = Time.now.utc.to_s(:db)
    posting_text[:addInfo] = params[:annotations][:addInfo]
    posting_text[:catsOk] = params[:annotations][:catsOk]
    posting_text[:bedrooms] = params[:annotations][:bedrooms]
    posting_text[:contract] = params[:annotations][:contract]
    posting_text[:dogsOk] = params[:annotations][:dogsOk]
    posting_text[:internship] = params[:annotations][:internship]
    posting_text[:make] = params[:annotations][:make]
    posting_text[:model] = params[:annotations][:model]
    posting_text[:noPay] = params[:annotations][:noPay]
    posting_text[:nonProfit] = params[:annotations][:nonProfit]
    posting_text[:partTime] = params[:annotations][:partTime]
    posting_text[:pay] = params[:annotations][:pay]
    posting_text[:policeReport] = params[:annotations][:policeReport]
    posting_text[:telecommute] = params[:annotations][:telecommute]
    posting_text[:year] = params[:annotations][:year]    
    posting_text[:reward] = params[:annotations][:reward]
    posting_text[:value] = params[:annotations][:value]
    posting_text[:location] = params[:resultingLocation]
    unless params[:images].blank?
      primary =  params[:images].values.collect{ |obj| obj['image'] if obj['primary'] && obj['uploaded'] }.compact[0]
      posting_text[:images] = params[:images].values.collect{ |obj| obj['image'] if obj['uploaded'] && !obj['primary'] }.compact
      posting_text[:image] = primary || posting_text[:images].shift
      posting_text[:images] << nil if posting_text[:images].length%2 == 1
      posting_text[:images] = (0...posting_text[:images].size/2).inject([]) { |r,i| r << posting_text[:images][i*2,2]}
    end
    posting_text[:images] ||= []
    posting_text
  end
  
  def create_from_hash(details)
    self.anonymize_email = details[:anonymizeEmail]  unless details[:anonymizeEmail] == "null"
    self.email = details[:email]  unless details[:email] == "null"
    self.privacy = Privacy::PUBLIC
    self.heading = details[:title] ||= 'svitla test'
    self.source = '3TAPS'
    self.claimUserID = details[:claimUserID]
    self.location = details[:location_code].gsub("USA-", '') #||= 'XXX'
    self.country  = details[:country][:code] rescue nil
    self.state	= details[:state][:code] rescue nil
    self.county = details[:county][:code] rescue nil
    self.region = details[:region][:code] rescue nil
    self.metro = details[:metro][:code] rescue nil
    self.city = details[:city][:code] rescue nil
    self.locality	= details[:locality][:code] rescue nil
    self.zip = details[:zip][:code] rescue nil
    
    self.category = details[:subcategory] ||= 'ZZZZ'
    self.description = details[:description].to_s + (details[:addInfo].blank? ? '' : "\n\n<a href='http://#{details[:addInfo]}'>#{details[:addInfo]}</a>")
    @urls = details[:images] ||= {}
    
    annotations = {}
    locations_path = []
    locations_path <<  "\"country\":" + "\"#{ details[:country][:name] }\"" if self.country
    locations_path <<  "\"state\":" + "\"#{ details[:city][:name].split(',')[1] }\"" if self.state && self.city
    locations_path <<  "\"metro\":" + "\"#{ details[:metro][:name].split(',')[0] }\"" if self.metro
    locations_path <<  "\"county\":" + "\"#{ details[:county][:name].split(',')[0] }\"" if self.county
    locations_path <<  "\"region\":" + "\"#{  details[:region][:name].split(',')[0] }\"" if self.region    
    locations_path <<  "\"city\":" + "\"#{ details[:city][:name].split(',')[0] }\"" if self.city
    locations_path <<  "\"locality\":" + "\"#{ details[:locality][:name].split(',')[0] }\""  if self.locality
    annotations["location-raw_in"] = "[{" + locations_path.join(',') + "}]"
    annotations[:country]  = details[:country][:name] rescue nil
    annotations[:state]	= details[:state][:name] rescue nil
    annotations[:county] = details[:county][:name] rescue nil
    annotations[:region] = details[:region][:name] rescue nil
    annotations[:metro] = details[:metro][:name] rescue nil
    annotations[:city] = details[:city][:name] rescue nil
    annotations[:locality]	= details[:locality][:name] rescue nil
     
    annotations[:status] = details[:annotations][:status] if details[:annotations][:status] != "null" && !details[:annotations][:status].nil?
    annotations[:catsOk] = details[:annotations][:catsOk] unless details[:annotations][:catsOk] == "null"
    annotations[:addInfo] = details[:annotations][:addInfo] unless details[:annotations][:addInfo] == "null"
    annotations[:bedrooms] = details[:annotations][:bedrooms] unless details[:annotations][:bedrooms] == "null"
    annotations[:contract] = details[:annotations][:contract] unless details[:annotations][:contract] == "null"
    annotations[:dogsOk] = details[:annotations][:dogsOk] unless details[:annotations][:dogsOk] == "null"
    annotations[:internship] = details[:annotations][:internship] unless details[:annotations][:internship] == "null"
    annotations[:make] = details[:annotations][:make] unless details[:annotations][:make] == "null"
    annotations[:model] = details[:annotations][:model] unless details[:annotations][:model] == "null"
    annotations[:noPay] = details[:annotations][:noPay] unless details[:annotations][:noPay] == "null"
    annotations[:nonProfit] = details[:annotations][:nonProfit] unless details[:annotations][:nonProfit] == "null"
    annotations[:partTime] = details[:annotations][:partTime] unless details[:annotations][:partTime] == "null"
    annotations[:pay] = details[:annotations][:pay] unless details[:annotations][:pay] == "null"
    annotations[:policeReport] = details[:annotations][:policeReport] unless details[:annotations][:policeReport] == "null"
    annotations[:telecommute] = details[:annotations][:telecommute] unless details[:annotations][:telecommute] == "null"
    annotations[:year] = details[:annotations][:year] unless details[:annotations][:year] == "null"
    annotations[:price] = details[:annotations][:price] unless details[:annotations][:price] == "null"
    annotations[:reward] = details[:annotations][:reward] unless details[:annotations][:reward] == "null"
    annotations[:value] = details[:annotations][:value] unless details[:annotations][:value] == "null"
    self.annotations = annotations
  end

  def set_privacy
    self.annotations[0] = Privacy::TITLES[self.privacy] if self.privacy
  end

  def set_email
    if self.privacy == Privacy::PUBLIC
      self.email = self.email0
      self.email_confirmation = self.email0_confirmation
    elsif self.privacy == Privacy::SEMI_ANONYMOUS
      self.email = self.email1
      self.email_confirmation = self.email1_confirmation
    end

    #    if self.anonymize_email
    #      fake_address = FakeAddress.new(:address => self.email, :posting_id => ???)
    #    end
  end
  
  def save
    if new_record?
      self.source = '3TAPS'
      set_privacy
      #set_email
      valid = valid?
      if valid
        set_anonymization
        data = TapsConnector.create_posting(encode)

        p data
        @post_key = data[0]["postKey"] #[{"postKey"=>"BQNPW92"}]
        
        errors[:post_key] = "Uh oh, your posting could not be processed. Something strange happened. Please try again." if @post_key.nil?
        if @anonymize
          fake_address = FakeAddress.new(:address => self.email, :posting_id => @post_key)
          fake_address.save
          p fake_address.inspect
          self.account_name = fake_address.fake_address
          data = [@post_key, "[{"+'accountName:'  + "'#{self.account_name}'"+"}]"]
          TapsConnector.update_posting(data)
          #PostingMailer.edit_posting_email(self.email, @post_key).deliver
        else
          #PostingMailer.edit_posting_email(self.email, @post_key).deliver
        end
      end
      valid ? @post_key : false
    end

  end

  def update(key, posting_hash)
    data = TapsConnector.update_posting(key, posting_hash)
    result = ActiveSupport::JSON.decode(data)
    result["success"]
  end

  def self.categories
    Category.all.collect do |category|
      [category.category, category.code]
    end
  end

  def annotations=(annotations)
    @attributes[:annotations] = annotations || []
  end
 
  private

  def encode
    posting = "[{"+'source:'+"'#{self.source}'" + ',category:' + "'#{self.category}'" + ',location:' + "'#{self.location}'" + ',heading:' +  "#{ActiveSupport::JSON.encode self.heading}"  + ',timestamp: ' + "'#{(Time.now.utc.to_s(:db)).gsub("-","/")}'"  + ',externalID: ' + "'#{Time.now.to_i}'"
   
    posting <<  ',claimUserID:' + "#{ self.claimUserID }" if self.claimUserID
    posting <<  ',country:' + "'#{ self.country }'" if self.country
    posting <<  ',state:' + "'#{ self.state }'" if self.state
    posting <<  ',county:' + "'#{ self.county }'" if self.county
    posting <<  ',region:' + "'#{ self.region }'" if self.region
    posting <<  ',metro:' + "'#{ self.metro }'" if self.metro
    posting <<  ',city:' + "'#{ self.city }'" if self.city
    posting <<  ',locality:' + "'#{ self.locality }'"  if self.locality
    posting <<  ',zip:' + "'#{ self.zip }'" if self.zip
    unless @urls.blank?
      captions = {}
      images = []
      primary = @urls.values.collect{ |obj| obj['image'] if obj['primary'] && obj['uploaded'] }.compact[0]
      images = @urls.values.collect{ |obj| obj['image'] if obj['uploaded'] && !obj['primary'] }.compact
      images.unshift(primary) if primary
      posting << ',images:' + "[#{ images.collect{|i| "'#{i}'" }.join(',') }]"
      @urls.values.each_with_index{|url,i| captions.merge!({"caption#{i.to_s()}"=> url["caption"]})}
      self.annotations.merge!(captions)
    end
      if self.description.present?
      posting << ',body:' + "#{ActiveSupport::JSON.encode self.description}"
    end
    unless @anonymize
      posting << ',accountName:' + "'#{self.email}'"
    end
    if self.annotations
      annotations = []
      self.annotations.each{|k,v| annotations << "#{k}:" + "'#{v}'"}
      posting << ',annotations:' + "{#{annotations.join(',')}}"
    end
    posting  +  "}]"
  end

  def set_anonymization
    @anonymize = (self.anonymize_email == 'true' && self.email ) || self.privacy == Privacy::SEMI_ANONYMOUS
  end

  def encode_for_update
    data = []
  end
end
