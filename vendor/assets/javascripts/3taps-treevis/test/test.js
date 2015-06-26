var client = new threeTapsSearchClient(THREETAPS_KEY);

/*
client.search({
  text: "mountain bike"
}, function(data) {
  console.log(data);
});
*/

client.summary({
  dimension: "3taps_category",
//  text: "mountain bike",
  codes: "forsale"
}, function(data) {
  console.log(data);
});


client.client.reference.category(function(data) {
  data.forEach(function(d) {
    (d.annotations || []).forEach(function(a) {
      (a.options || []).forEach(function(o) {
        if (o.subannotation) console.log(o);
      });
      if (/loc/.test(a.name.toLowerCase())) console.log(d);
    });
  });
});

/*
client.range({
  text: 'air jordan',
  source: 'craig',
  fields: 'price'
}, function(range) {
  console.log(range);
});
*/
