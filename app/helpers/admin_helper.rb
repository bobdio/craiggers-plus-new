module AdminHelper
  def sort_link(title, column)
    direction = 'desc'
    tag_direction = ''

    if @sort_by == column.to_s
      direction = 'asc' if @direction == direction
      tag_direction = content_tag(:div,'', class: @direction)
    end

    link_to(title, admin_saved_searches_path(column, direction), class: :title) +
    tag_direction
  end

  def format_date(date)
    format = "%Y-%m-%d %I:%M %p %Z"
    date.strftime(format) if date
  end 

  def date_from_to(param)
    return 'All' unless param.is_a? String
    date = param.split '..'
    format = "%Y-%m-%d %I:%M %p %Z"
    from = Time.at(date[0].to_i).strftime(format)
    to = Time.at(date[0].to_i).strftime(format)
    "#{from} to #{to}"
  end

  def price(param)
    return 'All' unless param.is_a? String
    price = param.split '..'
    "#{price[0]}$ to #{price[1]}$"
  end

  def category_by_code(code)
    return 'All' if code.nil?

    cat = Cat.find_by_code code
    cat = Subcat.find_by_code code if cat.nil?
    if cat
      cat.name
    else
      'All'
    end
  end
end
