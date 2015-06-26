class FileUpload
  attr_reader :errors, :captions, :urls, :formated_array_of_urls

  class StringProcessor
    def self.process(url, caption,index)
      self.new(url, caption,index).process
    end

    def initialize(url, caption,index)
      @url, @caption, @index = url, caption,index
      @error = nil
    end

    def process
      [@url, @caption, @error]
    end
  end

  class FileProcessor
    def self.process(url, caption,index)
      self.new(url, caption,index).process
    end

    def initialize(file, caption,index)
      @file, @caption, @index = file, caption,index
      @error = nil
      @url = nil
    end
   
    def process
      if @file.size <= Posting::UPLOADABLE_FILESIZE
        set_name
        if proper_extension?
          @url= resize_and_rename
          send_file_to_s3
        else
          @error = "Your image must be either a jpeg, gif or png"
        end
      else
        @error = "Photo cannot be bigger than 1 Mb."
      end
      [@url, @caption, @error]
    end
    private

    def generate_random_file_name!
      # first symbol should be letter, 65 is 'A'
      @name = (65 + rand(25)).chr + (Digest::SHA1.new << @name +  Time.now.to_s).hexdigest << "." + @ext
    end

    def send_file_to_s3
      AWS::S3::Base.establish_connection!(
        :access_key_id     => 'AKIAIHZUZW2V7FCGPEPA',
        :secret_access_key => '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'
      )
      AWS::S3::S3Object.store(@name, open(@local_path),Posting:: AMAZON_BUCKET, :access => :public_read)
    end

    def rename
      directory = "tmp/"
      generate_random_file_name!
      @local_path = File.join(directory, @name)
    end

    def resize
       File.open(@local_path, "w+") { |f| f.write(@file.read) }
#      file = Magick::Image.read(@local_path).first
#      file.crop_resized!(300, 200, Magick::NorthGravity)
#      file.write(@local_path)
    end

    def resize_and_rename
      rename
      resize
      Posting::AMAZON_SITE + Posting::AMAZON_BUCKET + '/' + @name
    end

    def proper_extension?
      @ext =~ /(jpeg|jpg|gif|png)/i
    end
      
    def set_name
      @name = @file.original_filename
      @ext = @name.split('.').last
      p @ext
    end

  end

  def initialize(params)
    @params = params
    @errors = []
    @urls = []
    @captions = []
    @formated_array_of_urls = []
    process
  end

  def process
    1.upto 10 do |i|
      @local_path = nil
      @index = i
      @current_photo = nil
      @current_caption = nil
      url, caption, error = processor.process(current_photo, current_caption,i)
      @errors << error
      if primary_photo?
        @urls.unshift url
        @captions.unshift caption
      else  
        @urls << url
        @captions << caption
      end
    end
  end

  def formated_arrays_of_urls_and_errors
    @urls.each_with_index do |url,i|
      hash = {}
      hash.merge!(:uploaded=>true) unless @urls[i].blank?
      hash.merge!({:image => url, :caption => @captions[i], :index=> i+1 })
      @formated_array_of_urls << hash
    end
    @errors.compact!
    @formated_array_of_urls[0].merge!(:primary => true) unless @formated_array_of_urls.blank?
    [@formated_array_of_urls,@errors]
  end
  private
  
  

  def processor
    if current_photo_string
      StringProcessor
    else
      FileProcessor
    end
  end

  def current_photo_blank?
    current_photo.blank?
  end

  def current_photo_string
    current_photo.class == String or current_photo == nil

  end

  def current_photo
    @current_photo ||= @params[photo_index]
  end

  def current_caption
    @current_caption ||= @params[caption_index]
  end

  def photo_index
    "step4-photo" + @index.to_s
  end

  def caption_index
    "step4-photo-caption" + @index.to_s
  end

  def primary_photo?
    @params["primary-photo"].to_i == @index
  end

  def add_to_urls_captions(str)
    if primary_photo?
      @urls.unshift str
      @captions.unshift current_caption
    else
      @urls << str
      @captions << current_caption
    end
  end

end
