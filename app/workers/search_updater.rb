class SearchUpdater
  @queue = :search_queue
  def self.perform(search_id)
    search = SavedSearch.find search_id
    options = ActiveSupport::JSON.decode search.json
    TapsConnector.search(options)
  end
end