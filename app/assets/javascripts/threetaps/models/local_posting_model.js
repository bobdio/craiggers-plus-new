Craiggers.Models.LocalPosting = Craiggers.Models.Posting.extend({
  forTemplate: function() {
    var json = this.toJSON();
    json.local_posting = true;
    return json;
  }
})
