class Favorite < ActiveRecord::Base

  def self.create_from_params(params, user)
    Favorite.create(:user => user, :postkey => params['postkey'], :path => params['path'], :heading => params['heading'], :price => params[:price], :utc => params[:utc])
  end

  def self.sweep(time = 1.hour)
    time = time.split.inject { |count, unit|
      count.to_i.send(unit)
    } if time.is_a?(String)
                 
    delete_all "(updated_at < '#{time.ago.to_s(:db)}' OR created_at < '#{2.days.ago.to_s(:db)}') AND user_id IS NULL"
  end
end
