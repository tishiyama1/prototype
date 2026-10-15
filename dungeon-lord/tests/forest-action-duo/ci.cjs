const {chromium}=require('playwright'),path=require('path');
process.env.FOREST_QA_BROWSER=chromium.executablePath();
process.env.FOREST_QA_ARGS=JSON.stringify(['--no-sandbox','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader','--disable-accelerated-2d-canvas','--disable-http2']);
process.env.FOREST_QA_OUTPUT=process.env.FOREST_QA_OUTPUT||path.resolve('forest-action-duo/media/validation-local');
require('./browser.cjs');
