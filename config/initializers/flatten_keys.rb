# see http://apidock.com/ruby/Net/HTTPHeader/set_form_data
# Adapted from http://snippets.dzone.com/posts/show/6776
class Hash
  def flatten_keys(newhash={}, keys=nil)
    self.each do |k, v|
      k = k.to_s
      keys2 = keys ? keys+"[#{k}]" : k
      if v.is_a?(Hash)
        v.flatten_keys(newhash, keys2)
      else
        newhash[keys2] = v
      end
    end
    newhash
  end
end
