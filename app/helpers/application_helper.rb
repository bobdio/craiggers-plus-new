module ApplicationHelper

  def version_number
    if Rails.env == 'production'
      VERSION
    else
      "v.0.0.#{VERSION}"
    end
  end

  def popup_message
    if flash[:popup]
      content_tag(:div, flash[:popup], style: 'display: none', id: :popup_message)
    end
  end

  def flash_notice
    flash[:notice] if flash[:notice]
  end

  def flash_error
    flash[:error] if flash[:error]
  end

  def logo_tag
   image_tag current_domain['logo']['big']
  end

  def slogan_teg
    current_domain['slogan']
  end

  def message_tag
    get_app_settings[:social_message]
  end

  def title_or_entire
    haml_tag :div, :class => "group", :style => 'margin:0' do
      filter_radio("title only", "title_or_entire")
      filter_radio("entire post", "title_or_entire", true)
    end
  end

  def has_image
    haml_tag :div, :class => "group" do
      filter_checkbox("has image")
    end
  end

  def has_price
    haml_tag :div, :class => "group" do
      filter_checkbox("has price")
    end
  end

  def filter_checkbox(name)
    val = name.gsub(/\s/,'-')
    haml_tag :div, :class => 'result' do
      haml_tag :label do
        haml_tag :input, :type => "checkbox", :class => val, :value => val, :param => val
        haml_concat name
      end
      haml_tag :div, :class => 'count'
    end
  end

  def filter_checkboxes(names)
    names.each do |name|
      filter_checkbox(name)
    end
  end

  def filter_radio(name, group, checked=false)
    val = name.gsub(/\s/,'-')
    haml_tag :label do
      haml_tag :input, :type => "radio", :class => val, :name => group, :value => val, :param => val, :checked => checked
      haml_concat name
    end
  end

  def bedrooms_options
    (1..8).to_a.each do |br|
      haml_tag :option, :value => br do
        haml_concat "#{br} BR"
      end
    end
  end

  def handle_annotations_with_custom_label(label)
    custom_labels = {'partTime' => ' part-time'}
    custom_labels[label] || label
  end

end
