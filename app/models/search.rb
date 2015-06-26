class Search <  Struct.new(:string, :location_code, :category_code, :source_code, :annotations)

  def self.from_hash(hash)
    Search.new(
      hash[:text],
      hash[:location],
      hash[:category],
      hash[:source],
      hash[:annotations]
    )
  end

end

