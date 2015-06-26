class CreateTableSocialMessages < ActiveRecord::Migration
  def self.up
    create_table :social_messages do |t|
      t.text :text

      t.timestamps
    end
  end

  def self.down
    drop_table :social_messages
  end
end
