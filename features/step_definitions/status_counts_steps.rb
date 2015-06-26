When "I click the status counts header" do
  page.execute_script("$('#statuscounts .header').click();")
end

When /^I take note of the status count for "([^"]*)"$/ do |status|
  @status_count = page.evaluate_script("$('#statuscounts .#{status} .count').text();").to_i
end

When /^I click the "([^"]*)" status$/ do |status|
  page.execute_script("$('#statuscounts .#{status}').click();")
end

When "I click the status count clear link" do
  page.execute_script("$('#statusfilters .current .reset').click();")
end

Then "I should see status counts for lost, found, stolen, wanted" do
  page.evaluate_script("$('#statuscounts .type .count:empty').length;").should be(0)
end

Then "the result count should be the same status count I saw before" do
  page.evaluate_script("$('#postings .numresults .total').text();").to_i.should == @status_count
end

Then /^I should see "([^"]*)" for the current status$/ do |status|
  page.evaluate_script("$('#statusfilters .current').is(':visible');").should be(true)
  page.evaluate_script("!!$('#statusfilters .current').text().match('#{status}');").should be(true)
end
