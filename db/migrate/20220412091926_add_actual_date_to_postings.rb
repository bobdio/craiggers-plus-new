class AddActualDateToPostings < ActiveRecord::Migration
  def change
    add_column :postings, :actual_date, :timestamp
  end
end
