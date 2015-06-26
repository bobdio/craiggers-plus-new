module Utils
  class JsonParser
    def initialize(data)
      @data = data
    end

    def parse
      return [] if @data.blank? || @data.instance_of?(Array)
      YAML.load(@data).map do |item| 
        begin
          JSON.parse(item)
        rescue
          item
        end
      end
    end
  end
end
