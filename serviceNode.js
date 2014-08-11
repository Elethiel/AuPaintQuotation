var Service = require('node-windows').Service;

// Create a new service object
var svc = new Service({
  name:'Server Quotation AuPaintSpace',
  description: 'Web Server pour Au Paint Space.',
  script: 'C:\\aupaint\\quotation.js'
});

// Listen for the "install" event, which indicates the
// process is available as a service.
svc.on('install',function(){
  svc.start();
});

svc.install();
//svc.uninstall();