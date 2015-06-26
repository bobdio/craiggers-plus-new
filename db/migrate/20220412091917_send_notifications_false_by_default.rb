class SendNotificationsFalseByDefault < ActiveRecord::Migration
  def up
    change_column :saved_searches, :send_notifications, :boolean, default: false
  end

  def down
    change_column :saved_searches, :send_notifications, :boolean, default: true
  end
end
