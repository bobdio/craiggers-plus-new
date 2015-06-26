CraiggersPlus::Application.routes.draw do

  resources :profile do
    collection do
      get 'index'
      get 'change_block_option'
      post 'update'
      get 'identify'
      get 'unidentify'
    end
  end

  resources :settings do
    collection do
      get 'index'
      post 'update'
    end
  end

  resources :user do
    collection do
      get 'sign_up'
      get 'sign_in'
      post 'sign_up'
      post 'sign_in'
      get 'change_password_request'
      post 'change_password_request'
      get 'change_password'
      post 'change_password'
      get 'signedin'
      get 'get_notification_settings_for_posting'
      get 'favorites'
      get 'saved_searches'
      post 'location'
      get 'locations'
      post 'locations'
      get 'update_identities_data'
    end
  end

  resources :location, only: :show do
    collection do
      get 'get/:codes' => :get
      get 'search'
    end

    member do
      get 'children'
      get 'parent'
    end
  end

  resources :posting do
    collection do
      get 'comments'
      get 'comment'
    end
  end

  post '/profile/update'
  post '/settings//update'
  get "posting/index"
  get "posting/show"
  post "posting/favorite"
  post "posting/unfavorite"
  post "posting/mail"
  post "postings/files_upload"
  post "postings/save_details"
  post "postings/clear_details"
  post "postings/captcha"
  post "postings/craigslist"
  post "/postings/publish_posting"
  get "postings/craigslist"
  get "postings/get_details"
  post "postings/get_template"

  get "notification/create"

  post "search/save"
  delete "search/delete/:key" => 'search#delete'
  post "search/latest"
  get "search/previous"
  put "search/update/:key" => 'search#update'
  post "search/mail"
  get "search/off_notifications/:secret_key" => 'search#off_notifications', :as => 'unsubscribe_search'

  match "/categories" => "posting#categories"

  match '/auth/facebook/setup', :to => 'sessions#setup'
  match '/auth/:provider/callback' => 'sessions#create'
  match '/auth/failure' => redirect('/')
  match '/signout' => 'sessions#destroy'

  match "/terms-of-service" => "static#terms"
  match "/terms" => "static#terms"
  match "/mobile" => "static#mobile"
  match "/help" => "static#help"
  match "/faq" => "static#faq"
  match "/privacy" => "static#privacy"
  match "/notify" => "static#notify"
  match "/unsupported" => "static#unsupported", :as => :unsupported_browser
  get "widget/rentvalet"

  match "/data/*other" => redirect("/3taps-treevis/data/%{other}")

  match "/admin/:action", :controller => :admin
  get "/admin/saved_searches/(:sort_by/:direction)" => 'admin#saved_searches', as: :admin_saved_searches
  get "/admin/saved_searches/:id" => "admin#saved_search", as: :admin_saved_search

  get "/:uniq_key" => "search#open_by_uniq_key", as: :uniq_key
  root :to => "posting#index"
end
