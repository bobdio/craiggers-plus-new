When "I click the status locations header" do
  page.execute_script("$('#statuslocations .header').click();")
end

When /^I click status location (\d+)$/ do |i|
  page.execute_script("$('#statuslocations .loc_1 :checkbox').eq(#{i.to_i-1}).click();")
end

When /^I take note of status location (\d+) and its count$/ do |i|
  @location = page.evaluate_script("$('#statuslocations .loc_1').eq(#{i.to_i-1}).find('.code').text();")
  @count = page.evaluate_script("$('#statuslocations .loc_1').eq(#{i.to_i-1}).find('.count').text();").to_i
end

Then /^the sum of the status location counts should equal the status count for "([^"]*)"$/ do |status|
  sleep(5) # the ajax / js sorting is slooooow
  location_count = page.evaluate_script("_.reduce($('#statuslocations .count'), function(memo, el) { return memo + parseInt($(el).text().replace(',','').replace(')', ''). replace('(', '')); }, 0);").to_i
  status_count = page.evaluate_script("parseInt($('#statuscounts .#{status} .count').text().replace(',',''));").to_i
  location_count.should == status_count
end

Then "status locations should be visible" do
  page.evaluate_script("$('#statuslocations').is(':visible');").should be(true)
end

Then "status locations should not be visible" do
  page.evaluate_script("$('#statuslocations').is(':visible');").should_not be(true)
end

Then "the current search location should be the status location I saw before" do
  page.evaluate_script("Craiggers.Search.get('location');").should == @location
end

Then "the result count should be the status location count I saw before" do
  page.evaluate_script("$('#postings .numresults .total').text();").to_i.should == @count
end

Then "the status locations should be sorted by count hight to low and alphabetically" do
  sleep(5) # the ajax / js sorting is slooooow
  page.evaluate_script("!$('#statuslocations .loc_1').not($('#statuslocations .loc_1').last().get(0)).filter(function() { var count = $(this).find('.count').text(); var c = $(this).next('.loc_1').find('.count').text(); if(count > c) return false; if(count === c) { if($(this).text() <= $(this).next('.loc_1').text()) return false; } return true; }).length").should be(true)
end
