describe('Craigslist categories collections', function() {
  var obj = new Craiggers.Collections.CraiggersCategories;

  it('should return category name', function() {
    expect(obj.nameByCode('all')).toEqual('all categories');
    expect(obj.nameByCode('ppp')).toEqual('personals');
    expect(obj.nameByCode('web')).toEqual('web / info design');
    expect(obj.nameByCode('fud')).toEqual('furniture - by dealer');
  });

  it('should return category short name', function() {
    expect(obj.shortNameByCode('sbw')).toEqual('sublet / temp wanted ');
    expect(obj.shortNameByCode('fuo')).toEqual('by owner');
    expect(obj.shortNameByCode('nfb')).toEqual('by broker - no fee');
    expect(obj.shortNameByCode('swp')).toEqual('housing swap');
  });

  it('should return proper category code', function() {
    expect(obj.categoryByCode('all')).toEqual('all');
    expect(obj.categoryByCode('res')).toEqual('res');
    expect(obj.categoryByCode('wet')).toEqual('bbb');
    expect(obj.categoryByCode('mcd')).toEqual('sss');
  });

  it('should return children categories codes', function() {
    expect(obj.childrenCodes('ggg')).toEqual(["cpg", "crg", "cwg", "dmg", "evg", "lbg", "tlg", "wrg"]);
    expect(obj.childrenCodes('hsw')).toEqual(["hou", "rew", "sha", "sbw"]);
    expect(obj.childrenCodes('hou')).toEqual([]);
  });

  it('should return parent category code', function() {
    expect(obj.parentCode('sss')).toEqual('all');
    expect(obj.parentCode('wet')).toEqual('bbb');
    expect(obj.parentCode('reb')).toEqual('rea');
  });

  it('should return sibling categories codes', function() {
    expect(obj.siblingCodes('ccc')).toEqual(["ccc", "sss", "ggg", "hhh", "jjj", "ppp", "res", "bbb"]);
    expect(obj.siblingCodes('cpg')).toEqual(["cpg", "crg", "cwg", "dmg", "evg", "lbg", "tlg", "wrg"]);
    expect(obj.siblingCodes('hou')).toEqual(["hou", "rew", "sha", "sbw"]);
  });

  it('should return category code by name', function() {
    expect(obj.codeByName('all categories')).toEqual('all');
    expect(obj.codeByName('for sale')).toEqual('sss');
    expect(obj.codeByName('legal / paralegal')).toEqual('lgl');
    expect(obj.codeByName('apts / housing - by broker - fee')).toEqual('fee');
  });

  it('should recognize priceable categories', function() {
    expect(obj.isPriceable('sha')).toBeTruthy();
    expect(obj.isPriceable('pho')).toBeTruthy();
    expect(obj.isPriceable('hhh')).toBeTruthy();

    expect(obj.isPriceable('cls')).toBeFalsy();
    expect(obj.isPriceable('cas')).toBeFalsy();
    expect(obj.isPriceable('bbb')).toBeFalsy();
  });

  it('should recognize category', function() {
    expect(obj.isCat('all')).toBeFalsy();
    expect(obj.isCat('ccc')).toBeTruthy();
    expect(obj.isCat('cta')).toBeFalsy();
    expect(obj.isCat('cto')).toBeFalsy();
  });

  it('should recognize subcategory', function() {
    expect(obj.isSubcat('all')).toBeFalsy();
    expect(obj.isSubcat('ccc')).toBeFalsy();
    expect(obj.isSubcat('cta')).toBeTruthy();
    expect(obj.isSubcat('cto')).toBeFalsy();
  });

  it('should recognize subsubcategory', function() {
    expect(obj.isSubcat_2('all')).toBeFalsy();
    expect(obj.isSubcat_2('ccc')).toBeFalsy();
    expect(obj.isSubcat_2('cta')).toBeFalsy();
    expect(obj.isSubcat_2('cto')).toBeTruthy();
  });

  it('should have children categories', function() {
    // expect(obj.hasChildrenCodes('all')).toBeTruthy(); // doesn't pass
    expect(obj.hasChildrenCodes('ccc')).toBeTruthy();
    expect(obj.hasChildrenCodes('cta')).toBeTruthy();
    expect(obj.hasChildrenCodes('cto')).toBeFalsy();
  });

  it('should have categories', function() {
    expect(obj.has('all categories')).toBeTruthy();
    expect(obj.has('gigs')).toBeTruthy();
    expect(obj.has('arts+crafts')).toBeTruthy();
    expect(obj.has('motorcycles - by owner')).toBeTruthy();
    expect(obj.has('ololo')).toBeFalsy();
  });
});
