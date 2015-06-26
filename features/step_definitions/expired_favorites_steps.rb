Then /^I should see (\d+) favorited postings$/ do |n|
  page.evaluate_script("$('#postings .posting.favorited').length").should == n.to_i
end

Then /^I should see (\d+) expired favorites notification$/ do |n|
  page.evaluate_script("$('.numresults .expired').is(':visible')").should be(true)
  page.evaluate_script("$('.numresults .expired .count').text()").should == n
end

Then /^I should see (\d+) expired favorited postings$/ do |n|
  page.evaluate_script("$('#postings .posting.favorited.expired').length").should == n.to_i
end
