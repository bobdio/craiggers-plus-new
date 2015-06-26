class APIUser < Hashie::Mash

  def has_identity?(provider)
    identities.any?{ |i| i.provider == provider }
  end

  def update_from_api
    self.update(UserAPI.update(self.id,{}))
  end

  def unsave_search(key)
    if search = SavedSearch.find_by_secret_key(key)
      #self.update_from_api
      search.set_deleted
    end
  end

  def searches
    SavedSearch.where username: self.username, deleted: nil
  end

  def favorite(posting)
    Favorite.where(username: self.username, json: posting).first_or_create
  end

  def unfavorite(posting)
    h = ActiveSupport::JSON.decode posting
    if f = Favorite.where("json LIKE '%\"heading\":\"#{h['extra']['heading']}\"%'").find_by_username(self.username)
      f.destroy
    end
  end

  def favorites
    Favorite.where username: self.username
  end

  def public_identities
    identities#.select{ |i| !(i.provider =~ /google/i) } # hiding google login
  end

  def public_identities?
    self.public_identities.any?
  end

  def identity_for(provider)
    identities.detect{ |i| i.provider == provider }
  end

  def add_message(post_key, partnerID, text)
    SocialAPI.message(self.id, partnerID, post_key, text)
  end

  def add_reply(post_key, ownerID, text)
    SocialAPI.message(self.id, ownerID, post_key, text)
  end

  def list_active_conversations
    SocialAPI.messages(id)
  end

end
