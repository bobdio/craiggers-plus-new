require "RMagick"

class FileUpload
  MESSAGES = {
    fail_ext: "Your image must be either a jpeg, gif or png",
    fail_size: "Photo cannot be bigger than 1 Mb."
  }

  attr_reader :urls, :error

  def initialize(params)
    @params = params
    @urls = {}
    @error = nil

    connect_to_aws
    process
  end

  def connect_to_aws
    AWS::S3::Base.establish_connection!(
      access_key_id: 'AKIAIHZUZW2V7FCGPEPA',
      secret_access_key: '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'
    )
  end

  def upload_to_aws(name, path)
    AWS::S3::S3Object.store name, open(path),
                                  Posting:: AMAZON_BUCKET,
                                  access: :public_read

    Posting::AMAZON_SITE + Posting::AMAZON_BUCKET + '/' + name
  end

  def upload_thumb_to_aws(name, path)
    thumb_name = 'thumb-' + name
    thumb_path = File.join("tmp/", thumb_name)

    thumb = Magick::Image.read(path).first
    thumb.crop_resized!(300, 200, Magick::NorthGravity)
    thumb.write(thumb_path)

    upload_to_aws thumb_name, thumb_path
  end

  def upload_image file
    return nil if file.blank?

    origin_name = file.original_filename
    ext = origin_name.split('.').last

    @error = MESSAGES[:fail_size] if file.size > Posting::UPLOADABLE_FILESIZE
    @error = MESSAGES[:fail_ext] unless ext =~ /(jpeg|jpg|gif|png)/i

    return false if @error

    name = ('a'..'z').to_a[rand 25]
    name << (Digest::SHA1.new << origin_name + Time.now.to_s).hexdigest
    name << ".#{ext}"

    path = File.join("tmp/", name)
    File.open(path, "wb") { |f| f.write(file.read) }

    @urls[:full] = upload_to_aws name, path
    @urls[:thumbnail] = upload_thumb_to_aws name, path
  end

  def process
    (1..4).each do |i|
      @index = i

      upload_image current_photo if current_photo.present?
    end
  end

private

  def current_photo
    @params["file-" + @index.to_s]
  end
end
