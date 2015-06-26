class NameFieldForSavedSearches < ActiveRecord::Migration
  def up
    add_column :saved_searches, :name, :string

    SavedSearch.all.each do |record|
      begin
        data = ActiveSupport::JSON.decode record.json
        record.update_attributes name: data['name'].to_s
      rescue Exception => e
        record.update_attributes name: 'everything'
      end
    end
  end

  def down
    remove_column :saved_searches, :name
  end
end
