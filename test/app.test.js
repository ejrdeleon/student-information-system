const test = require("node:test");
const assert = require("node:assert");
const { getMessage } = require("../src/index");

test("SIS should return the correct message", () => {
    assert.strictEqual(
        getMessage(),
        "Student Information System is running!"
    );
});
