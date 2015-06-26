class CreatePostings < ActiveRecord::Migration
  def change
    create_table :postings do |t|
      t.string :source, limit: 50
      t.string :category, limit: 50
      t.text :location
      t.string :account_id, limit: 50
      t.string :external_id, limit: 50
      t.string :heading
      t.text :body
      t.string :timestamp, limit: 50
      t.integer :price
      t.string :currency, limit: 50
      t.text :images
      t.text :annotations
      t.string :status

      t.timestamps
    end
  end
end
