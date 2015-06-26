#!/usr/bin/env ruby

require 'rubygems'
require 'nokogiri'

d = Nokogiri::HTML(File.open('locations.html').read)
File.open('locations.csv', 'w') do |f|
  d.css('.country').each do |c|
    f.puts "#{c.at('.clickable').text},#{c.at('.code').text},,,"
    c.css('.state').each do |s|
      f.puts ",#{s.at('.clickable').text},#{s.at('.code').text},,"
      s.css('.city').each do |i|
        f.puts ",,#{i.at('.clickable').text},#{i.at('.code').text},"
        i.css('.sub').each do |u|
          f.puts ",,,#{u.at('.clickable').text},#{u.at('.code').text}"
        end
      end
      f.puts ",,,,"
    end
    f.puts ",,,,"
    f.puts ",,,,"
  end
end


