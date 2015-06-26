require 'json'

def community_json
  json = { 'community' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-community-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/date range
    json['community'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'date range' => cols[3].present?
    }})
  end
  return json
end

def personals_json
  json = { 'personals' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-personals-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/flavor/age
    json['personals'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'flavor' => cols[3].present?,
      'age' => cols[4].present?
    }})
  end
  return json
end

def housing_json
  json = { 'housing' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-housing-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/price/bedrooms/cats/dogs/category/sqft
    json['housing'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'price' => cols[3].present?,
      'bedrooms' => cols[4].present?,
      'cats' => cols[5].present?,
      'dogs' => cols[6].present?,
      'category' => cols[7].present?,
      'sqft' => cols[8].present?
    }})
  end
  return json
end

def for_sale_json
  json = { 'for-sale' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-for-sale-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/price/category
    json['for-sale'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'price' => cols[3].present?,
      'category' => cols[4].present?
    }})
  end
  return json
end

def services_json
  json = { 'services' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-services-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality
    json['services'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?
    }})
  end
  return json
end

def jobs_json
  json = { 'jobs' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-jobs-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/compensation/status/category
    json['jobs'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'compensation' => cols[3].present?,
      'status' => cols[4].present?,
      'category' => cols[5].present?
    }})
  end
  return json
end

def gigs_json
  json = { 'gigs' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-gigs-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/image/locality/compensation
    json['gigs'].push({ cols[0] => {
      'image' => cols[1].present?,
      'locality' => cols[2].present?,
      'compensation' => cols[3].present?
    }})
  end
  return json
end

def resumes_json
  json = { 'resumes' => [] }
  File.open("#{Rails.root}/lib/annotations/cl-annotations-resumes-data.csv", 'r').each_line do |row|
    cols = row.gsub(/\"/,'').split(",").collect { |c| c.strip }
    #sub/locality/category
    json['resumes'].push({ cols[0] => {
      'locality' => cols[1].present?,
      'category' => cols[2].present?
    }})
  end
  return json
end

task :generate_annotations_json do
  json = []
  json.push(community_json())
  json.push(personals_json())
  json.push(housing_json())
  json.push(for_sale_json())
  json.push(services_json())
  json.push(jobs_json())
  json.push(gigs_json())
  json.push(resumes_json())
  File.open("#{Rails.root}/public/json/annotations.json", 'w') { |f| f.write(JSON.pretty_generate(json)) }
end
