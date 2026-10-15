process.env.FOREST_QA_OUTPUT=process.env.FOREST_QA_OUTPUT||process.cwd()+'/growth-evidence';
process.env.FOREST_QA_ARGS='["--enable-unsafe-swiftshader"]';require('./browser.cjs');
