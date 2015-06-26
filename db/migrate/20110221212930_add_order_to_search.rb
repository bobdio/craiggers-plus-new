class AddOrderToSearch < ActiveRecord::Migration
  def self.up
    add_column :searches, :order, :string
  end

  def self.down
    remove_column :searches, :order
  end
end
