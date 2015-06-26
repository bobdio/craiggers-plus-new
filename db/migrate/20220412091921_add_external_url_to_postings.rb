class AddExternalUrlToPostings < ActiveRecord::Migration
  def change
    add_column :postings, :external_url, :string
  end
end
