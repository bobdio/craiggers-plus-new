#!/usr/bin/env ruby

require 'rubygems'
require 'nokogiri'

d = Nokogiri::HTML(File.open('categories.html').read)
File.open('categories.csv', 'w') do |f|
  d.css('.cat').each do |c|
    f.puts "#{c.at('.clickable').text},#{c.at('.code').text},"
    c.css('.subcat').each do |s|
      f.puts ",#{s.at('.clickable').text},#{s.at('.code').text}"
    end
    f.puts ",,"
    f.puts ",,"
  end
end

