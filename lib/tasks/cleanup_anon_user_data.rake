task :cleanup_anon_user_data => :environment do
  
  Session.sweep("1 hour")
  Favorite.sweep("1 day")
  SavedSearch.sweep("1 day")

end
  
