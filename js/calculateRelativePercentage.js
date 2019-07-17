function calculateRelativePercentage() {
  // get starting values
  totalRelChangeImp = [];
  totalRelChangeExp = [];
  var totalStartImp = 0;
  var totalStartExp = 0;
  var lookupStart = ".0." + commodity;
  trade_data.forEach(function(cntryObj, cntryIndex) {
    totalStartImp += Object.byString(cntryObj, "import" + lookupStart);
    totalStartExp += Object.byString(cntryObj, "export" + lookupStart);
  })
  
  // get value for each of 49 months
  var totalImpNow, totalExpNow, lookupNow, percChange;
  for(var i = 0; i < numMonths; i++) {
    lookupNow = "." + i + "." + commodity;
    totalImpNow = 0;
    totalExpNow = 0;
    trade_data.forEach(function(cntryObj, cntryIndex) {
      totalImpNow += Object.byString(cntryObj, "import" + lookupNow);
      totalExpNow += Object.byString(cntryObj, "export" + lookupNow);
    })
    totalRelChangeImp.push(100 * ((totalImpNow - totalStartImp) / totalStartImp));
    totalRelChangeExp.push(100 * ((totalExpNow - totalStartExp) / totalStartExp));    
  }
}