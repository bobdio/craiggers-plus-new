Given "I am an anonymous user" do
  @user = Factory(:user)
  User.stub(:find_by_id).and_return(@user)
end

Given /^the user has (\d+) expired favorited postings$/ do |n|
  n.to_i.times do
    @user.favorites << Factory(:expired_favorite)
  end
end

Given /^the user has (\d+) old expired favorited postings$/ do |n|
  n.to_i.times do
    @user.favorites << Factory(:old_expired_favorite)
  end
end

When "I start debugger" do
  debugger
  debugger
end

When "I view favorites" do
  page.execute_script("$('#favorites-link').click();")
end

When "I submit the search" do
  page.execute_script("$('#searchbar .form .search').click();")
end

When /^I favorite the first (\d+) postings$/ do |n|
  n.to_i.times do |i|
    page.execute_script("$('#postings .posting').eq(#{i}).find('.favorite').click();")
  end
end

When /^I unfavorite favorited posting (\d+)$/ do |i|
  page.execute_script("$('#postings .posting.favorited').eq(#{i}).find('.favorite').click();")
end

When /^I submit a search for "([^"]*)" in category "([^"]*)" in location "([^"]*)"$/ do |query, category, location|
  page.execute_script("$('#searchbar .query .input').val('#{query}').blur();")
  page.execute_script("$('#searchbar .category .input').val('#{category}').blur();")
  page.execute_script("$('#searchbar .location .input').val('#{location}').blur();")
  page.execute_script("$('#searchbar .form .search').click();")
end

Then "I should see postings" do
  page.evaluate_script("$('#postings .posting').length > 0").should be(true)
end

Then /^I should have (\d+) favorited postings$/ do |n|
  @user.favorites.count.should == n.to_i
end

Then /^the current search should be for "([^"]*)" with category code "([^"]*)" and location code "([^"]*)"$/ do |query, category, location|
  page.evaluate_script("Craiggers.Search.get('query');").should == query
  page.evaluate_script("Craiggers.Search.get('category');").should == category
  page.evaluate_script("Craiggers.Search.get('location');").should == location
end

Then /^the current search should not have "([^"]*)" annotation$/ do |annotation|
  page.evaluate_script("!!Craiggers.Search.get('params').status;").should_not be(true)
end

Then /^I wait (\d+) seconds$/ do |n|
  sleep(n.to_i)
end
