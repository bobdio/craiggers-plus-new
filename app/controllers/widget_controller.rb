class WidgetController < ActionController::Base

  def rentvalet
    @rentvaletProperty = {}
    @rentvaletProperty[:id] = '7pA8SGnKKVGBXdNbtvFyhj7qe33kbtjJ'
    @rentvaletProperty[:contact] = params[:contact]
    @rentvaletProperty[:contact_type] = 'email'
    @rentvaletProperty[:address] = params[:address]
    @rentvaletProperty[:rent] = params[:rent]
    @rentvaletProperty[:url] = params[:url]
    render
  end
end
