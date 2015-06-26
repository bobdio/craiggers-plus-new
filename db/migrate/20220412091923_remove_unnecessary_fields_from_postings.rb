class RemoveUnnecessaryFieldsFromPostings < ActiveRecord::Migration
  def change
    remove_column :postings, :external_id
    remove_column :postings, :timestamp
  end
end
