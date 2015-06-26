module PostingsHelper
  def show_annotations(annotations)
    result = ""
    annotations.each do |type, value|
      result << type + ": " + value + "<br/>"
    end if annotations.present?
    raw result
  end
end
