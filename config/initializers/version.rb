#begin
#  f = File.open('version.txt')
#  data = f.read
#  VERSION = data.to_i
#rescue
#  VERSION = 0
#end