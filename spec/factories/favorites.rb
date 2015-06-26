Factory.sequence :postkey do |n|
  "POSTKEY#{n}"
end

Factory.define :expired_favorite, :class => Favorite do |f|
  f.postkey { Factory.next(:postkey) }
  f.heading "I am an expired favorited posting"
  f.utc "2011/06/14 15:37:00 UTC"
  f.price "500"
  f.path "TX > san antonio > services > financial"
end

Factory.define :old_expired_favorite, :class => Favorite do |f|
  f.postkey { Factory.next(:postkey) }
end

