# encoding: UTF-8
# This file is auto-generated from the current state of the database. Instead
# of editing this file, please use the migrations feature of Active Record to
# incrementally modify your database, and then regenerate this schema definition.
#
# Note that this schema.rb definition is the authoritative source for your
# database schema. If you need to create the application database on another
# system, you should be using db:schema:load, not running all the migrations
# from scratch. The latter is a flawed and unsustainable approach (the more migrations
# you'll amass, the slower it'll run and the greater likelihood for issues).
#
# It's strongly recommended to check this file into your version control system.

ActiveRecord::Schema.define(:version => 20220412091929) do

  create_table "authorizations", :force => true do |t|
    t.string   "provider"
    t.string   "uid"
    t.integer  "user_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "cats", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.string   "group"
    t.string   "category"
    t.boolean  "hidden",     :default => false
    t.integer  "originate",  :default => 0
    t.datetime "created_at",                    :null => false
    t.datetime "updated_at",                    :null => false
  end

  create_table "favorites", :force => true do |t|
    t.text     "json"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
    t.string   "username"
  end

  create_table "loc1s", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.integer  "location_id"
    t.string   "taps_code"
    t.string   "latlon"
    t.datetime "created_at",  :null => false
    t.datetime "updated_at",  :null => false
  end

  create_table "loc2s", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.integer  "loc1_id"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "locations", :force => true do |t|
    t.string   "full_name"
    t.string   "code"
    t.datetime "created_at",      :null => false
    t.datetime "updated_at",      :null => false
    t.string   "level"
    t.string   "short_name"
    t.float    "bounds_max_lat"
    t.float    "bounds_min_lat"
    t.float    "bounds_max_long"
    t.float    "bounds_min_long"
    t.integer  "parent_id"
  end

  add_index "locations", ["code"], :name => "index_locations_on_code"
  add_index "locations", ["level"], :name => "index_locations_on_level"
  add_index "locations", ["parent_id"], :name => "index_locations_on_parent_id"

  create_table "password_retrieve_requests", :force => true do |t|
    t.string   "user_id",    :null => false
    t.string   "token",      :null => false
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "postings", :force => true do |t|
    t.string   "source",       :limit => 50
    t.string   "category",     :limit => 50
    t.string   "account_id",   :limit => 50
    t.string   "heading"
    t.text     "body"
    t.integer  "price"
    t.string   "currency",     :limit => 50
    t.text     "images"
    t.text     "annotations"
    t.string   "status"
    t.datetime "created_at",                 :null => false
    t.datetime "updated_at",                 :null => false
    t.integer  "location_id"
    t.string   "username"
    t.string   "external_url"
    t.datetime "actual_date"
  end

  create_table "saved_searches", :force => true do |t|
    t.text     "json"
    t.string   "username"
    t.boolean  "send_notifications",                   :default => false
    t.string   "uniq_key",               :limit => 32
    t.string   "key",                    :limit => 32
    t.integer  "counter",                              :default => 0
    t.string   "secret_key"
    t.date     "unsubscribed"
    t.date     "deleted"
    t.string   "name"
    t.string   "timestamp_last_posting",               :default => "0"
    t.string   "subscription_id"
    t.integer  "interval"
    t.datetime "created_at"
    t.datetime "updated_at"
  end

  create_table "sessions", :force => true do |t|
    t.string   "session_id", :null => false
    t.text     "data"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  add_index "sessions", ["session_id"], :name => "index_sessions_on_session_id"
  add_index "sessions", ["updated_at"], :name => "index_sessions_on_updated_at"

  create_table "social_messages", :force => true do |t|
    t.text     "text"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

  create_table "sources", :force => true do |t|
    t.string   "code"
    t.string   "name"
    t.string   "logo_url"
    t.string   "logo_sm_url"
    t.boolean  "hidden",      :default => false
    t.datetime "created_at",                     :null => false
    t.datetime "updated_at",                     :null => false
  end

  create_table "subcats", :force => true do |t|
    t.string   "name"
    t.string   "code"
    t.integer  "cat_id"
    t.string   "group"
    t.string   "category"
    t.boolean  "hidden",     :default => false
    t.integer  "originate",  :default => 0
    t.datetime "created_at",                    :null => false
    t.datetime "updated_at",                    :null => false
  end

  create_table "users", :force => true do |t|
    t.string   "name"
    t.datetime "created_at", :null => false
    t.datetime "updated_at", :null => false
  end

end
