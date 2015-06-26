class CreateSubcats < ActiveRecord::Migration
  def self.up
    create_table :subcats do |t|
      t.string :name
      t.string :code
      t.references :cat

      t.timestamps
    end
  end

  def self.down
    drop_table :subcats
  end
end
