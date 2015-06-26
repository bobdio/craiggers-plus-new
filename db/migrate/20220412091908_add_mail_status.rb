class AddMailStatus < ActiveRecord::Migration
  def up
    add_column :saved_searches, :send_notifications, :boolean, default: true
  end

  def down
    remove_column :saved_searches, :send_notifications
  end
end
