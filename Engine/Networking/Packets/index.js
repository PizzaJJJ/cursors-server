const fileManager = require('../../Utilities/FileManager.js');

var buffer = [],
    i = 0;

fileManager.forAllFilesInDir(__dirname + '/packets', function(file) {
    if (fileManager.getFileExtension(file) == ".js") {

        buffer[i] = require('./packets/' + file);
        module.exports[buffer[i].getName()] = buffer[i];

        i++;
    }
});