const common = require('common');

(async function() {
    common.reloadTable();
    setInterval(common.reloadTable, 60000);
})();
