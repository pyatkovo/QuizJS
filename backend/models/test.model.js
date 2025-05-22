const TAFFY = require('taffy');
const tests = TAFFY(require('../data/tests.json'));

class TestModel {
    static async findAll() {
        return tests().get();
    }

    static async findOne(id) {
        return tests({id: parseInt(id)}).first();
    }
}

module.exports = TestModel;