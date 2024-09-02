const { exec } = require('child_process');


exec(`node ${__dirname}/generateRoutes.cjs`);
exec(`node ${__dirname}/generateCardList.cjs`);