class CreatePasswordRetrieveRequests < ActiveRecord::Migration
  def self.up
    create_table :password_retrieve_requests do |t|
      t.string :user_id, :null => false, :unique => true
      t.string :token, :null => false, :unique => true
      t.timestamps
    end
  end

  def self.down
    drop_table :password_retrieve_requests
  end
end
