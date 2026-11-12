const test = require("node:test");
const assert = require("node:assert");
const { getMessage } = require("../src/index");

test("SIS should return the correct message", () => {
    assert.strictEqual(
        getMessage(),
        "Welcome to the Student Information System - Version 2.0!"
    );
});
