class AddSecretKeyToSavedSearch < ActiveRecord::Migration
  def change
    add_column :saved_searches, :secret_key, :string
    puts 'Generating secret keys'
    SavedSearch.find_each do |s|
      s.generate_secret_key!
      s.save
      putc '.'
    end
    puts 'Done'
  end
end
