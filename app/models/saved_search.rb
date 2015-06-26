require "digest/md5"

class SavedSearch < ActiveRecord::Base
  self.per_page = 30
  before_create :generate_uniq_key, :generate_key, :generate_secret_key!, :set_name

  validates :secret_key, :uniqueness => true

  def self.sweep(time = 1.hour)
    time = time.split.inject { |count, unit|
      count.to_i.send(unit)
    } if time.is_a?(String)

    delete_all "(updated_at < '#{time.ago.to_s(:db)}' OR created_at < '#{2.days.ago.to_s(:db)}')"
  end

  def generate_key
    data = ActiveSupport::JSON.decode json
    self.key = Digest::MD5.hexdigest(data['params'].to_s)
  end

  def set_name
    data = ActiveSupport::JSON.decode json
    self.name = data['name']
  end

  def generate_uniq_key
    str = json + Time.now.to_s

    (3..31).map do |length|
      code = Digest::MD5.hexdigest(str)[0..length]
      next if SavedSearch.find_by_uniq_key(code)
      self.uniq_key = code
      break
    end
  end

  def generate_secret_key!
    while SavedSearch.find_by_secret_key(self.secret_key = SecureRandom.urlsafe_base64)
      next
    end

    self.secret_key
  end

  def set_deleted
    update_attributes( deleted: Time.now, send_notifications: false )
  end

  def update_by_params(options)
    data = ActiveSupport::JSON.decode json
    data['name'] = options[:name]
    data['email'] = options[:email]

    update = { name: data['name'], json: ActiveSupport::JSON.encode(data) }

    if options[:send_notifications]
      update.merge! send_notifications: true, unsubscribed: nil
    else
      update.merge! send_notifications: false, unsubscribed: Time.now
    end

    update_attributes update
  end
end
