# Rails.application.config.middleware.use OmniAuth::Builder do
#   #provider :twitter, 'CONSUMER_KEY', 'CONSUMER_SECRET'
#   provider :twitter, 't8xe3WMElH72RQsZP5IWA', 'dXAWlX8HOhZZ2OQdTcyzXlvMitqvJd1XqpRhy4cbvVE'
# 
#   # google login
#   # http://blog.sethladd.com/2010/10/rails-ruby-rack-openid-via-omniauth.html
#   provider :openid, nil, :name => 'google', :identifier => 'https://www.google.com/accounts/o8/id'
# 
#   # provider :linkedin
#   provider :linked_in, 't6hdZlL9dvc9qmshb-GdYldy40T8tVILzcNDqJd9NvGX-z7hNdH7i3srezuRoMpZ', 'MM0DpmnKNgrJxPzcShncIkyF1uMKQgONYWQLWlMT2Ruqw_1PS6OVHz6qtqyVtHEM'
# 
#   # <PyotrK(11-10-10)>: See
#   # https://github.com/intridea/omniauth/wiki/Dynamic-Providers
#   # for more details
#   provider :facebook, nil, nil, :setup => true
# 
# end