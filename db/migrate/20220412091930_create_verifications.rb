class CreateVerifications < ActiveRecord::Migration
  def change
    create_table :verifications do |t|
      t.string :name
      t.string :email
      t.string :secure_hash
      t.boolean :verified, default: false

      t.timestamps
    end
  end
end
