class Verification < ActiveRecord::Base
  attr_accessible :email, :name, :verified

  validates_presence_of :email, :name

  before_create :create_hash

  private

  def create_hash
    self.secure_hash = Digest::MD5.hexdigest(Time.now.to_s + self.email + "anmfgdosdfjds")
  end

end
