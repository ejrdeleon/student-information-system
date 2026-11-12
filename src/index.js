const http = require("node:http");

function getMessage() {
    return "Student Information System is running!";
}

const server = http.createServer((req, res) => {
    res.writeHead(200, {
        "Content-Type": "text/plain"
    });
    res.end(getMessage());
});

if (require.main === module) {
    server.listen(3000, "0.0.0.0", () => {
        console.log("SIS running on port 3000");
    });
}

module.exports = { getMessage };
