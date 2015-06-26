class AddUserToPostings < ActiveRecord::Migration
  def change
    add_column :postings, :username, :string
  end
end
