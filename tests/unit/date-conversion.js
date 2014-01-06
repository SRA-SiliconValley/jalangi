var x = new Date();
setTimeout(function () {
  var z = new Date() - x;
  console.log(String(z));
}, 1000);  
